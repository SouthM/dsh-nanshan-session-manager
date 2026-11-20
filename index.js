/**
 * Host half of 【南山】会话管理助手.
 *
 * DSH deliberately has no session-deletion surface: session logs are an
 * append-only archive, and the shipped sidebar only archives them. This plugin
 * adds a local, explicitly destructive management surface on top of the same
 * on-disk layout:
 *
 *   $DSH_HOME/sessions/<project-key>/<encoded-session-id>/session.v4.jsonl.zstd
 *   $DSH_HOME/storages/session_projcache/sessions/<session-id>.json
 *
 * The JSON API is intentionally small and only listens on the authenticated
 * local Web server. Reads use ctx.sessionQuery when it is available; the
 * fallback scans the JSONL layout so the page still works in a minimal
 * composition.
 */
import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { copyFile, mkdir, open, readFile, readdir, rename, rm, rmdir, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { zstdDecompressSync } from 'node:zlib'

export const inject = ['webServer']

const API = '/api/nanshan-session-manager'
const SESSION_FORMAT = 4
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/
const LOG_NAME = /^session\.v(\d+)\.jsonl(\.zstd)?$/
const MAX_BODY_BYTES = 512 * 1024 * 1024
const MAX_SESSION_BYTES = 256 * 1024 * 1024
const MAX_IMPORT_SESSIONS = 500
const MAX_DELETE_SESSIONS = 500
const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])

export function apply(ctx) {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  const sessionsRoot = join(home, 'sessions')
  const cacheRoot = join(home, 'storages', 'session_projcache', 'sessions')
  const dataRoot = join(home, 'nanshan-session-manager')
  const titlesPath = join(dataRoot, 'titles.json')
  const trashRoot = join(dataRoot, 'trash')
  const rulesPath = join(dataRoot, 'rules.json')

  let titlesCache = null
  let rulesCache = null
  let mutationChain = Promise.resolve()
  let cachedCompression = null

  function service(name) {
    try {
      return ctx.get(name)
    } catch {
      return undefined
    }
  }

  function exclusive(task) {
    const next = mutationChain.then(task, task)
    mutationChain = next.then(
      () => undefined,
      () => undefined,
    )
    return next
  }

  async function loadTitles() {
    if (titlesCache !== null) return titlesCache
    let parsed
    try {
      parsed = JSON.parse(await readFile(titlesPath, 'utf8'))
    } catch (error) {
      titlesCache = {}
      return titlesCache
    }
    const source = parsed && typeof parsed === 'object' && parsed.titles && typeof parsed.titles === 'object' ? parsed.titles : {}
    const result = {}
    for (const [id, value] of Object.entries(source)) {
      if (!SAFE_ID.test(id) || !value || typeof value !== 'object') continue
      if (typeof value.title !== 'string' || value.title.trim() === '') continue
      result[id] = {
        title: value.title.trim().slice(0, 300),
        at: Number.isFinite(value.at) ? value.at : 0,
      }
    }
    titlesCache = result
    return titlesCache
  }

  async function saveTitles() {
    if (titlesCache === null) return
    await mkdir(dataRoot, { recursive: true })
    const temporary = `${titlesPath}.${process.pid}.${Date.now()}.tmp`
    const payload = { version: 1, titles: titlesCache }
    await writeFile(temporary, `${JSON.stringify(payload, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, titlesPath)
  }

  async function compression() {
    if (cachedCompression !== null) return cachedCompression
    let sawZstd = false
    let sawPlain = false
    try {
      const projects = await readdir(sessionsRoot, { withFileTypes: true })
      for (const project of projects) {
        if (!project.isDirectory()) continue
        let sessions
        try {
          sessions = await readdir(join(sessionsRoot, project.name), { withFileTypes: true })
        } catch {
          continue
        }
        for (const session of sessions) {
          if (!session.isDirectory()) continue
          let files
          try {
            files = await readdir(join(sessionsRoot, project.name, session.name), { withFileTypes: true })
          } catch {
            continue
          }
          for (const file of files) {
            if (!file.isFile()) continue
            const match = LOG_NAME.exec(file.name)
            if (match === null) continue
            if (match[2] === '.zstd') sawZstd = true
            else sawPlain = true
          }
        }
      }
    } catch {
      // A missing root is an empty store; zstd is the shipped default.
    }
    cachedCompression = sawPlain && !sawZstd ? 'none' : 'zstd'
    return cachedCompression
  }

  // ─────────────────────────────────────────────────────────────
  // Rule Manager persistence
  // ─────────────────────────────────────────────────────────────
  const RULE_SCOPES = new Set(['global', 'workspace', 'session'])
  const MAX_RULES_PER_SCOPE = 500
  const MAX_RULE_TITLE = 120
  const MAX_RULE_CONTENT = 10_000

  function uuidRule() {
    // Deterministic but unique enough id; crypto.randomUUID() when available.
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }

  async function loadRules() {
    if (rulesCache !== null) return rulesCache
    try {
      const raw = await readFile(rulesPath, 'utf8')
      const parsed = JSON.parse(raw)
      const rules = {}
      if (parsed && typeof parsed.rules === 'object' && parsed.rules !== null) {
        for (const [id, rule] of Object.entries(parsed.rules)) {
          if (!rule || typeof rule !== 'object') continue
          if (!RULE_SCOPES.has(rule.scope)) continue
          // Backward-compatible: accept both target (single) and targets (array)
          let targets = []
          if (Array.isArray(rule.targets)) {
            targets = rule.targets
              .map((t) => String(t).trim().slice(0, 1024))
              .filter(Boolean)
          } else if (rule.target) {
            targets = [String(rule.target).trim().slice(0, 1024)].filter(Boolean)
          }
          rules[id] = {
            id,
            title: String(rule.title || '').slice(0, MAX_RULE_TITLE),
            content: String(rule.content || '').slice(0, MAX_RULE_CONTENT),
            scope: rule.scope,
            targets,
            enabled: rule.enabled !== false,
            createdAt: Number(rule.createdAt) || Date.now(),
            updatedAt: Number(rule.updatedAt) || Date.now(),
          }
        }
      }
      rulesCache = rules
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        rulesCache = {}
      } else {
        throw error
      }
    }
    return rulesCache
  }

  async function saveRules(rules) {
    await mkdir(dataRoot, { recursive: true })
    const payload = JSON.stringify({ version: 1, rules }, null, 2)
    const tmpPath = `${rulesPath}.tmp`
    await writeFile(tmpPath, payload, 'utf8')
    await rename(tmpPath, rulesPath)
    rulesCache = rules
  }

  async function listRules() {
    const rules = await loadRules()
    return { rules }
  }

  function validateRuleInput(body) {
    const errors = []
    if (!body || typeof body !== 'object') {
      errors.push('invalid-payload')
      return { errors }
    }
    const title = String(body.title || '').trim()
    const content = String(body.content || '').trim()
    const scope = String(body.scope || '').trim()
    const rawTargets = Array.isArray(body.targets) ? body.targets : []
    const targets = rawTargets
      .map((t) => String(t).trim().slice(0, 1024))
      .filter(Boolean)

    if (!title) errors.push('title-empty')
    if (title.length > MAX_RULE_TITLE) errors.push('title-too-long')
    if (!content) errors.push('content-empty')
    if (content.length > MAX_RULE_CONTENT) errors.push('content-too-long')
    if (!RULE_SCOPES.has(scope)) errors.push('scope-invalid')
    if (scope !== 'global' && targets.length === 0) errors.push('targets-required')
    if (scope === 'global' && targets.length > 0) errors.push('targets-not-allowed')
    if (scope !== 'global' && targets.length > 20) errors.push('targets-too-many')

    return {
      errors,
      sanitized: {
        title: title.slice(0, MAX_RULE_TITLE),
        content: content.slice(0, MAX_RULE_CONTENT),
        scope,
        targets,
      },
    }
  }

  async function createRule(body) {
    const { errors, sanitized } = validateRuleInput(body)
    if (errors.length > 0) {
      const err = new Error(`rule-create: ${errors.join(',')}`)
      err.status = 400
      err.errors = errors
      throw err
    }
    const rules = await loadRules()
    const count = Object.keys(rules).filter((id) => rules[id].scope === sanitized.scope).length
    if (count >= MAX_RULES_PER_SCOPE) {
      const err = new Error(`rule-create: scope-limit`)
      err.status = 409
      throw err
    }
    const now = Date.now()
    const id = uuidRule()
    const enabled = body && typeof body.enabled === 'boolean' ? body.enabled : true
    const rule = {
      id,
      title: sanitized.title,
      content: sanitized.content,
      scope: sanitized.scope,
      targets: sanitized.targets,
      enabled,
      createdAt: now,
      updatedAt: now,
    }
    rules[id] = rule
    await saveRules(rules)
    return { rule }
  }

  async function updateRule(id, body) {
    const rules = await loadRules()
    if (!rules[id]) {
      const err = new Error(`rule-update: not-found`)
      err.status = 404
      throw err
    }
    const existing = rules[id]
    const patch = {}
    let updated = false

    if (body && typeof body === 'object') {
      if ('title' in body) {
        const title = String(body.title || '').trim()
        if (!title) {
          const err = new Error(`rule-update: title-empty`)
          err.status = 400
          throw err
        }
        patch.title = title.slice(0, MAX_RULE_TITLE)
        updated = true
      }
      if ('content' in body) {
        const content = String(body.content || '').trim()
        if (!content) {
          const err = new Error(`rule-update: content-empty`)
          err.status = 400
          throw err
        }
        patch.content = content.slice(0, MAX_RULE_CONTENT)
        updated = true
      }
      if ('scope' in body) {
        const scope = String(body.scope || '').trim()
        if (!RULE_SCOPES.has(scope)) {
          const err = new Error(`rule-update: scope-invalid`)
          err.status = 400
          throw err
        }
        patch.scope = scope
        updated = true
      }
      if ('targets' in body) {
        if (!Array.isArray(body.targets)) {
          const err = new Error(`rule-update: targets-invalid`)
          err.status = 400
          throw err
        }
        patch.targets = body.targets
          .map((t) => String(t).trim().slice(0, 1024))
          .filter(Boolean)
        if (patch.targets.length > 20) {
          const err = new Error(`rule-update: targets-too-many`)
          err.status = 400
          throw err
        }
        updated = true
      }
      if ('enabled' in body) {
        patch.enabled = body.enabled !== false
        updated = true
      }
    }

    // Scope vs targets consistency re-check
    const nextScope = patch.scope || existing.scope
    const nextTargets = patch.targets !== undefined ? patch.targets : existing.targets
    if (nextScope !== 'global' && (!Array.isArray(nextTargets) || nextTargets.length === 0)) {
      const err = new Error(`rule-update: targets-required`)
      err.status = 400
      throw err
    }
    if (nextScope === 'global' && Array.isArray(nextTargets) && nextTargets.length > 0) {
      const err = new Error(`rule-update: targets-not-allowed`)
      err.status = 400
      throw err
    }

    if (updated) {
      rules[id] = { ...existing, ...patch, updatedAt: Date.now() }
      await saveRules(rules)
    }
    return { rule: rules[id] }
  }

  async function deleteRule(id) {
    const rules = await loadRules()
    if (!rules[id]) {
      const err = new Error(`rule-delete: not-found`)
      err.status = 404
      throw err
    }
    const rule = rules[id]
    delete rules[id]
    await saveRules(rules)
    return { rule }
  }

  async function toggleRule(id, enabled) {
    const rules = await loadRules()
    if (!rules[id]) {
      const err = new Error(`rule-toggle: not-found`)
      err.status = 404
      throw err
    }
    rules[id].enabled = enabled !== false
    rules[id].updatedAt = Date.now()
    await saveRules(rules)
    return { rule: rules[id] }
  }

  async function buildList() {
    const records = await listRecords()
    const cache = await readProjectionCache()
    const titles = await loadTitles()
    const registry = service('workspaceRegistry')
    const workspaces = typeof registry?.list === 'function' ? registry.list() : []
    const workspaceByPath = new Map()
    for (const workspace of workspaces) {
      if (workspace && typeof workspace.path === 'string') workspaceByPath.set(normalizePath(workspace.path), workspace)
    }
    const archived = new Set(Array.isArray(registry?.archivedSessionIds) ? registry.archivedSessionIds : [])
    const pinned = new Set(Array.isArray(registry?.pinnedSessionIds) ? registry.pinnedSessionIds : [])
    const stored = service('sessions')
    const agents = service('agents')
    const live = new Set()
    if (stored && typeof stored.list === 'function') {
      for (const session of stored.list()) live.add(session.id)
    }
    await exclusive(() => settlePendingTrash())
    const trash = await listTrash()
    const trashedIds = new Set(trash.map((entry) => entry.id))

    const rows = []
    for (const record of records) {
      const header = record && record.header
      if (!header || typeof header.id !== 'string' || !SAFE_ID.test(header.id)) continue
      const id = header.id
      if (trashedIds.has(id)) continue
      const artifact = await resolveArtifact(record)
      let sizeBytes = 0
      let mtimeMs = 0
      let exists = false
      if (artifact !== null) {
        try {
          const info = await stat(artifact)
          sizeBytes = info.size
          mtimeMs = info.mtimeMs
          exists = true
        } catch {
          exists = false
        }
      }
      const cached = cache.get(id) || null
      const sidecar = titles[id] || null
      const title = firstText(cached?.title, sidecar?.title)
      const cwd = typeof header.cwd === 'string' && isAbsolute(header.cwd) ? header.cwd : null
      const workspace = cwd === null ? null : workspaceByPath.get(normalizePath(cwd)) || null
      const group = workspace
        ? {
            kind: 'workspace',
            id: workspace.id,
            title: workspace.title || basename(workspace.path),
            path: workspace.path,
          }
        : cwd === null
          ? { kind: 'none', id: 'ungrouped', title: '', path: null }
          : { kind: 'cwd', id: `cwd:${cwd}`, title: basename(cwd) || cwd, path: cwd }
      const updatedAt = Math.max(
        Number.isFinite(cached?.lastPromptAt) ? cached.lastPromptAt : 0,
        Number.isFinite(mtimeMs) ? mtimeMs : 0,
        Number.isFinite(header.createdAt) ? header.createdAt : 0,
      )
      rows.push({
        id,
        title,
        cwd,
        createdAt: Number.isFinite(header.createdAt) ? header.createdAt : 0,
        updatedAt,
        sizeBytes,
        exists,
        live: live.has(id) || record.live === true,
        running: Boolean(agents && typeof agents.get === 'function' && agents.get(id)?.status === 'running'),
        archived: archived.has(id),
        pinned: pinned.has(id),
        origin: header.origin === 'subagent' ? 'subagent' : 'user',
        parentSessionId: typeof header.parentSession === 'string' ? header.parentSession : null,
        agentPreset: typeof header.agentPreset === 'string' ? header.agentPreset : null,
        formatStatus: record.formatStatus === 'migration-required' ? 'migration-required' : 'current',
        workspace: workspace
          ? { id: workspace.id, title: workspace.title || basename(workspace.path), path: workspace.path }
          : null,
        group,
        path: artifact,
        turns: Number.isFinite(cached?.turns) ? cached.turns : 0,
        steps: Number.isFinite(cached?.steps) ? cached.steps : 0,
      })
    }

    rows.sort((left, right) => right.updatedAt - left.updatedAt || right.createdAt - left.createdAt)
    const groups = new Map()
    let totalBytes = 0
    let liveCount = 0
    let archivedCount = 0
    for (const row of rows) {
      totalBytes += row.sizeBytes
      if (row.live) liveCount += 1
      if (row.archived) archivedCount += 1
      const existing = groups.get(row.group.id)
      if (existing === undefined) {
        groups.set(row.group.id, { ...row.group, count: 1, bytes: row.sizeBytes })
      } else {
        existing.count += 1
        existing.bytes += row.sizeBytes
      }
    }

    return {
      ok: true,
      generatedAt: Date.now(),
      sessionRoot: sessionsRoot,
      sessions: rows,
      trash,
      workspaces: [...groups.values()].sort((left, right) => {
        if (left.kind === 'none') return 1
        if (right.kind === 'none') return -1
        return left.title.localeCompare(right.title)
      }),
      stats: {
        total: rows.length,
        groups: groups.size,
        live: liveCount,
        archived: archivedCount,
        trash: trash.length,
        bytes: totalBytes,
      },
    }
  }

  async function listRecords() {
    const query = service('sessionQuery')
    if (query && typeof query.listSessions === 'function') {
      try {
        const result = await query.listSessions()
        if (Array.isArray(result) && result.length > 0) return result
      } catch (error) {
        ctx.logger?.warn?.(`nanshan-session-manager: sessionQuery.listSessions failed: ${String(error)}`)
      }
    }
    const persistence = service('sessionPersistence')
    if (persistence && typeof persistence.list === 'function') {
      try {
        const result = await persistence.list()
        if (Array.isArray(result) && result.length > 0) return result
      } catch (error) {
        ctx.logger?.warn?.(`nanshan-session-manager: sessionPersistence.list failed: ${String(error)}`)
      }
    }
    return scanStoredRecords()
  }

  async function readProjectionCache() {
    const result = new Map()
    let names
    try {
      names = await readdir(cacheRoot)
    } catch {
      return result
    }
    for (const name of names) {
      if (!name.endsWith('.json') || name.includes('.bak.')) continue
      const id = name.slice(0, -5)
      if (!SAFE_ID.test(id)) continue
      try {
        const parsed = JSON.parse(await readFile(join(cacheRoot, name), 'utf8'))
        const rows = parsed?.record?.rows
        const title = typeof rows?.title?.val === 'string' ? rows.title.val.trim() : ''
        const metadata = rows?.sessionListMetadata?.val
        const stats = rows?.sessionStats?.val
        result.set(id, {
          title,
          lastPromptAt: Number.isFinite(metadata?.lastPromptAt) ? metadata.lastPromptAt : 0,
          turns: Number.isFinite(stats?.turns) ? stats.turns : 0,
          steps: Number.isFinite(stats?.steps) ? stats.steps : 0,
        })
      } catch {
        // A cache record is a shortcut, never the authority. Ignore bad rows.
      }
    }
    return result
  }

  async function scanStoredRecords() {
    const records = []
    let projects
    try {
      projects = await readdir(sessionsRoot, { withFileTypes: true })
    } catch {
      return records
    }
    for (const project of projects) {
      if (!project.isDirectory()) continue
      let sessions
      try {
        sessions = await readdir(join(sessionsRoot, project.name), { withFileTypes: true })
      } catch {
        continue
      }
      for (const session of sessions) {
        if (!session.isDirectory()) continue
        const artifacts = await listArtifacts(join(sessionsRoot, project.name, session.name))
        if (artifacts.length === 0) continue
        const chosen = artifacts[0]
        try {
          const header = await readHeader(chosen.path)
          if (header === null) continue
          records.push({
            header,
            live: false,
            persisted: true,
            formatStatus: chosen.version === SESSION_FORMAT ? 'current' : 'migration-required',
            location: { kind: 'jsonl', path: chosen.path },
          })
        } catch {
          // Unreadable logs are intentionally not advertised as sessions.
        }
      }
    }
    return records
  }

  async function resolveArtifact(record) {
    const header = record?.header
    if (!header || typeof header.id !== 'string') return null
    const location = record?.location
    if (location && typeof location.path === 'string' && await fileExists(location.path)) return location.path
    if (typeof header.cwd === 'string' && isAbsolute(header.cwd)) {
      const candidate = logPathFor(sessionsRoot, header.cwd, header.id, await compression())
      if (await fileExists(candidate)) return candidate
    }
    const found = await findArtifact(header.id)
    return found === null ? null : found.path
  }

  async function findArtifact(id) {
    if (!SAFE_ID.test(id)) return null
    const encoded = encodeSegment(id)
    let projects
    try {
      projects = await readdir(sessionsRoot, { withFileTypes: true })
    } catch {
      return null
    }
    for (const project of projects) {
      if (!project.isDirectory()) continue
      const directory = join(sessionsRoot, project.name, encoded)
      const artifacts = await listArtifacts(directory)
      if (artifacts.length > 0) return artifacts[0]
    }
    return null
  }

  async function buildBundle(ids) {
    const records = await listRecords()
    const byId = new Map()
    for (const record of records) {
      const id = record?.header?.id
      if (typeof id !== 'string' || !SAFE_ID.test(id)) continue
      byId.set(id, record)
    }
    const trashedIds = new Set((await listTrash()).map((entry) => entry.id))
    const requested = Array.isArray(ids) && ids.length > 0 ? [...new Set(ids)] : [...byId.keys()].filter((id) => !trashedIds.has(id))
    const cache = await readProjectionCache()
    const titles = await loadTitles()
    const stored = service('sessions')
    const items = []
    const skipped = []
    for (const id of requested) {
      if (!SAFE_ID.test(id)) {
        skipped.push({ id, reason: 'invalid' })
        continue
      }
      if (trashedIds.has(id)) {
        skipped.push({ id, reason: 'trashed' })
        continue
      }
      const record = byId.get(id)
      if (record === undefined) {
        skipped.push({ id, reason: 'missing' })
        continue
      }
      const artifact = await resolveArtifact(record)
      if (artifact === null) {
        skipped.push({ id, reason: 'missing' })
        continue
      }
      const live = stored && typeof stored.get === 'function' ? stored.get(id) : undefined
      if (live !== undefined && typeof stored.flush === 'function') {
        try {
          await stored.flush(live)
        } catch (error) {
          ctx.logger?.warn?.(`nanshan-session-manager: flush before export failed for ${id}: ${String(error)}`)
        }
      }
      let bytes
      try {
        bytes = await readFile(artifact)
      } catch (error) {
        skipped.push({ id, reason: 'unreadable' })
        continue
      }
      if (bytes.length > MAX_SESSION_BYTES) {
        skipped.push({ id, reason: 'too-large' })
        continue
      }
      const header = record.header
      const cached = cache.get(id) || null
      const sidecar = titles[id] || null
      const title = firstText(cached?.title, sidecar?.title)
      items.push({
        id,
        title,
        cwd: typeof header.cwd === 'string' ? header.cwd : null,
        createdAt: Number.isFinite(header.createdAt) ? header.createdAt : 0,
        encoding: artifact.endsWith('.zstd') ? 'zstd' : 'none',
        sha256: createHash('sha256').update(bytes).digest('hex'),
        bytes: bytes.length,
        data: bytes.toString('base64'),
      })
    }
    if (items.length === 0) {
      const error = new Error('没有可导出的会话。')
      error.status = 404
      error.skipped = skipped
      throw error
    }
    return {
      format: 'dsh-nanshan-session-bundle',
      version: 1,
      exportedAt: new Date().toISOString(),
      source: { home, sessionFormat: SESSION_FORMAT },
      sessions: items,
      skipped,
    }
  }

  async function importBundle(bundle) {
    if (!bundle || typeof bundle !== 'object' || bundle.format !== 'dsh-nanshan-session-bundle') {
      throw httpError(400, '这不是【南山】会话管理助手导出的备份文件。')
    }
    if (bundle.version !== 1) throw httpError(400, `不支持的备份版本：${String(bundle.version)}`)
    if (!Array.isArray(bundle.sessions)) throw httpError(400, '备份文件缺少 sessions 数组。')
    if (bundle.sessions.length > MAX_IMPORT_SESSIONS) throw httpError(413, `一次最多导入 ${MAX_IMPORT_SESSIONS} 个会话。`)

    const encoding = await compression()
    const registry = service('workspaceRegistry')
    const stored = service('sessions')
    const trashedIds = new Set((await listTrash()).map((entry) => entry.id))
    const imported = []
    const skipped = []
    const errors = []
    let totalBytes = 0

    for (const item of bundle.sessions) {
      const id = item && typeof item.id === 'string' ? item.id : ''
      if (!SAFE_ID.test(id)) {
        skipped.push({ id, reason: 'invalid-id' })
        continue
      }
      if (trashedIds.has(id)) {
        skipped.push({ id, reason: 'trashed' })
        continue
      }
      if (stored && typeof stored.get === 'function' && stored.get(id) !== undefined) {
        skipped.push({ id, reason: 'live' })
        continue
      }
      if (await findArtifact(id) !== null) {
        skipped.push({ id, reason: 'exists' })
        continue
      }
      if (typeof item.data !== 'string' || item.data.length === 0) {
        skipped.push({ id, reason: 'invalid-data' })
        continue
      }
      const itemEncoding = item.encoding === 'none' ? 'none' : 'zstd'
      if (itemEncoding !== encoding) {
        skipped.push({ id, reason: 'encoding-mismatch' })
        continue
      }
      let bytes
      try {
        bytes = Buffer.from(item.data, 'base64')
      } catch {
        skipped.push({ id, reason: 'invalid-data' })
        continue
      }
      if (bytes.length === 0) {
        skipped.push({ id, reason: 'invalid-data' })
        continue
      }
      if (bytes.length > MAX_SESSION_BYTES) {
        skipped.push({ id, reason: 'too-large' })
        continue
      }
      if (typeof item.sha256 === 'string' && item.sha256 !== '') {
        const digest = createHash('sha256').update(bytes).digest('hex')
        if (digest !== item.sha256) {
          skipped.push({ id, reason: 'checksum' })
          continue
        }
      }
      let header
      try {
        header = parseHeaderBytes(bytes, itemEncoding === 'zstd')
      } catch {
        skipped.push({ id, reason: 'invalid-log' })
        continue
      }
      if (header === null || header.id !== id || header.version !== SESSION_FORMAT) {
        skipped.push({ id, reason: 'invalid-log' })
        continue
      }
      if (header.cwd !== undefined && (typeof header.cwd !== 'string' || !isAbsolute(header.cwd))) {
        skipped.push({ id, reason: 'invalid-cwd' })
        continue
      }
      const cwd = header.cwd
      const directory = sessionDirFor(sessionsRoot, cwd, id)
      const target = join(directory, `session.v${SESSION_FORMAT}.jsonl${itemEncoding === 'zstd' ? '.zstd' : ''}`)
      try {
        await mkdir(directory, { recursive: true })
        await writeFile(target, bytes, { flag: 'wx', mode: 0o600 })
        totalBytes += bytes.length
        imported.push({ id, title: typeof item.title === 'string' ? item.title : '' })
        await removeCacheFile(id)
        if (typeof item.title === 'string' && item.title.trim() !== '') {
          const titles = await loadTitles()
          titles[id] = { title: item.title.trim().slice(0, 300), at: Date.now() }
        }
        if (registry) {
          try {
            if (typeof registry.unarchiveSession === 'function') await registry.unarchiveSession(id)
            if (typeof registry.unpinSession === 'function') await registry.unpinSession(id)
          } catch {
            // Archive/pin cleanup is best effort; the log import already succeeded.
          }
          if (cwd !== undefined && typeof registry.list === 'function') {
            const workspace = registry.list().find((candidate) => candidate && typeof candidate.path === 'string' && normalizePath(candidate.path) === normalizePath(cwd))
            if (workspace && typeof workspace.attachSession === 'function') {
              try {
                await workspace.attachSession(id)
              } catch (error) {
                ctx.logger?.warn?.(`nanshan-session-manager: attach imported session ${id} failed: ${String(error)}`)
              }
            }
          }
        }
      } catch (error) {
        await rm(directory, { recursive: true, force: true }).catch(() => undefined)
        errors.push({ id, message: error && error.message ? String(error.message) : '写入失败' })
      }
    }

    await saveTitles()
    return {
      imported: imported.length,
      bytes: totalBytes,
      sessions: imported,
      skipped,
      errors,
    }
  }

  async function deleteSessions(ids, options = {}) {
    const stopActive = options.stopActive === true
    const registry = service('workspaceRegistry')
    const stored = service('sessions')
    const agents = service('agents')
    const records = await listRecords()
    const byId = new Map()
    for (const record of records) {
      const id = record?.header?.id
      if (typeof id === 'string') byId.set(id, record)
    }
    const cache = await readProjectionCache()
    const titles = await loadTitles()
    const alreadyTrashed = new Set((await listTrash()).map((entry) => entry.id))
    const archived = new Set(Array.isArray(registry?.archivedSessionIds) ? registry.archivedSessionIds : [])
    const pinned = new Set(Array.isArray(registry?.pinnedSessionIds) ? registry.pinnedSessionIds : [])
    const deleted = []
    const trashIds = []
    const pending = []
    const skipped = []
    const errors = []
    let bytes = 0

    for (const rawId of ids) {
      const id = typeof rawId === 'string' ? rawId : ''
      if (!SAFE_ID.test(id)) {
        skipped.push({ id, reason: 'invalid-id' })
        continue
      }
      if (alreadyTrashed.has(id)) {
        skipped.push({ id, reason: 'trashed' })
        continue
      }
      let artifact = await findArtifact(id)
      if (artifact === null) {
        skipped.push({ id, reason: 'missing' })
        continue
      }
      const record = byId.get(id)
      let header = record && record.header ? record.header : null
      if (header === null) {
        try {
          header = await readHeader(artifact.path)
        } catch {
          header = null
        }
      }
      if (header === null) {
        skipped.push({ id, reason: 'invalid-log' })
        continue
      }
      const agent = agents && typeof agents.get === 'function' ? agents.get(id) : undefined
      const wasRunning = Boolean(agent && agent.status === 'running')
      const wasLive = Boolean(stored && typeof stored.get === 'function' && stored.get(id) !== undefined)
      const wasArchived = archived.has(id)
      const wasPinned = pinned.has(id)
      let info
      try {
        info = await stat(artifact.path)
      } catch (error) {
        errors.push({ id, message: error && error.message ? String(error.message) : '读取日志失败' })
        continue
      }
      const cached = cache.get(id) || null
      const title = firstText(cached?.title, titles[id]?.title)
      const updatedAt = Math.max(
        Number.isFinite(cached?.lastPromptAt) ? cached.lastPromptAt : 0,
        Number.isFinite(info.mtimeMs) ? info.mtimeMs : 0,
        Number.isFinite(header.createdAt) ? header.createdAt : 0,
      )
      const shared = {
        id,
        artifact: artifact.path,
        title,
        cwd: typeof header.cwd === 'string' ? header.cwd : null,
        createdAt: Number.isFinite(header.createdAt) ? header.createdAt : 0,
        updatedAt,
        sizeBytes: info.size,
        origin: header.origin === 'subagent' ? 'subagent' : 'user',
        agentPreset: typeof header.agentPreset === 'string' ? header.agentPreset : null,
        wasArchived,
        wasPinned,
        wasRunning,
      }

      if (wasLive) {
        if (!stopActive) {
          skipped.push({ id, reason: 'live', message: '会话正在使用中；请选择停止并删除。' })
          continue
        }
        let staged
        try {
          staged = await stagePendingTrash(shared)
        } catch (error) {
          errors.push({ id, message: error && error.message ? String(error.message) : '写入回收站失败' })
          continue
        }
        const archivedResult = await archiveSessionForDeletion(id)
        if (!archivedResult.ok) {
          await rm(staged.directory, { recursive: true, force: true }).catch(() => undefined)
          skipped.push({ id, reason: archivedResult.reason, message: archivedResult.message })
          continue
        }
        deleted.push(id)
        trashIds.push(staged.trashId)
        pending.push(id)
        continue
      }

      let staged
      try {
        staged = await stageTrash(shared)
      } catch (error) {
        errors.push({ id, message: error && error.message ? String(error.message) : '写入回收站失败' })
        continue
      }
      const removal = await removeSessionArtifact(id)
      if (!removal.ok) {
        await rm(staged.directory, { recursive: true, force: true }).catch(() => undefined)
        skipped.push({ id, reason: removal.reason, message: removal.message })
        continue
      }
      deleted.push(id)
      trashIds.push(staged.trashId)
      bytes += removal.bytes
    }

    await saveTitles().catch((error) => {
      ctx.logger?.warn?.(`nanshan-session-manager: save titles failed: ${String(error)}`)
    })
    return { deleted, trashIds, pending, bytes, skipped, errors }
  }

  async function listTrash() {
    const entries = []
    let directories
    try {
      directories = await readdir(trashRoot, { withFileTypes: true })
    } catch {
      return entries
    }
    for (const directory of directories) {
      if (!directory.isDirectory()) continue
      let manifest
      try {
        manifest = JSON.parse(await readFile(join(trashRoot, directory.name, 'manifest.json'), 'utf8'))
      } catch {
        continue
      }
      const entry = normalizeTrashEntry(manifest, directory.name)
      if (entry !== null) entries.push(entry)
    }
    entries.sort((left, right) => right.deletedAt - left.deletedAt)
    return entries
  }

  function normalizeTrashEntry(manifest, directoryName) {
    if (!manifest || manifest.version !== 1) return null
    if (typeof manifest.trashId !== 'string' || manifest.trashId !== directoryName || !SAFE_ID.test(manifest.trashId)) return null
    if (typeof manifest.id !== 'string' || !SAFE_ID.test(manifest.id)) return null
    const relativePath = typeof manifest.relativePath === 'string' ? manifest.relativePath : ''
    if (relativePath === '' || isAbsolute(relativePath)) return null
    const segments = relativePath.split(/[\\/]/)
    if (segments.includes('..') || segments.some((segment) => segment === '')) return null
    const logName = typeof manifest.logName === 'string' ? manifest.logName : ''
    if (logName === '' || basename(logName) !== logName || LOG_NAME.exec(logName) === null) return null
    const pending = manifest.pending === true
    const logFile = typeof manifest.logFile === 'string' ? manifest.logFile : ''
    if (logFile !== '' && basename(logFile) !== logFile) return null
    if (!pending && logFile === '') return null
    if (!Number.isFinite(manifest.deletedAt) || manifest.deletedAt < 0) return null
    return {
      trashId: manifest.trashId,
      id: manifest.id,
      title: typeof manifest.title === 'string' ? manifest.title.trim().slice(0, 300) : '',
      cwd: typeof manifest.cwd === 'string' ? manifest.cwd : null,
      createdAt: Number.isFinite(manifest.createdAt) ? manifest.createdAt : 0,
      updatedAt: Number.isFinite(manifest.updatedAt) ? manifest.updatedAt : 0,
      deletedAt: manifest.deletedAt,
      sizeBytes: Number.isFinite(manifest.sizeBytes) ? manifest.sizeBytes : 0,
      origin: manifest.origin === 'subagent' ? 'subagent' : 'user',
      agentPreset: typeof manifest.agentPreset === 'string' ? manifest.agentPreset : null,
      wasLive: manifest.wasLive === true,
      wasRunning: manifest.wasRunning === true,
      wasArchived: manifest.wasArchived === true,
      wasPinned: manifest.wasPinned === true,
      pending,
      relativePath,
      logName,
      logFile,
    }
  }

  async function stageTrash(input) {
    const trashId = randomUUID()
    const directory = join(trashRoot, trashId)
    const logFile = 'session.log'
    const directoryRelative = relative(sessionsRoot, dirname(input.artifact))
    if (!isInside(sessionsRoot, dirname(input.artifact))) throw new Error('会话目录不在会话根目录内。')
    try {
      await mkdir(directory, { recursive: true })
      await copyFile(input.artifact, join(directory, logFile), constants.COPYFILE_EXCL)
      const manifest = {
        version: 1,
        trashId,
        id: input.id,
        title: typeof input.title === 'string' ? input.title.trim().slice(0, 300) : '',
        cwd: typeof input.cwd === 'string' ? input.cwd : null,
        createdAt: Number.isFinite(input.createdAt) ? input.createdAt : 0,
        updatedAt: Number.isFinite(input.updatedAt) ? input.updatedAt : 0,
        deletedAt: Date.now(),
        sizeBytes: Number.isFinite(input.sizeBytes) ? input.sizeBytes : 0,
        origin: input.origin === 'subagent' ? 'subagent' : 'user',
        agentPreset: typeof input.agentPreset === 'string' ? input.agentPreset : null,
        wasLive: input.wasLive === true,
        wasRunning: input.wasRunning === true,
        wasArchived: input.wasArchived === true,
        wasPinned: input.wasPinned === true,
        pending: false,
        relativePath: directoryRelative.split('\\').join('/'),
        logName: basename(input.artifact),
        logFile,
      }
      await writeFile(join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
      return { trashId, directory, manifest }
    } catch (error) {
      await rm(directory, { recursive: true, force: true }).catch(() => undefined)
      throw error
    }
  }

  async function archiveSessionForDeletion(id) {
    const registry = service('workspaceRegistry')
    if (!registry || typeof registry.archiveSession !== 'function') return { ok: false, reason: 'no-archive' }
    try {
      await registry.archiveSession(id, { stopActivity: true })
      return { ok: true }
    } catch (error) {
      return { ok: false, reason: 'archive-failed', message: error && error.message ? String(error.message) : '归档并停止会话失败' }
    }
  }

  async function stagePendingTrash(input) {
    const trashId = randomUUID()
    const directory = join(trashRoot, trashId)
    const directoryRelative = relative(sessionsRoot, dirname(input.artifact))
    if (!isInside(sessionsRoot, dirname(input.artifact))) throw new Error('会话目录不在会话根目录内。')
    try {
      await mkdir(directory, { recursive: true })
      const manifest = {
        version: 1,
        trashId,
        id: input.id,
        title: typeof input.title === 'string' ? input.title.trim().slice(0, 300) : '',
        cwd: typeof input.cwd === 'string' ? input.cwd : null,
        createdAt: Number.isFinite(input.createdAt) ? input.createdAt : 0,
        updatedAt: Number.isFinite(input.updatedAt) ? input.updatedAt : 0,
        deletedAt: Date.now(),
        sizeBytes: Number.isFinite(input.sizeBytes) ? input.sizeBytes : 0,
        origin: input.origin === 'subagent' ? 'subagent' : 'user',
        agentPreset: typeof input.agentPreset === 'string' ? input.agentPreset : null,
        wasLive: true,
        wasRunning: input.wasRunning === true,
        wasArchived: input.wasArchived === true,
        wasPinned: input.wasPinned === true,
        pending: true,
        relativePath: directoryRelative.split('\\').join('/'),
        logName: basename(input.artifact),
        logFile: '',
      }
      await writeFile(join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
      return { trashId, directory, manifest }
    } catch (error) {
      await rm(directory, { recursive: true, force: true }).catch(() => undefined)
      throw error
    }
  }

  async function removeSessionArtifact(id) {
    const stored = service('sessions')
    if (stored && typeof stored.get === 'function' && stored.get(id) !== undefined) return { ok: false, reason: 'live' }
    const artifact = await findArtifact(id)
    if (artifact === null) return { ok: true, bytes: 0 }
    const directory = dirname(artifact.path)
    if (!isInside(sessionsRoot, directory) || basename(directory) !== encodeSegment(id)) return { ok: false, reason: 'unsafe-path' }
    let bytes = 0
    try {
      bytes = (await stat(artifact.path)).size
    } catch {
      // Size is informational.
    }
    const registry = service('workspaceRegistry')
    if (registry) {
      try {
        if (typeof registry.list === 'function') {
          for (const workspace of registry.list()) {
            if (!workspace || !Array.isArray(workspace.sessionIds)) continue
            if (!workspace.sessionIds.includes(id)) continue
            if (typeof workspace.detachSession === 'function') await workspace.detachSession(id)
            break
          }
        }
        if (typeof registry.unarchiveSession === 'function') await registry.unarchiveSession(id)
        if (typeof registry.unpinSession === 'function') await registry.unpinSession(id)
      } catch (error) {
        ctx.logger?.warn?.(`nanshan-session-manager: workspace cleanup failed for ${id}: ${String(error)}`)
      }
    }
    try {
      const project = dirname(directory)
      await rm(directory, { recursive: true, force: true })
      await rmdir(project).catch(() => undefined)
      await removeCacheFile(id)
      const titles = await loadTitles()
      delete titles[id]
      try {
        ctx.emit?.('api-session/removed', id)
      } catch {
        // The Client refreshes explicitly after a successful delete.
      }
      return { ok: true, bytes }
    } catch (error) {
      return { ok: false, reason: 'delete-failed', message: error && error.message ? String(error.message) : '删除失败' }
    }
  }

  async function settlePendingTrash() {
    const entries = await listTrash()
    let changed = false
    for (const entry of entries) {
      if (!entry.pending) continue
      const stored = service('sessions')
      if (stored && typeof stored.get === 'function' && stored.get(entry.id) !== undefined) continue
      const sourceDirectory = join(trashRoot, entry.trashId)
      if (!isInside(trashRoot, sourceDirectory)) continue
      const artifact = await findArtifact(entry.id)
      if (artifact === null) {
        const copied = join(sourceDirectory, 'session.log')
        if (await fileExists(copied)) {
          try {
            const manifestPath = join(sourceDirectory, 'manifest.json')
            const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
            manifest.pending = false
            manifest.logFile = 'session.log'
            manifest.settledAt = Date.now()
            await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
            changed = true
          } catch (error) {
            ctx.logger?.warn?.(`nanshan-session-manager: settle trash ${entry.trashId} failed: ${String(error)}`)
          }
        } else {
          await rm(sourceDirectory, { recursive: true, force: true }).catch(() => undefined)
          changed = true
        }
        continue
      }
      try {
        await rm(join(sourceDirectory, 'session.log'), { force: true })
        await copyFile(artifact.path, join(sourceDirectory, 'session.log'), constants.COPYFILE_EXCL)
      } catch (error) {
        ctx.logger?.warn?.(`nanshan-session-manager: copy pending trash ${entry.id} failed: ${String(error)}`)
        continue
      }
      const removal = await removeSessionArtifact(entry.id)
      if (!removal.ok) {
        await rm(join(sourceDirectory, 'session.log'), { force: true }).catch(() => undefined)
        continue
      }
      try {
        const manifestPath = join(sourceDirectory, 'manifest.json')
        const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
        manifest.pending = false
        manifest.logFile = 'session.log'
        manifest.settledAt = Date.now()
        manifest.sizeBytes = removal.bytes
        await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
        changed = true
      } catch (error) {
        ctx.logger?.warn?.(`nanshan-session-manager: finalize trash ${entry.trashId} failed: ${String(error)}`)
      }
    }
    if (changed) await saveTitles().catch(() => undefined)
  }

  async function restoreTrash(trashIds) {
    const entries = await listTrash()
    const byId = new Map(entries.map((entry) => [entry.trashId, entry]))
    const registry = service('workspaceRegistry')
    const stored = service('sessions')
    const restored = []
    const skipped = []
    const errors = []

    async function restoreArchiveState(entry) {
      if (!registry) return
      try {
        if (entry.wasArchived === true) {
          if (typeof registry.archiveSession === 'function') await registry.archiveSession(entry.id)
          return
        }
        if (typeof registry.unarchiveSession === 'function') await registry.unarchiveSession(entry.id)
        if (entry.wasPinned === true && typeof registry.pinSession === 'function') await registry.pinSession(entry.id)
      } catch (error) {
        ctx.logger?.warn?.(`nanshan-session-manager: restore workspace state ${entry.id} failed: ${String(error)}`)
      }
    }

    for (const rawTrashId of trashIds) {
      const trashId = typeof rawTrashId === 'string' ? rawTrashId : ''
      const entry = byId.get(trashId)
      if (entry === undefined) {
        skipped.push({ trashId, reason: 'missing' })
        continue
      }
      const sourceDirectory = join(trashRoot, entry.trashId)
      if (!isInside(trashRoot, sourceDirectory)) {
        skipped.push({ trashId, id: entry.id, reason: 'unsafe-path' })
        continue
      }
      const original = await findArtifact(entry.id)
      if (entry.pending && original !== null) {
        try {
          await restoreArchiveState(entry)
          await rm(sourceDirectory, { recursive: true, force: true })
          restored.push(entry.id)
        } catch (error) {
          errors.push({ trashId, id: entry.id, message: error && error.message ? String(error.message) : '恢复失败' })
        }
        continue
      }
      if (original !== null) {
        skipped.push({ trashId, id: entry.id, reason: 'exists' })
        continue
      }
      if (stored && typeof stored.get === 'function' && stored.get(entry.id) !== undefined) {
        skipped.push({ trashId, id: entry.id, reason: 'live' })
        continue
      }
      const targetDirectory = join(sessionsRoot, entry.relativePath)
      if (!isInside(sessionsRoot, targetDirectory) || basename(targetDirectory) !== encodeSegment(entry.id)) {
        skipped.push({ trashId, id: entry.id, reason: 'unsafe-path' })
        continue
      }
      const logFile = entry.logFile !== '' ? entry.logFile : 'session.log'
      const sourceLog = join(sourceDirectory, logFile)
      if (logFile === '' || !(await fileExists(sourceLog))) {
        skipped.push({ trashId, id: entry.id, reason: 'missing-log' })
        continue
      }
      try {
        await mkdir(targetDirectory, { recursive: true })
        await copyFile(sourceLog, join(targetDirectory, entry.logName), constants.COPYFILE_EXCL)
        await removeCacheFile(entry.id)
        if (entry.title !== '') {
          const titles = await loadTitles()
          titles[entry.id] = { title: entry.title, at: Date.now() }
        }
        if (registry) {
          await restoreArchiveState(entry)
          if (entry.cwd !== null && typeof registry.list === 'function') {
            const workspace = registry.list().find((candidate) => candidate && typeof candidate.path === 'string' && normalizePath(candidate.path) === normalizePath(entry.cwd))
            if (workspace && typeof workspace.attachSession === 'function') {
              try {
                await workspace.attachSession(entry.id)
              } catch (error) {
                ctx.logger?.warn?.(`nanshan-session-manager: attach restored session ${entry.id} failed: ${String(error)}`)
              }
            }
          }
        }
        await rm(sourceDirectory, { recursive: true, force: true })
        restored.push(entry.id)
      } catch (error) {
        errors.push({ trashId, id: entry.id, message: error && error.message ? String(error.message) : '恢复失败' })
      }
    }

    await saveTitles().catch(() => undefined)
    return { restored, skipped, errors }
  }

  async function purgeTrash(trashIds) {
    const entries = await listTrash()
    const byId = new Map(entries.map((entry) => [entry.trashId, entry]))
    const purged = []
    const skipped = []
    const errors = []
    for (const rawTrashId of trashIds) {
      const trashId = typeof rawTrashId === 'string' ? rawTrashId : ''
      const entry = byId.get(trashId)
      if (entry === undefined) {
        skipped.push({ trashId, reason: 'missing' })
        continue
      }
      const directory = join(trashRoot, entry.trashId)
      if (!isInside(trashRoot, directory)) {
        skipped.push({ trashId, reason: 'unsafe-path' })
        continue
      }
      if (entry.pending) {
        const stored = service('sessions')
        if (stored && typeof stored.get === 'function' && stored.get(entry.id) !== undefined) {
          skipped.push({ trashId, id: entry.id, reason: 'pending-live', message: '会话仍在使用中；重启 DSH 后可彻底删除。' })
          continue
        }
        const removal = await removeSessionArtifact(entry.id)
        if (!removal.ok) {
          skipped.push({ trashId, id: entry.id, reason: removal.reason, message: removal.message })
          continue
        }
      }
      try {
        await rm(directory, { recursive: true, force: true })
        purged.push(entry.id)
      } catch (error) {
        errors.push({ trashId, message: error && error.message ? String(error.message) : '彻底删除失败' })
      }
    }
    await saveTitles().catch(() => undefined)
    return { purged, skipped, errors }
  }

  async function removeCacheFile(id) {
    try {
      await rm(join(cacheRoot, `${id}.json`), { force: true })
    } catch {
      // Cache cleanup is best effort; the projection cache never owns the log.
    }
  }

  async function handler(request, response) {
    let url
    try {
      url = new URL(request.url || API, 'http://localhost')
    } catch {
      return sendJson(response, 400, { ok: false, error: 'bad-url', message: '无法解析请求地址。' })
    }
    const pathname = url.pathname
    try {
      // The Web server may be configured to listen beyond loopback. This
      // destructive surface is deliberately local-only even then.
      if (!isLoopbackRequest(request)) {
        return sendJson(response, 403, { ok: false, error: 'local-only', message: '会话管理接口只接受本机请求。' })
      }
      if (request.method === 'GET' || request.method === 'HEAD') {
        if (pathname === API) {
          if (request.method === 'HEAD') {
            response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            response.end()
            return
          }
          return sendJson(response, 200, await buildList())
        }
        if (pathname === `${API}/export`) {
          if (request.method === 'HEAD') {
            response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            response.end()
            return
          }
          const ids = readIds(url)
          const bundle = await buildBundle(ids)
          const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
          return sendDownload(response, `nanshan-sessions-${stamp}.json`, bundle)
        }
        if (pathname === `${API}/rules`) {
          if (request.method === 'HEAD') {
            response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            response.end()
            return
          }
          const result = await listRules()
          return sendJson(response, 200, { ok: true, ...result })
        }
        return sendJson(response, 404, { ok: false, error: 'not-found', message: '未知的会话管理接口。' })
      }

      if (request.method !== 'POST') {
        response.setHeader('allow', 'GET, HEAD, POST')
        return sendJson(response, 405, { ok: false, error: 'method', message: '请使用 GET 或 POST。' })
      }
      if (!sameOrigin(request)) {
        return sendJson(response, 403, { ok: false, error: 'origin', message: '拒绝跨站写入会话管理数据。' })
      }
      const body = await readJson(request)
      if (pathname === `${API}/import`) {
        const result = await exclusive(() => importBundle(body))
        return sendJson(response, 200, { ok: true, ...result })
      }
      if (pathname === `${API}/delete`) {
        const ids = Array.isArray(body?.ids) ? body.ids.slice(0, MAX_DELETE_SESSIONS) : []
        if (ids.length === 0) return sendJson(response, 400, { ok: false, error: 'ids', message: '请选择要删除的会话。' })
        const result = await exclusive(() => deleteSessions(ids, { stopActive: body?.stopActive === true }))
        return sendJson(response, 200, { ok: true, ...result })
      }
      if (pathname === `${API}/restore`) {
        const trashIds = Array.isArray(body?.trashIds) ? body.trashIds.slice(0, MAX_DELETE_SESSIONS) : []
        if (trashIds.length === 0) return sendJson(response, 400, { ok: false, error: 'trashIds', message: '请选择要恢复的会话。' })
        const result = await exclusive(() => restoreTrash(trashIds))
        return sendJson(response, 200, { ok: true, ...result })
      }
      if (pathname === `${API}/purge`) {
        const trashIds = Array.isArray(body?.trashIds) ? body.trashIds.slice(0, MAX_DELETE_SESSIONS) : []
        if (trashIds.length === 0) return sendJson(response, 400, { ok: false, error: 'trashIds', message: '请选择要彻底删除的会话。' })
        const result = await exclusive(() => purgeTrash(trashIds))
        return sendJson(response, 200, { ok: true, ...result })
      }
      if (pathname === `${API}/rules/create`) {
        const result = await exclusive(() => createRule(body))
        return sendJson(response, 200, { ok: true, ...result })
      }
      if (pathname === `${API}/rules/update`) {
        const id = body?.id ? String(body.id).trim() : ''
        if (!id) return sendJson(response, 400, { ok: false, error: 'id', message: '缺少规则 id。' })
        const result = await exclusive(() => updateRule(id, body))
        return sendJson(response, 200, { ok: true, ...result })
      }
      if (pathname === `${API}/rules/delete`) {
        const id = body?.id ? String(body.id).trim() : ''
        if (!id) return sendJson(response, 400, { ok: false, error: 'id', message: '缺少规则 id。' })
        const result = await exclusive(() => deleteRule(id))
        return sendJson(response, 200, { ok: true, ...result })
      }
      if (pathname === `${API}/rules/toggle`) {
        const id = body?.id ? String(body.id).trim() : ''
        if (!id) return sendJson(response, 400, { ok: false, error: 'id', message: '缺少规则 id。' })
        const enabled = body?.enabled !== false
        const result = await exclusive(() => toggleRule(id, enabled))
        return sendJson(response, 200, { ok: true, ...result })
      }
      return sendJson(response, 404, { ok: false, error: 'not-found', message: '未知的会话管理接口。' })
    } catch (error) {
      const status = error && Number.isInteger(error.status) ? error.status : 500
      if (status >= 500) ctx.logger?.warn?.(`nanshan-session-manager: ${error && error.stack ? error.stack : String(error)}`)
      return sendJson(response, status, {
        ok: false,
        error: status === 500 ? 'internal' : 'request',
        message: error && error.message ? String(error.message) : '会话管理请求失败。',
        ...(Array.isArray(error?.skipped) ? { skipped: error.skipped } : {}),
      })
    }
  }

  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: API, handler }),
    'nanshan-session-manager: session management api',
  )

  // Inject enabled rules into every agent step as durable instruction context.
  ctx.on('agent/pre-step', async (payload, next) => {
    const decision = await next()
    if (!decision || decision.kind === 'reject') return decision
    try {
      const agent = payload.agent
      const session = agent && agent.session
      const sessionId = session && session.id
      if (!sessionId) return decision

      const rules = await loadRules()
      const enabled = Object.values(rules).filter((rule) => rule.enabled)
      if (enabled.length === 0) return decision

      const cwd = await resolveAgentCwd(service, agent, payload.signal)
      const workspaceId = resolveWorkspaceId(service, cwd)
      const matched = enabled.filter((rule) => ruleMatches(rule, { sessionId, cwd, workspaceId }))
      if (matched.length === 0) return decision

      const digest = ruleContextDigest(matched)
      if (sessionHasRuleContext(session, digest)) return decision

      const batch = Array.isArray(decision.messages) ? decision.messages : []
      if (batch.some((message) => message && message.source
        && message.source.kind === RULE_SOURCE_KIND
        && message.source.digest === digest)) return decision

      // An empty first entry owns a no-step turn; keep context pending for the next real prompt.
      if (payload.step === 1 && batch.length === 0) return decision

      const message = {
        id: randomUUID(),
        role: 'user',
        content: [{ type: 'text', text: renderRuleContext(matched) }],
        source: { kind: RULE_SOURCE_KIND, digest },
      }
      return { ...decision, messages: [...batch, message] }
    } catch (error) {
      ctx.logger?.warn?.('nanshan-session-manager: rule injection failed: %o', error)
      return decision
    }
  })
}

const RULE_SOURCE_KIND = 'nanshan-rule-context'

async function resolveAgentCwd(service, agent, signal) {
  try {
    const workingDirectory = service('workingDirectory')
    if (workingDirectory && typeof workingDirectory.ensure === 'function') {
      const cwd = await workingDirectory.ensure(agent, signal)
      if (typeof cwd === 'string' && cwd !== '') return cwd
    }
  } catch {
    // Fall through to the session header when the provider is unavailable.
  }
  const header = agent && agent.session && agent.session.header
  const fallback = header && (header.cwd || header.directory)
  return typeof fallback === 'string' && fallback !== '' ? fallback : null
}

function resolveWorkspaceId(service, cwd) {
  if (!cwd) return null
  try {
    const registry = service('workspaceRegistry')
    if (!registry || typeof registry.list !== 'function') return null
    const list = registry.list()
    let best = null
    for (const workspace of Array.isArray(list) ? list : []) {
      const path = workspace && (workspace.path || workspace.directory)
      if (typeof path !== 'string' || path === '') continue
      if (cwd === path || cwd.startsWith(path.endsWith('/') ? path : `${path}/`)) {
        if (!best || path.length > best.path.length) best = { id: workspace.id, path }
      }
    }
    return best ? best.id : null
  } catch {
    return null
  }
}

function ruleMatches(rule, { sessionId, cwd, workspaceId }) {
  const targets = Array.isArray(rule.targets) ? rule.targets : []
  if (rule.scope === 'global') return true
  if (rule.scope === 'session') return targets.includes(sessionId)
  if (rule.scope === 'workspace') {
    if (workspaceId && targets.includes(workspaceId)) return true
    if (cwd) {
      return targets.some((target) => {
        if (typeof target !== 'string' || target === '') return false
        return cwd === target || cwd.startsWith(target.endsWith('/') ? target : `${target}/`)
      })
    }
  }
  return false
}

function ruleContextDigest(rules) {
  const payload = rules
    .map((rule) => `${rule.id}\u0000${rule.updatedAt}\u0000${rule.title}\u0000${rule.content}`)
    .join('\u0001')
  return createHash('sha256').update(payload).digest('hex').slice(0, 16)
}

function renderRuleContext(rules) {
  const body = rules.map((rule) => `## ${rule.title}\n\n${rule.content}`).join('\n\n')
  return [
    '<nanshan-rules>',
    '以下规则由用户在【南山】规则管理中启用，请在本会话的所有回复中遵守。',
    '若此前出现过 <nanshan-rules> 块，以本条为最新版本。',
    '',
    body,
    '</nanshan-rules>',
  ].join('\n')
}

function sessionHasRuleContext(session, digest) {
  if (!session) return false
  const surface = session.surface
  const nodes = surface && surface.nodes
  if (!nodes || typeof session.eventAt !== 'function') return false
  const seqs = Array.from(nodes)
  for (let index = seqs.length - 1; index >= 0; index -= 1) {
    const event = session.eventAt(seqs[index])
    const source = event && event.type === 'user/message' && event.data && event.data.source
    if (source && source.kind === RULE_SOURCE_KIND && source.digest === digest) return true
  }
  return false
}

function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function sendJson(response, status, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8')
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(body.length),
    'cache-control': 'no-store',
  })
  response.end(body)
}

function sendDownload(response, filename, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8')
  response.writeHead(200, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(body.length),
    'content-disposition': `attachment; filename="${filename}"`,
    'cache-control': 'no-store',
  })
  response.end(body)
}

function readIds(url) {
  const values = url.searchParams.getAll('ids')
  const ids = []
  for (const value of values) {
    for (const part of value.split(',')) {
      const id = part.trim()
      if (id !== '' && !ids.includes(id)) ids.push(id)
    }
  }
  return ids
}

function isLoopbackRequest(request) {
  const address = request.socket && request.socket.remoteAddress
  if (typeof address !== 'string' || address === '') return true
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

function sameOrigin(request) {
  const origin = request.headers.origin
  if (typeof origin !== 'string' || origin === '') return true
  try {
    return new URL(origin).host === request.headers.host
  } catch {
    return false
  }
}

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    const declared = Number(request.headers['content-length'])
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      reject(httpError(413, '请求内容过大。'))
      request.destroy()
      return
    }
    let size = 0
    const chunks = []
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(httpError(413, '请求内容过大。'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        if (text.trim() === '') return resolveBody(null)
        resolveBody(JSON.parse(text))
      } catch {
        reject(httpError(400, '请求内容不是有效的 JSON。'))
      }
    })
    request.on('error', reject)
  })
}

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return ''
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms))
}

function normalizePath(value) {
  if (typeof value !== 'string' || value === '') return ''
  return value.length > 1 ? value.replace(/[\\/]+$/, '') : value
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

function isInside(root, candidate) {
  const resolvedRoot = resolve(root)
  const resolvedCandidate = resolve(candidate)
  const relation = relative(resolvedRoot, resolvedCandidate)
  return relation !== '' && !relation.startsWith('..') && !isAbsolute(relation)
}

async function listArtifacts(directory) {
  let files
  try {
    files = await readdir(directory, { withFileTypes: true })
  } catch {
    return []
  }
  const artifacts = []
  for (const file of files) {
    if (!file.isFile()) continue
    const match = LOG_NAME.exec(file.name)
    if (match === null) continue
    const version = Number(match[1])
    if (!Number.isSafeInteger(version) || version < 0) continue
    artifacts.push({ path: join(directory, file.name), version })
  }
  artifacts.sort((left, right) => right.version - left.version || Number(right.path.endsWith('.zstd')) - Number(left.path.endsWith('.zstd')))
  return artifacts
}

async function readHeader(path) {
  let handle
  try {
    handle = await open(path, 'r')
    const buffer = Buffer.alloc(64 * 1024)
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    if (bytesRead === 0) return null
    try {
      return parseHeaderBytes(buffer.subarray(0, bytesRead), path.endsWith('.zstd'))
    } catch {
      // The first Zstd frame may carry the header together with a large first
      // batch. Fall back to a full read rather than dropping the session.
      const info = await stat(path)
      if (info.size > 256 * 1024 * 1024) return null
      return parseHeaderBytes(await readFile(path), path.endsWith('.zstd'))
    }
  } finally {
    if (handle !== undefined) await handle.close().catch(() => undefined)
  }
}

function parseHeaderBytes(bytes, compressed) {
  let text
  if (compressed || (bytes.length >= 4 && bytes.subarray(0, 4).equals(ZSTD_MAGIC))) {
    text = zstdDecompressSync(bytes).toString('utf8')
  } else {
    text = bytes.toString('utf8')
  }
  const line = text.split('\n', 1)[0].trim()
  if (line === '') return null
  let header
  try {
    header = JSON.parse(line)
  } catch {
    return null
  }
  if (!header || typeof header !== 'object' || Array.isArray(header)) return null
  if (header.type !== 'session' || header.version !== SESSION_FORMAT) return null
  if (typeof header.id !== 'string' || header.id === '') return null
  if (!Number.isSafeInteger(header.createdAt) || header.createdAt < 0) return null
  if (typeof header.isSeeded !== 'boolean') return null
  if (header.cwd !== undefined && typeof header.cwd !== 'string') return null
  return header
}

function encodeSegment(raw) {
  if (raw.length === 0) throw new Error('cannot encode an empty path segment')
  if (raw === '.') return '~002E'
  if (raw === '..') return '~002E~002E'
  let out = ''
  for (let index = 0; index < raw.length; index += 1) {
    const code = raw.charCodeAt(index)
    const character = String.fromCharCode(code)
    if (character !== '~' && /^[A-Za-z0-9._-]$/.test(character)) out += character
    else out += `~${code.toString(16).toUpperCase().padStart(4, '0')}`
  }
  return out
}

function projectKey(cwd) {
  if (cwd.length === 0) throw new Error('cannot encode an empty project path')
  let readable = ''
  let separatorRun = false
  for (let index = 0; index < cwd.length; index += 1) {
    const code = cwd.charCodeAt(index)
    const character = String.fromCharCode(code)
    if (character === '/' || character === '\\' || character === ':') {
      if (!separatorRun) readable += '-'
      separatorRun = true
    } else if (character !== '~' && /^[A-Za-z0-9._-]$/.test(character)) {
      readable += character
      separatorRun = false
    } else {
      readable += `~${code.toString(16).toUpperCase().padStart(4, '0')}`
      separatorRun = false
    }
  }
  return `--${(readable.replace(/^-+/, '') || 'root').slice(0, 251)}--`
}

function sessionDirFor(root, cwd, id) {
  const project = cwd === undefined ? join(root, '_no-cwd') : join(root, projectKey(cwd))
  return join(project, encodeSegment(id))
}

function logPathFor(root, cwd, id, compression) {
  const suffix = compression === 'none' ? '' : '.zstd'
  return join(sessionDirFor(root, cwd, id), `session.v${SESSION_FORMAT}.jsonl${suffix}`)
}
