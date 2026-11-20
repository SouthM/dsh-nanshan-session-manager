window.__ModuleLoader__.load({
  id: '@wangnanshan/dsh-nanshan-session-manager',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const PANEL_ID = 'nanshan-session-manager';
    const API = '/api/nanshan-session-manager';
    const NS = 'nanshan-session-manager';
    const PACKAGE_NAME = '@wangnanshan/dsh-nanshan-session-manager';
    const FILTERS = ['all', 'running', 'open', 'archived', 'subagent', 'pinned', 'migration'];
    const MODULES = [
      { id: 'session', key: 'module.session', icon: 'archive' },
      { id: 'rule',    key: 'module.rule',    icon: 'branch' },
    ];

    const RULE_SCOPES = ['global', 'workspace', 'session'];

    async function apiFetch(path, options = {}) {
      const response = await fetch(`${API}${path}`, {
        ...options,
        credentials: 'same-origin',
        headers: { accept: 'application/json', ...(options.headers || {}) },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        const err = new Error(data?.message || `HTTP ${response.status}`);
        err.status = response.status;
        throw err;
      }
      return data;
    }

    async function loadRulesApi() {
      const data = await apiFetch('/rules');
      return data.rules || {};
    }

    async function createRuleApi(rule) {
      const data = await apiFetch('/rules/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(rule),
      });
      return data.rule;
    }

    async function updateRuleApi(rule) {
      const data = await apiFetch('/rules/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(rule),
      });
      return data.rule;
    }

    async function deleteRuleApi(id) {
      const data = await apiFetch('/rules/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      return data.rule;
    }

    async function toggleRuleApi(id, enabled) {
      const data = await apiFetch('/rules/toggle', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      return data.rule;
    }

    const DICTIONARIES = {
      zh: {
        'nav.title': '【南山】会话管理助手',
        'page.title': '【南山】会话管理助手',
        'page.subtitle': '把本机所有会话收进一棵树：按状态筛选、按 ID 搜索、导出导入，删除后还能从回收站恢复。',
        'action.import': '导入会话',
        'action.importing': '正在导入…',
        'action.export': '导出',
        'action.exportAll': '导出全部',
        'action.exportSelected': '导出选中',
        'action.delete': '删除',
        'action.deleteSelected': '删除选中',
        'action.refresh': '刷新',
        'action.back': '返回对话',
        'action.open': '打开会话',
        'action.cancel': '取消',
        'action.confirmDelete': '移入回收站',
        'action.retry': '重新加载',
        'action.selectAll': '全选可见',
        'action.clearSelection': '清空选择',
        'action.expandAll': '全部展开',
        'action.collapseAll': '全部收起',
        'action.close': '关闭',
        'action.copyId': '复制会话 ID',
        'action.dismiss': '知道了',
        'action.copyPackage': '复制插件包名',
        'search.placeholder': '搜索会话 ID…',
        'search.clear': '清空搜索',
        'stats.total': '会话总数',
        'stats.live': '占用中',
        'stats.groups': '分组',
        'stats.size': '占用空间',
        'tree.title': '全部会话',
        'tree.ungrouped': '未分组',
        'tree.noPath': '未记录路径',
        'tree.count': '{n} 个会话',
        'tree.countOne': '1 个会话',
        'tree.monthCount': '{n} 个',
        'tree.emptyFiltered': '没有匹配的会话',
        'tree.emptyFilteredBody': '换一个关键词，或清空搜索查看全部。',
        'status.live': '进行中',
        'status.open': '已打开',
        'status.archived': '已归档',
        'status.subagent': '子代理',
        'status.pinned': '置顶',
        'status.migration': '待迁移',
        'untitled': '未命名会话',
        'empty.title': '还没有会话',
        'empty.body': '开始一段对话后，它会出现在这里；也可以导入之前导出的备份。',
        'empty.cta': '导入备份',
        'loading': '正在整理会话树…',
        'error.load': '没能读取会话列表。',
        'error.action': '操作失败，请稍后再试。',
        'selection.count': '已选 {n} 个',
        'selection.size': '共 {size}',
        'selection.hint': '使用中的会话也可以删除：会先停止并归档隐藏，日志在 DSH 重启后移除，期间可在回收站恢复。',
        'selection.none': '还没有选择会话',
        'selection.export': '导出这些会话',
        'selection.delete': '删除这些会话',
        'selection.liveBlocked': '选中的会话正在使用中，暂时不能删除。',
        'detail.title': '会话详情',
        'detail.empty': '点一条会话，在这里查看它的路径、时间与大小。',
        'detail.workspace': '工作区',
        'detail.path': '目录',
        'detail.created': '创建于',
        'detail.updated': '最近活动',
        'detail.size': '日志大小',
        'detail.id': '会话 ID',
        'detail.turns': '轮次',
        'detail.preset': '代理预设',
        'detail.noPath': '—',
        'import.title': '导入会话备份',
        'import.hint': '支持本插件导出的 .json 备份；可以一次选择多个文件，也可以直接拖进页面。',
        'import.drop': '松开以导入会话备份',
        'import.dropHint': '会话会写回它原来的工作区；重复的 ID 会自动跳过。',
        'import.reading': '正在读取备份…',
        'import.report': '导入结果',
        'import.imported': '已导入 {n}',
        'import.skipped': '跳过 {n}',
        'import.failed': '失败 {n}',
        'delete.title.one': '删除这个会话？',
        'delete.title.many': '删除这 {n} 个会话？',
        'delete.warning': '会话会先移入回收站，可随时恢复；只有彻底删除才会永久移除日志。使用中的会话会先停止并归档隐藏。',
        'delete.liveNote': '另有 {n} 个会话正在使用。',
        'delete.more': '还有 {n} 个…',
        'toast.exportStarted': '已开始导出备份',
        'toast.deleted': '已移入回收站：{n} 个会话',
        'toast.imported': '已导入 {n} 个会话',
        'toast.refreshed': '列表已刷新',
        'toast.openUnavailable': '暂时无法打开会话，请从左侧会话列表进入。',
        'toast.copied': '已复制',
        'toast.noExport': '没有可导出的会话。',
        'toast.partial': '完成，但有 {n} 项被跳过或失败。',
        'footer.storage': '会话目录',
        'footer.package': '插件包名：',
        'footer.note': '删除会先进入回收站；彻底删除才移除本机日志。',
        'view.sessions': '会话树',
        'view.trash': '回收站',
        'filter.label': '状态筛选',
        'filter.all': '全部',
        'filter.running': '进行中',
        'filter.open': '已打开',
        'filter.archived': '已归档',
        'filter.subagent': '子代理',
        'filter.pinned': '置顶',
        'filter.migration': '待迁移',
        'status.deleted': '已删除',
        'status.pendingDelete': '延迟删除',
        'trash.title': '回收站',
        'trash.count': '{n} 个已删除会话',
        'trash.countOne': '1 个已删除会话',
        'trash.empty': '回收站是空的',
        'trash.emptyBody': '删除的会话会先来到这里，可以恢复或彻底删除。',
        'trash.pending': '延迟删除',
        'trash.pendingPurge': '会话仍在使用，重启 DSH 后才能彻底删除。',
        'trash.pendingHint': '会话仍在使用：已从会话树和原生侧栏隐藏，日志会在 DSH 重启后移除。在此期间可以恢复。',
        'trash.deletedAt': '删除于',
        'trash.originalPath': '原目录',
        'trash.restore': '恢复',
        'trash.purge': '彻底删除',
        'trash.purgeTitle': '彻底删除这 {n} 个会话？',
        'trash.restoreSelected': '恢复选中',
        'trash.purgeSelected': '彻底删除选中',
        'trash.restoreHint': '恢复后回到原工作区；删除前已归档的会话会保持归档状态。',
        'trash.purgeHint': '彻底删除不会保留日志，无法恢复。',
        'trash.wasLive': '删除前使用中',
        'trash.wasRunning': '删除前进行中',
        'trash.wasArchived': '删除前已归档',
        'trash.detail': '已删除会话',
        'trash.deletedGroup': '{label} 删除',
        'action.restore': '恢复',
        'action.purge': '彻底删除',
        'action.undo': '撤销',
        'toast.movedToTrash': '已移入回收站：{n} 个会话',
        'toast.movedPending': '{n} 个使用中的会话已隐藏，重启 DSH 后移除日志',
        'toast.restored': '已恢复 {n} 个会话',
        'toast.purged': '已彻底删除 {n} 个会话',
        'delete.activeNote': '其中 {n} 个会话正在使用：会先停止当前工作并归档隐藏，日志将在 DSH 重启后移除。可随时从回收站恢复。',
        'delete.pendingNote': '这些会话已从会话树和原生侧栏隐藏，可在回收站恢复。',
        'delete.confirmStopDelete': '停止并删除',
        'search.trashPlaceholder': '搜索已删除会话的 ID…',
        'selection.trashHint': '恢复会回到原工作区；彻底删除后无法恢复。',
        'error.restore': '恢复会话失败。',
        'error.purge': '彻底删除失败。',
        'stats.trash': '回收站',
        'relative.justNow': '刚刚',
        'relative.minutes': '{n} 分钟前',
        'relative.hours': '{n} 小时前',
        'relative.days': '{n} 天前',
        'module.session': '会话管理',
        'module.session.desc': '浏览、筛选、导入导出和删除会话',
        'module.rule': '规则管理',
        'module.rule.desc': '管理 AI 助手行为规则与提示词',
        'module.rule.placeholder': '规则管理功能正在开发中…',
        'rule.title': '规则列表',
        'rule.titleMeta': '共 {total} 条 · {enabled} 启用',
        'rule.new': '新建规则',
        'rule.empty': '还没有任何规则',
        'rule.emptyBody': '规则可以在全局、工作区、单个会话范围内约束 AI 助手的行为。',
        'rule.emptyCta': '创建第一条规则',
        'rule.emptyFiltered': '当前筛选条件下没有规则',
        'rule.showMore': '展开',
        'rule.showLess': '收起',
        'rule.listColTitle': '标题',
        'rule.listColScope': '作用范围',
        'rule.listColTarget': '作用对象',
        'rule.listColUpdated': '最近更新',
        'rule.listColActions': '操作',
        'rule.scope.global': '全局',
        'rule.scope.globalHint': '作用于所有会话',
        'rule.scope.workspace': '工作区',
        'rule.scope.workspaceHint': '仅在指定工作区生效',
        'rule.scope.workspacePick': '选择工作区',
        'rule.scope.session': '会话',
        'rule.scope.sessionHint': '仅在指定会话生效',
        'rule.scope.sessionPick': '选择会话',
        'rule.picker.workspaceTitle': '选择工作区',
        'rule.picker.sessionTitle': '选择会话',
        'rule.picker.search': '搜索…',
        'rule.picker.empty': '暂无数据',
        'rule.picker.selected': '已选 {n} 项',
        'rule.filter.all': '全部规则',
        'rule.filter.enabled': '已启用',
        'rule.filter.disabled': '已禁用',
        'rule.filter.scope': '按作用范围',
        'rule.filter.scopeAll': '全部范围',
        'rule.filter.scopeGlobal': '全局',
        'rule.filter.scopeWorkspace': '工作区',
        'rule.filter.scopeSession': '会话',
        'rule.target.global': '—',
        'rule.toggleOn': '启用',
        'rule.toggleOff': '禁用',
        'rule.edit': '编辑',
        'rule.delete': '删除',
        'rule.deleteConfirmTitle': '删除规则？',
        'rule.deleteConfirmBody': '删除后无法恢复，确定要删除 "{title}" 吗？',
        'rule.form.newTitle': '新建规则',
        'rule.form.editTitle': '编辑规则',
        'rule.form.titleLabel': '规则标题',
        'rule.form.titlePlaceholder': '用一句话描述这条规则的作用',
        'rule.form.contentLabel': '规则内容',
        'rule.form.contentPlaceholder': '输入自然语言提示词或行为约束…',
        'rule.form.scopeLabel': '作用范围',
        'rule.form.targetLabel': '作用对象',
        'rule.form.targetPlaceholder': '选择或输入作用对象 ID',
        'rule.form.markdownHint': '规则内容支持 Markdown 格式（# 标题、**粗体**、- 列表、`代码` 等）',
        'rule.form.editMode': '编辑',
        'rule.form.previewMode': '预览',
        'rule.form.enabledLabel': '启用',
        'rule.form.save': '保存',
        'rule.form.cancel': '取消',
        'rule.form.delete': '删除',
        'rule.form.titleEmpty': '请填写规则标题',
        'rule.form.contentEmpty': '请填写规则内容',
        'rule.form.targetRequired': '作用范围为「{scope}」时必须指定作用对象',
        'rule.saved': '规则已保存',
        'rule.created': '规则已创建',
        'rule.deleted': '规则已删除',
        'rule.loadError': '规则加载失败',
        'rule.saveError': '规则保存失败',
      },
      en: {
        'nav.title': '【南山】Session Management Assistant',
        'page.title': '【南山】Session Management Assistant',
        'page.subtitle': 'Every session in one tree: filter by state, search by ID, export, import, and recover deleted sessions from Trash.',
        'action.import': 'Import',
        'action.importing': 'Importing…',
        'action.export': 'Export',
        'action.exportAll': 'Export all',
        'action.exportSelected': 'Export selected',
        'action.delete': 'Delete',
        'action.deleteSelected': 'Delete selected',
        'action.refresh': 'Refresh',
        'action.back': 'Back to conversation',
        'action.open': 'Open session',
        'action.cancel': 'Cancel',
        'action.confirmDelete': 'Move to Trash',
        'action.retry': 'Try again',
        'action.selectAll': 'Select visible',
        'action.clearSelection': 'Clear selection',
        'action.expandAll': 'Expand all',
        'action.collapseAll': 'Collapse all',
        'action.close': 'Close',
        'action.copyId': 'Copy session ID',
        'action.dismiss': 'Dismiss',
        'action.copyPackage': 'Copy plugin package name',
        'search.placeholder': 'Search session ID…',
        'search.clear': 'Clear search',
        'stats.total': 'Sessions',
        'stats.live': 'In use',
        'stats.groups': 'Groups',
        'stats.size': 'On disk',
        'tree.title': 'All sessions',
        'tree.ungrouped': 'Ungrouped',
        'tree.noPath': 'No recorded path',
        'tree.count': '{n} sessions',
        'tree.countOne': '1 session',
        'tree.monthCount': '{n}',
        'tree.emptyFiltered': 'No matching sessions',
        'tree.emptyFilteredBody': 'Try another keyword, or clear the search to see everything.',
        'status.live': 'Running',
        'status.open': 'Open',
        'status.archived': 'Archived',
        'status.subagent': 'Subagent',
        'status.pinned': 'Pinned',
        'status.migration': 'Migration',
        'untitled': 'Untitled session',
        'empty.title': 'No sessions yet',
        'empty.body': 'Start a conversation and it appears here, or import a backup you exported earlier.',
        'empty.cta': 'Import a backup',
        'loading': 'Building the session tree…',
        'error.load': 'The session list could not be read.',
        'error.action': 'The action failed. Please try again.',
        'selection.count': '{n} selected',
        'selection.size': '{size} total',
        'selection.hint': 'Sessions in use can be deleted too: they are stopped and hidden first, then removed after DSH restarts. Restore them from Trash meanwhile.',
        'selection.none': 'No session selected',
        'selection.export': 'Export these sessions',
        'selection.delete': 'Delete these sessions',
        'selection.liveBlocked': 'The selected sessions are currently in use and cannot be deleted.',
        'detail.title': 'Session details',
        'detail.empty': 'Pick a session to inspect its path, times, and size.',
        'detail.workspace': 'Workspace',
        'detail.path': 'Directory',
        'detail.created': 'Created',
        'detail.updated': 'Last activity',
        'detail.size': 'Log size',
        'detail.id': 'Session ID',
        'detail.turns': 'Turns',
        'detail.preset': 'Agent preset',
        'detail.noPath': '—',
        'import.title': 'Import session backups',
        'import.hint': 'Use the .json backups exported by this plugin. Choose several files at once, or drop them anywhere on this page.',
        'import.drop': 'Drop to import session backups',
        'import.dropHint': 'Sessions return to their original workspace; duplicate IDs are skipped.',
        'import.reading': 'Reading the backup…',
        'import.report': 'Import result',
        'import.imported': '{n} imported',
        'import.skipped': '{n} skipped',
        'import.failed': '{n} failed',
        'delete.title.one': 'Delete this session?',
        'delete.title.many': 'Delete these {n} sessions?',
        'delete.warning': 'Sessions move to Trash first and can be restored. Only permanent deletion removes logs. Sessions in use are stopped and hidden first.',
        'delete.liveNote': '{n} sessions are currently in use.',
        'delete.more': 'and {n} more…',
        'toast.exportStarted': 'Backup export started',
        'toast.deleted': '{n} sessions moved to Trash',
        'toast.imported': '{n} sessions imported',
        'toast.refreshed': 'List refreshed',
        'toast.openUnavailable': 'The conversation could not be opened from here; use the left sidebar instead.',
        'toast.copied': 'Copied',
        'toast.noExport': 'There is nothing to export.',
        'toast.partial': 'Finished, but {n} item(s) were skipped or failed.',
        'footer.storage': 'Session directory',
        'footer.package': 'Plugin package: ',
        'footer.note': 'Deleted sessions go to Trash first; only permanent deletion removes local logs.',
        'view.sessions': 'Sessions',
        'view.trash': 'Trash',
        'filter.label': 'Filter by state',
        'filter.all': 'All',
        'filter.running': 'Running',
        'filter.open': 'Open',
        'filter.archived': 'Archived',
        'filter.subagent': 'Subagent',
        'filter.pinned': 'Pinned',
        'filter.migration': 'Migration',
        'status.deleted': 'Deleted',
        'status.pendingDelete': 'Pending delete',
        'trash.title': 'Trash',
        'trash.count': '{n} deleted sessions',
        'trash.countOne': '1 deleted session',
        'trash.empty': 'Trash is empty',
        'trash.emptyBody': 'Deleted sessions land here first; restore them or delete them permanently.',
        'trash.pending': 'Pending delete',
        'trash.pendingPurge': 'This session is still in use; permanently delete it after DSH restarts.',
        'trash.pendingHint': 'This session is still in use. It is hidden here and from the native sidebar; its log is removed after DSH restarts. You can restore it meanwhile.',
        'trash.deletedAt': 'Deleted',
        'trash.originalPath': 'Original directory',
        'trash.restore': 'Restore',
        'trash.purge': 'Delete permanently',
        'trash.purgeTitle': 'Permanently delete these {n} sessions?',
        'trash.restoreSelected': 'Restore selected',
        'trash.purgeSelected': 'Delete selected permanently',
        'trash.restoreHint': 'Restored sessions return to their workspace; a session archived before deletion stays archived.',
        'trash.purgeHint': 'Permanent deletion keeps no log and cannot be undone.',
        'trash.wasLive': 'In use when deleted',
        'trash.wasRunning': 'Running when deleted',
        'trash.wasArchived': 'Archived when deleted',
        'trash.detail': 'Deleted session',
        'trash.deletedGroup': 'Deleted {label}',
        'action.restore': 'Restore',
        'action.purge': 'Delete permanently',
        'action.undo': 'Undo',
        'toast.movedToTrash': '{n} sessions moved to Trash',
        'toast.movedPending': '{n} sessions in use are hidden and will be removed after DSH restarts',
        'toast.restored': '{n} sessions restored',
        'toast.purged': '{n} sessions permanently deleted',
        'delete.activeNote': '{n} session(s) are in use: they are stopped and hidden first, and their logs are removed after DSH restarts. Restore them from Trash meanwhile.',
        'delete.pendingNote': 'These sessions are hidden from the session tree and native sidebar; restore them from Trash.',
        'delete.confirmStopDelete': 'Stop and delete',
        'search.trashPlaceholder': 'Search deleted session ID…',
        'selection.trashHint': 'Restore returns sessions to their workspace; permanent deletion cannot be undone.',
        'error.restore': 'Restoring the session failed.',
        'error.purge': 'Permanent deletion failed.',
        'stats.trash': 'Trash',
        'relative.justNow': 'just now',
        'relative.minutes': '{n} min ago',
        'relative.hours': '{n} h ago',
        'relative.days': '{n} d ago',
        'module.session': 'Session Manager',
        'module.session.desc': 'Browse, filter, import, export and delete sessions',
        'module.rule': 'Rule Manager',
        'module.rule.desc': 'Manage AI assistant behavior rules and prompts',
        'module.rule.placeholder': 'Rule management is under development…',
        'rule.title': 'Rules',
        'rule.titleMeta': '{total} rules · {enabled} active',
        'rule.new': 'New Rule',
        'rule.empty': 'No rules yet',
        'rule.emptyBody': 'Rules constrain the AI assistant behaviour at global, workspace or session scope.',
        'rule.emptyCta': 'Create your first rule',
        'rule.emptyFiltered': 'No rules match the current filter',
        'rule.listColTitle': 'Title',
        'rule.listColScope': 'Scope',
        'rule.listColTarget': 'Target',
        'rule.listColUpdated': 'Updated',
        'rule.listColActions': 'Actions',
        'rule.scope.global': 'Global',
        'rule.scope.globalHint': 'Applies to all sessions',
        'rule.scope.workspace': 'Workspace',
        'rule.scope.workspaceHint': 'Only in the specified workspace',
        'rule.scope.workspacePick': 'Pick workspace',
        'rule.scope.session': 'Session',
        'rule.scope.sessionHint': 'Only in the specified session',
        'rule.scope.sessionPick': 'Pick session',
        'rule.picker.workspaceTitle': 'Select workspaces',
        'rule.picker.sessionTitle': 'Select sessions',
        'rule.picker.search': 'Search…',
        'rule.picker.empty': 'No data',
        'rule.picker.selected': '{n} selected',
        'rule.filter.all': 'All rules',
        'rule.filter.enabled': 'Active',
        'rule.filter.disabled': 'Disabled',
        'rule.filter.scope': 'By scope',
        'rule.filter.scopeAll': 'Any scope',
        'rule.filter.scopeGlobal': 'Global',
        'rule.filter.scopeWorkspace': 'Workspace',
        'rule.filter.scopeSession': 'Session',
        'rule.target.global': '—',
        'rule.toggleOn': 'Enable',
        'rule.toggleOff': 'Disable',
        'rule.edit': 'Edit',
        'rule.delete': 'Delete',
        'rule.deleteConfirmTitle': 'Delete rule?',
        'rule.deleteConfirmBody': 'This cannot be undone. Delete "{title}"?',
        'rule.form.newTitle': 'New Rule',
        'rule.form.editTitle': 'Edit Rule',
        'rule.form.titleLabel': 'Rule title',
        'rule.form.titlePlaceholder': 'One sentence describing this rule',
        'rule.form.contentLabel': 'Rule content',
        'rule.form.contentPlaceholder': 'Natural-language prompt or behaviour constraints…',
        'rule.form.scopeLabel': 'Scope',
        'rule.form.targetLabel': 'Target',
        'rule.form.targetPlaceholder': 'Select or enter target ID',
        'rule.form.markdownHint': 'Content supports Markdown (## headings, **bold**, - lists, `code` etc.)',
        'rule.form.editMode': 'Edit',
        'rule.form.previewMode': 'Preview',
        'rule.form.enabledLabel': 'Enabled',
        'rule.form.save': 'Save',
        'rule.form.cancel': 'Cancel',
        'rule.form.delete': 'Delete',
        'rule.form.titleEmpty': 'Please enter a rule title',
        'rule.form.contentEmpty': 'Please enter rule content',
        'rule.form.targetRequired': 'Target is required when scope is "{scope}"',
        'rule.saved': 'Rule saved',
        'rule.created': 'Rule created',
        'rule.showMore': 'Show more',
        'rule.showLess': 'Show less',
        'rule.deleted': 'Rule deleted',
        'rule.loadError': 'Failed to load rules',
        'rule.saveError': 'Failed to save rule',
      },
    };

    const STYLES = `
.nsm {
  --nsm-bg: var(--dsw-alias-bg-base);
  --nsm-surface: var(--dsw-alias-bg-layer-1);
  --nsm-muted-surface: var(--dsw-alias-bg-module-platform);
  --nsm-border: var(--dsw-alias-border-l3);
  --nsm-border-strong: var(--dsw-alias-border-l4);
  --nsm-text: var(--dsw-alias-label-primary);
  --nsm-secondary: var(--dsw-alias-label-secondary);
  --nsm-tertiary: var(--dsw-alias-label-tertiary);
  --nsm-hover: var(--dsw-alias-interactive-bg-hover);
  --nsm-accent: var(--dsw-alias-state-business-primary);
  --nsm-accent-soft: color-mix(in srgb, var(--nsm-accent) 9%, transparent);
  --nsm-accent-line: color-mix(in srgb, var(--nsm-accent) 26%, transparent);
  --nsm-danger: var(--dsw-alias-state-error-primary);
  --nsm-danger-soft: color-mix(in srgb, var(--nsm-danger) 8%, transparent);
  --nsm-green: var(--dsw-alias-state-success-primary);
  --nsm-amber: var(--dsw-alias-state-warn-primary);
  --nsm-violet: var(--dsw-alias-state-done-primary);
  --nsm-radius: 8px;
  --nsm-radius-sm: 5px;
  --nsm-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  height: 100%;
  overflow-y: auto;
  background: var(--nsm-bg);
  color: var(--nsm-text);
  font-family: var(--nsm-font);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.nsm *, .nsm *::before, .nsm *::after { box-sizing: border-box; }
.nsm button, .nsm input { font-family: inherit; }
.nsm__inner { max-width: 1120px; margin: 0 auto; padding: calc(var(--dsh-frame-top-clearance, 0px) + 28px) 28px 48px; }
.nsm__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.nsm__heading { display: flex; align-items: center; gap: 12px; min-width: 0; }
.nsm__mark { position: relative; overflow: hidden; display: grid; place-items: center; flex: none; width: 38px; height: 38px; padding: 8px; border: 1px solid rgba(255, 255, 255, .4); border-radius: 9px; background: radial-gradient(120% 90% at 18% 0%, rgba(255, 255, 255, .62), transparent 42%), radial-gradient(80% 80% at 100% 100%, rgba(34, 211, 238, .46), transparent 55%), linear-gradient(145deg, #62b3ff 0%, #2563eb 52%, #172554 100%); color: #fff; box-shadow: 0 10px 22px -10px rgba(37, 99, 235, .85), inset 0 1px 1px rgba(255, 255, 255, .65), inset 0 -10px 18px rgba(2, 6, 23, .28); }
.nsm__mark::before { content: ""; position: absolute; left: 7px; top: 6px; width: 11px; height: 5px; border-radius: 50%; background: rgba(255, 255, 255, .48); filter: blur(2px); transform: rotate(-18deg); pointer-events: none; }
.nsm__mark::after { content: ""; position: absolute; inset: 1px 1px 48% 1px; border-radius: 8px 8px 50% 50%; background: linear-gradient(180deg, rgba(255, 255, 255, .34), rgba(255, 255, 255, 0)); pointer-events: none; }
.nsm__mark svg { position: relative; z-index: 1; filter: drop-shadow(0 1px 1px rgba(2, 6, 23, .25)); }
.nsm__mark svg { display: block; width: 100%; height: 100%; }
.nsm__titles { min-width: 0; }
.nsm__title { margin: 0; font-family: var(--nsm-font); font-size: 24px; font-weight: 600; line-height: 1.2; letter-spacing: -.025em; color: var(--nsm-text); }
.nsm__subtitle { max-width: 680px; margin: 5px 0 0; font-size: 12.5px; line-height: 1.6; color: var(--nsm-secondary); }
.nsm__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.nsm__button { appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 30px; padding: 0 10px; border: 1px solid var(--nsm-border-strong); border-radius: 6px; background: var(--nsm-surface); color: var(--nsm-text); font-size: 12px; font-weight: 500; line-height: 1; white-space: nowrap; cursor: pointer; transition: background-color .12s ease, border-color .12s ease, color .12s ease; }
.nsm__button:hover:not(:disabled) { background: var(--nsm-hover); border-color: var(--nsm-border-strong); }
.nsm__button:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: 2px; }
.nsm__button:disabled { opacity: .42; cursor: not-allowed; }
.nsm__button--primary { border-color: var(--dsw-alias-button-primary-fill); background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground); }
.nsm__button--primary:hover:not(:disabled) { border-color: var(--dsw-alias-button-primary-hover); background: var(--dsw-alias-button-primary-hover); }
.nsm__button--danger { border-color: color-mix(in srgb, var(--nsm-danger) 26%, transparent); background: transparent; color: var(--nsm-danger); }
.nsm__button--danger:hover:not(:disabled) { background: var(--nsm-danger-soft); border-color: color-mix(in srgb, var(--nsm-danger) 42%, transparent); }
.nsm__button--ghost { border-color: transparent; background: transparent; color: var(--nsm-secondary); }
.nsm__button--ghost:hover:not(:disabled) { background: var(--nsm-hover); color: var(--nsm-text); }
.nsm__button--small { height: 26px; padding: 0 8px; font-size: 11.5px; }
.nsm__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 4px; border-radius: var(--nsm-radius); background: transparent; gap: 4px; }
.nsm__stat { position: relative; padding: 14px 16px; border-radius: var(--nsm-radius); background: var(--nsm-surface); border: 1px solid var(--nsm-border); }
.nsm__stat:first-child { }
.nsm__stat + .nsm__stat { }
.nsm__stat::after { display: none; }
.nsm__stat-label { display: block; font-size: 11px; font-weight: 500; line-height: 1.4; color: var(--nsm-tertiary); }
.nsm__stat-value { display: block; margin-top: 3px; font-family: var(--nsm-font); font-size: 20px; font-weight: 600; line-height: 1.2; letter-spacing: -.02em; color: var(--nsm-text); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nsm__toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding: 10px 14px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius); background: var(--nsm-surface); }
.nsm__viewtabs { display: flex; align-items: center; flex: none; gap: 2px; padding: 2px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-muted-surface); }
.nsm__viewtab { appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 5px; height: 26px; padding: 0 10px; border: 1px solid transparent; border-radius: 5px; background: transparent; color: var(--nsm-secondary); font-size: 11.5px; font-weight: 500; line-height: 1; white-space: nowrap; cursor: pointer; }
.nsm__viewtab:hover { color: var(--nsm-text); background: var(--nsm-hover); }
.nsm__viewtab:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: 1px; }
.nsm__viewtab.is-active { border-color: var(--nsm-border); background: var(--nsm-surface); color: var(--nsm-text); box-shadow: 0 1px 2px rgba(0, 0, 0, .04); }
.nsm__tab-count { display: inline-flex; align-items: center; justify-content: center; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 4px; background: var(--nsm-surface); color: var(--nsm-tertiary); font-size: 9.5px; font-weight: 500; font-variant-numeric: tabular-nums; }
.nsm__viewtab.is-active .nsm__tab-count { background: var(--nsm-accent-soft); color: var(--nsm-accent); }
.nsm__search { position: relative; flex: 1 1 260px; min-width: 190px; }
.nsm__search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--nsm-tertiary); pointer-events: none; }
.nsm__search input { width: 100%; height: 30px; padding: 0 30px 0 32px; border: 1px solid var(--nsm-border-strong); border-radius: var(--nsm-radius-sm); background: var(--nsm-bg); color: var(--nsm-text); font-size: 12px; outline: none; transition: border-color .12s ease, box-shadow .12s ease; }
.nsm__search input::placeholder { color: var(--nsm-tertiary); }
.nsm__search input:focus { border-color: var(--nsm-accent); }
.nsm__search-clear { position: absolute; right: 3px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: var(--nsm-tertiary); cursor: pointer; }
.nsm__search-clear:hover { background: var(--nsm-hover); color: var(--nsm-text); }
.nsm__toolbar-spacer { flex: 1 1 auto; }
.nsm__filters { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; }
.nsm__filter { appearance: none; display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 8px; border: 1px solid transparent; border-radius: 5px; background: transparent; color: var(--nsm-secondary); font-size: 11px; font-weight: 500; line-height: 1; white-space: nowrap; cursor: pointer; }
.nsm__filter:hover { background: var(--nsm-hover); color: var(--nsm-text); }
.nsm__filter:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: 1px; }
.nsm__filter.is-active { border-color: var(--nsm-accent-line); background: var(--nsm-accent-soft); color: var(--nsm-accent); }
.nsm__filter-count { color: var(--nsm-tertiary); font-size: 9.5px; font-weight: 400; font-variant-numeric: tabular-nums; }
.nsm__filter.is-active .nsm__filter-count { color: inherit; opacity: .72; }
.nsm__layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; margin-top: 16px; }
.nsm__tree-card { min-width: 0; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius); background: var(--nsm-surface); overflow: hidden; }
.nsm__tree-head { display: flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 14px; border-bottom: 1px solid var(--nsm-border); background: transparent; }
.nsm__tree-head h2 { margin: 0; font-family: var(--nsm-font); font-size: 12.5px; font-weight: 600; line-height: 1.4; letter-spacing: -.01em; color: var(--nsm-text); }
.nsm__tree-head-meta { margin-left: auto; color: var(--nsm-tertiary); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.nsm__tree-body { padding: 4px 6px 8px; }
.nsm__group { margin: 0; border: 0; border-bottom: 1px solid var(--nsm-border); border-radius: 0; background: transparent; overflow: visible; }
.nsm__group:last-child { border-bottom: 0; }
.nsm__group-head { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: var(--nsm-radius-sm); cursor: pointer; user-select: none; transition: background-color .12s ease; }
.nsm__group-head:hover { background: var(--nsm-hover); }
.nsm__group-head:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: -2px; }
.nsm__chevron { display: grid; place-items: center; flex: none; width: 14px; height: 14px; color: var(--nsm-tertiary); transition: transform .16s ease; }
.nsm__chevron.is-open { transform: rotate(90deg); }
.nsm__folder { display: grid; place-items: center; flex: none; width: 16px; height: 16px; color: var(--nsm-tertiary); background: transparent; border-radius: 0; }
.nsm__folder svg { width: 14px; height: 14px; }
.nsm__folder--trash { color: var(--nsm-danger); }
.nsm__group-copy { flex: 1 1 auto; min-width: 0; }
.nsm__group-title { font-family: var(--nsm-font); font-size: 12.5px; font-weight: 600; line-height: 1.4; letter-spacing: -.005em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nsm__group-path { margin-top: 1px; font-size: 10.5px; line-height: 1.4; color: var(--nsm-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nsm__count { display: inline-flex; align-items: center; flex: none; height: 18px; padding: 0 5px; border: 1px solid var(--nsm-border); border-radius: 4px; background: var(--nsm-muted-surface); color: var(--nsm-tertiary); font-size: 10px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.nsm__months { padding: 0 4px 5px 24px; }
.nsm__month { margin: 1px 0; }
.nsm__month-head { display: flex; align-items: center; gap: 7px; padding: 4px 6px; border-radius: 5px; cursor: pointer; user-select: none; }
.nsm__month-head:hover { background: var(--nsm-hover); }
.nsm__month-head:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: 1px; }
.nsm__month-title { color: var(--nsm-tertiary); font-size: 10px; font-weight: 600; line-height: 1.4; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.nsm__month-count { color: var(--nsm-tertiary); font-size: 9.5px; font-variant-numeric: tabular-nums; opacity: .8; }
.nsm__month-head .nsm__count { margin-left: auto; padding: 0; border: 0; background: transparent; }
.nsm__rows { display: flex; flex-direction: column; gap: 1px; padding: 2px 0 3px; }
.nsm__row { position: relative; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid transparent; border-radius: var(--nsm-radius-sm); cursor: default; transition: background-color .12s ease, border-color .12s ease, box-shadow .12s ease; }
.nsm__row:hover { background: var(--nsm-hover); border-color: transparent; }
.nsm__row:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: -1px; }
.nsm__row.is-selected { background: var(--nsm-accent-soft); border-color: var(--nsm-accent-line); }
.nsm__row.is-focused { box-shadow: inset 2px 0 0 var(--nsm-accent); }
.nsm__row.is-live { background-image: none; }
.nsm__row--trash:hover { background: var(--nsm-hover); border-color: transparent; }
.nsm__row--trash.is-pending { background-image: none; }
.nsm__check { appearance: none; display: grid; place-items: center; flex: none; width: 16px; height: 16px; padding: 0; border: 1px solid var(--nsm-border-strong); border-radius: 4px; background: var(--nsm-surface); color: transparent; cursor: pointer; transition: background-color .12s ease, border-color .12s ease, color .12s ease; }
.nsm__check:hover { border-color: var(--nsm-accent); }
.nsm__check:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: 2px; }
.nsm__check.is-on { border-color: var(--nsm-accent); background: var(--nsm-accent); color: #fff; }
.nsm__check.is-mixed { border-color: var(--nsm-accent); background: var(--nsm-accent-soft); color: var(--nsm-accent); }
.nsm__dot { flex: none; width: 6px; height: 6px; border-radius: 50%; background: var(--nsm-tertiary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--nsm-tertiary) 12%, transparent); }
.nsm__dot.is-live { background: var(--nsm-green); box-shadow: 0 0 0 2px color-mix(in srgb, var(--nsm-green) 16%, transparent); animation: nsm-pulse 1.8s ease-in-out infinite; }
.nsm__dot.is-open { background: var(--nsm-accent); box-shadow: 0 0 0 2px var(--nsm-accent-soft); }
.nsm__dot.is-archived { background: var(--nsm-tertiary); }
.nsm__dot.is-deleted { background: var(--nsm-danger); box-shadow: 0 0 0 2px var(--nsm-danger-soft); }
.nsm__dot.is-pending { background: var(--nsm-amber); box-shadow: 0 0 0 2px color-mix(in srgb, var(--nsm-amber) 16%, transparent); animation: nsm-pulse 1.8s ease-in-out infinite; }
.nsm__dot.is-subagent { background: var(--nsm-violet); }
@keyframes nsm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
.nsm__row-main { flex: 1 1 auto; min-width: 0; }
.nsm__row-title-line { display: flex; align-items: center; gap: 6px; min-width: 0; }
.nsm__row-title { min-width: 0; color: var(--nsm-text); font-size: 12.5px; font-weight: 600; line-height: 1.4; letter-spacing: -.005em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nsm__row-meta { display: flex; align-items: center; gap: 6px; min-width: 0; margin-top: 1px; color: var(--nsm-tertiary); font-size: 10.5px; line-height: 1.4; }
.nsm__row-path { max-width: 55%; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nsm__meta-sep { opacity: .5; }
.nsm__row-meta .nsm__meta-size { flex: none; font-variant-numeric: tabular-nums; }
.nsm__badges { display: flex; align-items: center; flex: none; gap: 4px; }
.nsm__badge { display: inline-flex; align-items: center; gap: 3px; height: 18px; padding: 0 6px; border: 1px solid transparent; border-radius: 4px; font-size: 9.5px; font-weight: 500; line-height: 1; letter-spacing: .01em; white-space: nowrap; }
.nsm__badge--live { color: color-mix(in srgb, var(--nsm-green) 62%, var(--nsm-text)); background: color-mix(in srgb, var(--nsm-green) 9%, transparent); border-color: color-mix(in srgb, var(--nsm-green) 20%, transparent); }
.nsm__badge--open { color: var(--nsm-accent); background: var(--nsm-accent-soft); border-color: var(--nsm-accent-line); }
.nsm__badge--archived { color: var(--nsm-tertiary); background: var(--nsm-muted-surface); border-color: var(--nsm-border); }
.nsm__badge--subagent { color: color-mix(in srgb, var(--nsm-violet) 66%, var(--nsm-text)); background: color-mix(in srgb, var(--nsm-violet) 9%, transparent); border-color: color-mix(in srgb, var(--nsm-violet) 20%, transparent); }
.nsm__badge--migration { color: color-mix(in srgb, var(--nsm-amber) 60%, var(--nsm-text)); background: color-mix(in srgb, var(--nsm-amber) 9%, transparent); border-color: color-mix(in srgb, var(--nsm-amber) 22%, transparent); }
.nsm__badge--pinned { color: color-mix(in srgb, var(--nsm-amber) 60%, var(--nsm-text)); background: color-mix(in srgb, var(--nsm-amber) 8%, transparent); border-color: color-mix(in srgb, var(--nsm-amber) 20%, transparent); }
.nsm__badge--deleted { color: var(--nsm-danger); background: var(--nsm-danger-soft); border-color: color-mix(in srgb, var(--nsm-danger) 20%, transparent); }
.nsm__row-actions { display: flex; align-items: center; flex: none; gap: 0; opacity: 0; transition: opacity .12s ease; }
.nsm__row:hover .nsm__row-actions, .nsm__row:focus-within .nsm__row-actions { opacity: 1; }
.nsm__icon-button { appearance: none; display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--nsm-tertiary); cursor: pointer; }
.nsm__icon-button:hover:not(:disabled) { background: var(--nsm-hover); color: var(--nsm-text); }
.nsm__icon-button:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: 1px; }
.nsm__icon-button:disabled { opacity: .3; cursor: default; }
.nsm__icon-button--danger:hover:not(:disabled) { background: var(--nsm-danger-soft); color: var(--nsm-danger); }
.nsm__aside { position: sticky; top: 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.nsm__card { padding: 14px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius); background: var(--nsm-surface); }
.nsm__card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.nsm__card-head h2 { margin: 0; font-family: var(--nsm-font); font-size: 12.5px; font-weight: 600; line-height: 1.4; letter-spacing: -.005em; color: var(--nsm-text); }
.nsm__card-head .nsm__icon-button { margin-left: auto; }
.nsm__selection-actions { display: flex; flex-direction: column; gap: 6px; }
.nsm__selection-actions .nsm__button { width: 100%; }
.nsm__selection-size { margin: 0 0 10px; color: var(--nsm-tertiary); font-size: 11px; font-variant-numeric: tabular-nums; }
.nsm__hint { margin: 10px 0 0; color: var(--nsm-tertiary); font-size: 11px; line-height: 1.55; }
.nsm__detail-empty p { margin: 0; color: var(--nsm-tertiary); font-size: 11px; line-height: 1.6; }
.nsm__detail-title { margin: 0; font-family: var(--nsm-font); font-size: 14px; font-weight: 600; line-height: 1.4; letter-spacing: -.01em; color: var(--nsm-text); word-break: break-word; }
.nsm__detail-badges { display: flex; flex-wrap: wrap; gap: 4px; margin: 7px 0 11px; }
.nsm__facts { display: flex; flex-direction: column; gap: 7px; margin: 0; }
.nsm__fact { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 10px; align-items: baseline; }
.nsm__fact dt { color: var(--nsm-tertiary); font-size: 10.5px; line-height: 1.5; }
.nsm__fact dd { min-width: 0; margin: 0; color: var(--nsm-secondary); font-size: 11.5px; line-height: 1.5; word-break: break-word; }
.nsm__fact code { padding: 1px 5px; border: 1px solid var(--nsm-border); border-radius: 4px; background: var(--nsm-muted-surface); color: var(--nsm-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; }
.nsm__fact button { appearance: none; padding: 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; word-break: break-word; cursor: pointer; }
.nsm__fact button:hover { color: var(--nsm-accent); text-decoration: underline; text-underline-offset: 2px; }
.nsm__detail-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--nsm-border); }
.nsm__import-card { background: transparent; border: none; padding: 0; }
.nsm__import-card .nsm__card-head { display: none; }
.nsm__import-card .nsm__button { margin-top: 2px; }
.nsm__empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 240px; padding: 32px 20px; text-align: center; }
.nsm__empty-mark { display: grid; place-items: center; width: 48px; height: 48px; padding: 8px; border: 1px solid var(--nsm-accent-line); border-radius: 9px; background: linear-gradient(145deg, color-mix(in srgb, var(--nsm-accent) 14%, transparent), color-mix(in srgb, var(--nsm-accent) 4%, transparent)); color: var(--nsm-accent); }
.nsm__empty-mark svg { display: block; width: 100%; height: 100%; }
.nsm__empty-mark--trash { border-color: color-mix(in srgb, var(--nsm-danger) 20%, transparent); background: var(--nsm-danger-soft); color: var(--nsm-danger); }
.nsm__empty h2 { margin: 14px 0 4px; font-family: var(--nsm-font); font-size: 14px; font-weight: 600; line-height: 1.4; letter-spacing: -.01em; }
.nsm__empty p { max-width: 330px; margin: 0; color: var(--nsm-tertiary); font-size: 11.5px; line-height: 1.6; }
.nsm__empty .nsm__button { margin-top: 14px; }
.nsm__loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; gap: 10px; color: var(--nsm-tertiary); font-size: 12px; }
.nsm__spinner { width: 18px; height: 18px; border: 2px solid var(--nsm-border-strong); border-top-color: var(--nsm-accent); border-radius: 50%; animation: nsm-spin .8s linear infinite; }
@keyframes nsm-spin { to { transform: rotate(360deg); } }
.nsm__error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 240px; padding: 28px; text-align: center; }
.nsm__error p { margin: 0 0 14px; color: var(--nsm-danger); font-size: 12px; line-height: 1.6; }
.nsm__report { margin: 0 0 14px; padding: 10px 12px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-muted-surface); }
.nsm__report-head { display: flex; align-items: center; gap: 8px; color: var(--nsm-text); font-size: 12px; font-weight: 500; }
.nsm__report-head .nsm__icon-button { margin-left: auto; }
.nsm__report ul { margin: 6px 0 0; padding-left: 18px; color: var(--nsm-tertiary); font-size: 11px; line-height: 1.6; }
.nsm__footer { display: flex; flex-direction: column; gap: 4px; margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--nsm-border); color: var(--nsm-tertiary); font-size: 10.5px; line-height: 1.6; }
.nsm__footer-line { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-width: 0; }
.nsm__footer code { padding: 1px 5px; border: 1px solid var(--nsm-border); border-radius: 4px; background: var(--nsm-muted-surface); color: var(--nsm-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; word-break: break-all; }
.nsm__footer-copy { appearance: none; display: inline-flex; align-items: center; justify-content: center; flex: none; width: 20px; height: 20px; padding: 0; border: 1px solid var(--nsm-border); border-radius: 4px; background: transparent; color: var(--nsm-tertiary); cursor: pointer; }
.nsm__footer-copy:hover { background: var(--nsm-hover); color: var(--nsm-text); border-color: var(--nsm-border-strong); }
.nsm__footer-copy:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: 1px; }
.nsm__modal { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 22px; background: rgba(15, 17, 21, .38); backdrop-filter: blur(2px); }
.nsm__modal-card { box-sizing: border-box; width: min(520px, 100%); max-height: min(90vh, 780px); overflow: auto; padding: 18px 20px 16px; border: none; border-radius: 12px; background: var(--nsm-surface); box-shadow: 0 20px 48px rgba(0, 0, 0, .12), 0 4px 12px rgba(0, 0, 0, .08); }
.nsm__form-card { width: min(90vw, 1100px); max-height: min(90vh, 860px); padding: 20px 24px 18px; }
.nsm__confirm-card { width: min(400px, 100%); }
.nsm__modal-head { display: flex; align-items: center; justify-content: space-between; margin: 0 0 14px; }
.nsm__modal-head h3 { margin: 0; font-family: var(--nsm-font); font-size: 14px; font-weight: 600; letter-spacing: -.01em; color: var(--nsm-text); }
.nsm__modal-body { margin: 0 0 6px; font-size: 12px; line-height: 1.65; color: var(--nsm-secondary); }
.nsm__modal-close { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: none; border-radius: var(--nsm-radius-sm); background: transparent; color: var(--nsm-secondary); cursor: pointer; transition: background-color .12s ease, color .12s ease; }
.nsm__modal-close:hover { background: var(--nsm-hover); color: var(--nsm-text); }
.nsm__form-input.is-error,
.nsm__form-textarea.is-error { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, .12); }
.nsm__dialog { box-sizing: border-box; width: min(440px, 100%); max-height: min(620px, 90vh); overflow: auto; padding: 20px; border: none; border-radius: 12px; background: var(--nsm-surface); box-shadow: 0 20px 48px rgba(0, 0, 0, .12), 0 4px 12px rgba(0, 0, 0, .08); }
.nsm__dialog h2 { margin: 0 0 8px; font-family: var(--nsm-font); font-size: 16px; font-weight: 600; line-height: 1.35; letter-spacing: -.01em; }
.nsm__dialog-warning { margin: 0 0 12px; color: var(--nsm-secondary); font-size: 12px; line-height: 1.65; }
.nsm__dialog-list { margin: 0 0 12px; padding: 8px 10px; list-style: none; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-muted-surface); font-size: 11.5px; line-height: 1.75; }
.nsm__dialog-list li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nsm__dialog-more { margin: 0 0 12px; color: var(--nsm-tertiary); font-size: 11px; }
.nsm__dialog-live-note { margin: 0 0 12px; padding: 8px 10px; border: 1px solid color-mix(in srgb, var(--nsm-amber) 22%, transparent); border-radius: 5px; background: color-mix(in srgb, var(--nsm-amber) 8%, transparent); color: color-mix(in srgb, var(--nsm-amber) 58%, var(--nsm-text)); font-size: 11.5px; line-height: 1.55; }
.nsm__dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
.nsm__drop { position: fixed; inset: 0; z-index: 1150; display: grid; place-items: center; padding: 30px; background: rgba(15, 17, 21, .3); backdrop-filter: blur(2px); pointer-events: none; }
.nsm__drop-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-width: min(420px, 80vw); min-height: 190px; padding: 24px; border: 1px dashed var(--nsm-accent-line); border-radius: 10px; background: var(--nsm-surface); box-shadow: var(--dsw-shadow-lv3, 0 12px 32px rgba(0, 0, 0, .16)); text-align: center; }
.nsm__drop-card h3 { margin: 0; font-family: var(--nsm-font); font-size: 16px; font-weight: 600; letter-spacing: -.01em; }
.nsm__drop-card p { max-width: 330px; margin: 0; color: var(--nsm-tertiary); font-size: 11.5px; line-height: 1.6; }
.nsm__toast { position: fixed; right: 22px; bottom: 22px; z-index: 1300; display: flex; align-items: center; gap: 8px; max-width: min(420px, calc(100vw - 44px)); padding: 9px 12px; border: 0; border-radius: 8px; background: var(--dsw-alias-toast-bg); color: var(--dsw-alias-toast-label); box-shadow: var(--dsw-shadow-lv3, 0 12px 32px rgba(0, 0, 0, .16)); font-size: 12px; line-height: 1.5; animation: nsm-toast-in .16s ease-out; }
.nsm__toast.is-error, .nsm__toast.is-ok { border: 0; color: var(--dsw-alias-toast-label); }
.nsm__toast-icon { flex: none; margin-top: 0; color: var(--dsw-alias-toast-label); opacity: .65; }
.nsm__toast-action { appearance: none; flex: none; margin-left: 4px; height: 22px; padding: 0 8px; border: 1px solid rgba(255, 255, 255, .2); border-radius: 4px; background: rgba(255, 255, 255, .08); color: var(--dsw-alias-toast-label); font-size: 10.5px; font-weight: 500; line-height: 1; cursor: pointer; }
.nsm__toast-action:hover { background: rgba(255, 255, 255, .16); }
@keyframes nsm-toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.nsm__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
/* ── Module workspace (sidebar + content) ── */
.nsm__workspace { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 16px; align-items: start; margin-top: 24px; }
.nsm__sidebar { display: flex; flex-direction: column; gap: 4px; position: sticky; top: 16px; padding: 4px; border: none; border-radius: 0; background: transparent; }
.nsm__module { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid transparent; border-radius: var(--nsm-radius-sm); background: transparent; cursor: pointer; transition: background-color .12s ease, border-color .12s ease; text-align: left; color: var(--nsm-secondary); }
.nsm__module:hover { background: var(--nsm-hover); color: var(--nsm-text); }
.nsm__module:focus-visible { outline: 2px solid var(--nsm-accent); outline-offset: -2px; }
.nsm__module.is-active { border-color: var(--nsm-accent-line); background: var(--nsm-accent-soft); color: var(--nsm-accent); }
.nsm__module-icon { display: grid; place-items: center; width: 22px; height: 22px; color: currentColor; }
.nsm__module-icon svg { width: 14px; height: 14px; }
.nsm__module-label { font-family: var(--nsm-font); font-size: 12px; font-weight: 600; line-height: 1.3; letter-spacing: -.005em; }
.nsm__main { min-width: 0; display: flex; flex-direction: column; gap: 0; padding: 0; border: none; border-radius: 0; background: transparent; }
.nsm__pane { display: flex; flex-direction: column; gap: 16px; }
/* Rule manager placeholder */
.nsm__rule-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 320px; padding: 32px 24px; text-align: center; border: 1px dashed var(--nsm-border); border-radius: var(--nsm-radius); background: var(--nsm-surface); }
.nsm__rule-placeholder-mark { display: grid; place-items: center; width: 56px; height: 56px; padding: 10px; border: 1px solid var(--nsm-border-strong); border-radius: 12px; color: var(--nsm-tertiary); background: var(--nsm-muted-surface); }
.nsm__rule-placeholder-mark svg { display: block; width: 100%; height: 100%; }
.nsm__rule-placeholder h2 { margin: 14px 0 4px; font-family: var(--nsm-font); font-size: 15px; font-weight: 600; line-height: 1.4; letter-spacing: -.01em; color: var(--nsm-text); }
.nsm__rule-placeholder p { max-width: 360px; margin: 0; color: var(--nsm-tertiary); font-size: 11.5px; line-height: 1.6; }
/* ── Rule Manager (v1.4 Linear/Vercel style) ── */
.nsm__rules-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 0; border: none; border-radius: 0; background: transparent; }
.nsm__rules-toolbar-head { display: flex; align-items: center; gap: 8px; margin-right: auto; }
.nsm__rules-title { font-family: var(--nsm-font); font-size: 13px; font-weight: 600; color: var(--nsm-text); letter-spacing: -.005em; }
.nsm__rules-meta { font-size: 10.5px; color: var(--nsm-tertiary); }
.nsm__rules-filter { display: inline-flex; gap: 4px; }
.nsm__rules-filter-group { display: inline-flex; gap: 4px; padding: 2px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-bg); }
.nsm__rules-filter-btn { font-family: var(--nsm-font); font-size: 10.5px; font-weight: 500; padding: 4px 10px; border: none; border-radius: var(--nsm-radius-sm); background: transparent; color: var(--nsm-secondary); cursor: pointer; transition: background-color .12s ease, color .12s ease; }
.nsm__rules-filter-btn:hover { color: var(--nsm-text); }
.nsm__rules-filter-btn.is-active { background: var(--nsm-accent-soft); color: var(--nsm-accent); }
.nsm__rules-list { display: flex; flex-direction: column; gap: 10px; }

/* ── v1.4 rule card ── */
.nsm__rule-card { display: flex; flex-direction: column; gap: 10px; padding: 16px 18px; border: 1px solid var(--nsm-border); border-radius: 10px; background: var(--nsm-surface); transition: border-color .15s ease, background-color .15s ease; }
.nsm__rule-card:hover { border-color: var(--nsm-border-strong); }
.nsm__rule-card.is-disabled { opacity: .55; }
.nsm__rule-card-head { display: flex; align-items: center; gap: 10px; }
.nsm__rule-card-title { flex: 1 1 auto; min-width: 0; font-family: var(--nsm-font); font-size: 13.5px; font-weight: 600; color: var(--nsm-text); line-height: 1.4; letter-spacing: -.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nsm__rule-card-title.is-disabled { color: var(--nsm-tertiary); text-decoration: line-through; }
.nsm__rule-card-meta { flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px; font-size: 10.5px; color: var(--nsm-tertiary); font-variant-numeric: tabular-nums; }
.nsm__rule-card-body { font-family: var(--nsm-mono); font-size: 11.5px; line-height: 1.6; color: var(--nsm-secondary); }
.nsm__rule-card-content { white-space: pre-wrap; word-break: break-word; overflow: hidden; transition: max-height .25s ease; }
.nsm__rule-card-content.is-collapsed { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; max-height: 3.2em; }
.nsm__rule-card-toggle { font-family: var(--nsm-font); font-size: 11px; font-weight: 500; padding: 2px 0; border: none; background: transparent; color: var(--nsm-accent); cursor: pointer; margin-top: 2px; letter-spacing: .01em; }
.nsm__rule-card-toggle:hover { text-decoration: underline; }

/* Foot: scope tabs + picker + actions */
.nsm__rule-card-foot { display: flex; align-items: center; gap: 10px; padding-top: 10px; border-top: 1px solid var(--nsm-border); }
.nsm__rule-card-foot .nsm__toggle { margin-left: 0; }
.nsm__rule-card-foot .nsm__icon-btn { width: 28px; height: 28px; }
.nsm__rule-card-foot-spacer { flex: 1 1 auto; }

/* Segmented scope tabs */
.nsm__scope-tabs { display: inline-flex; align-items: center; padding: 2px; border: 1px solid var(--nsm-border); border-radius: 7px; background: var(--nsm-bg); gap: 1px; }
.nsm__scope-tab { font-family: var(--nsm-font); font-size: 11px; font-weight: 500; padding: 4px 10px; border: none; border-radius: 5px; background: transparent; color: var(--nsm-secondary); cursor: pointer; transition: background-color .12s ease, color .12s ease; white-space: nowrap; }
.nsm__scope-tab:not(.is-active):hover { color: var(--nsm-text); background: var(--nsm-hover); }
.nsm__scope-tab.is-active { background: var(--nsm-text); color: var(--nsm-surface); font-weight: 600; box-shadow: none; }
.nsm__scope-tab.is-active:hover { color: var(--nsm-surface); }

/* Global scope hint */
.nsm__scope-global-hint { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--nsm-tertiary); padding: 3px 10px; background: rgba(59, 130, 246, .08); border-radius: 999px; white-space: nowrap; }
.nsm__scope-global-hint::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #3b82f6; }

/* Picker button (workspace/session) */
.nsm__scope-picker-btn { display: inline-flex; align-items: center; gap: 6px; font-family: var(--nsm-font); font-size: 11px; font-weight: 500; padding: 4px 12px; border: 1px solid var(--nsm-border); border-radius: 7px; background: var(--nsm-surface); color: var(--nsm-text); cursor: pointer; transition: border-color .12s ease, background-color .12s ease; white-space: nowrap; }
.nsm__scope-picker-btn:hover { border-color: var(--nsm-border-strong); background: var(--nsm-hover); }
.nsm__scope-picker-btn[data-scope="workspace"] { color: #10b981; }
.nsm__scope-picker-btn[data-scope="session"] { color: #f59e0b; }
.nsm__scope-picker-btn .nsm__scope-count { display: inline-flex; align-items: center; justify-content: center; min-width: 16px; height: 16px; padding: 0 5px; border-radius: 8px; font-size: 10px; font-weight: 600; background: var(--nsm-bg); color: var(--nsm-secondary); font-variant-numeric: tabular-nums; }

/* ── Picker modal (tree selection) ── */
.nsm__picker { display: flex; flex-direction: column; gap: 0; }
.nsm__picker-search { box-sizing: border-box; width: 100%; padding: 8px 10px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-bg); color: var(--nsm-text); font-family: var(--nsm-font); font-size: 12px; }
.nsm__picker-search:focus { outline: none; border-color: var(--nsm-accent); }
.nsm__picker-tree { max-height: 52vh; overflow: auto; margin-top: 10px; }
.nsm__picker-group { border-bottom: 1px solid var(--nsm-border); }
.nsm__picker-group:last-child { border-bottom: none; }
.nsm__picker-group-head { display: flex; align-items: center; gap: 6px; padding: 8px 4px; font-size: 11.5px; font-weight: 600; color: var(--nsm-text); font-family: var(--nsm-font); }
.nsm__picker-group-arrow { font-size: 9px; color: var(--nsm-tertiary); transition: transform .15s ease; cursor: pointer; user-select: none; width: 12px; display: inline-block; text-align: center; }
.nsm__picker-group-arrow.is-open { transform: rotate(90deg); }
.nsm__picker-group-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nsm__picker-group-count { font-size: 10.5px; color: var(--nsm-tertiary); font-weight: 400; }
.nsm__picker-month { padding: 6px 4px 4px 20px; font-size: 10.5px; font-weight: 500; color: var(--nsm-tertiary); }
.nsm__picker-item { display: flex; align-items: center; gap: 8px; padding: 6px 4px 6px 28px; cursor: pointer; border-radius: 5px; transition: background-color .1s ease; }
.nsm__picker-item:hover { background: var(--nsm-hover); }
.nsm__picker-item.is-workspace { padding-left: 4px; }
.nsm__picker-item-label { flex: 1 1 auto; min-width: 0; font-size: 11.5px; color: var(--nsm-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nsm__picker-item-meta { font-size: 10px; color: var(--nsm-tertiary); font-variant-numeric: tabular-nums; }
.nsm__picker-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--nsm-border); margin-top: 4px; }
.nsm__picker-actions .nsm__picker-selected-info { font-size: 11px; color: var(--nsm-tertiary); }
.nsm__picker-actions .nsm__modal-footer { border-top: none; margin: 0; padding: 0; display: flex; gap: 8px; }
.nsm__rule-title-link { font-family: var(--nsm-font); font-size: 12.5px; font-weight: 500; color: var(--nsm-text); cursor: pointer; transition: color .12s ease; display: flex; align-items: center; gap: 8px; }
.nsm__rule-title-link:hover { color: var(--nsm-accent); }
.nsm__rule-title-link.is-disabled { color: var(--nsm-tertiary); text-decoration: line-through; }
.nsm__rule-content-preview { display: block; margin-top: 2px; max-width: 320px; font-size: 11px; color: var(--nsm-tertiary); line-height: 1.45; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nsm__rule-scope-cell { min-width: 72px; }
.nsm__scope-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 10px; font-size: 10.5px; font-weight: 500; line-height: 1.5; }
.nsm__scope-pill[data-scope="global"] { background: rgba(59, 130, 246, .12); color: #3b82f6; }
.nsm__scope-pill[data-scope="workspace"] { background: rgba(16, 185, 129, .12); color: #10b981; }
.nsm__scope-pill[data-scope="session"] { background: rgba(245, 158, 11, .12); color: #f59e0b; }
.nsm__rule-target-cell { min-width: 120px; max-width: 200px; color: var(--nsm-tertiary); font-family: var(--nsm-mono); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nsm__rule-updated-cell { min-width: 80px; color: var(--nsm-tertiary); font-size: 11px; }
.nsm__rule-actions { display: inline-flex; align-items: center; gap: 4px; }
/* Toggle switch */
.nsm__toggle { position: relative; display: inline-block; width: 28px; height: 16px; flex-shrink: 0; }
.nsm__toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
.nsm__toggle-track { position: absolute; inset: 0; border-radius: 8px; background: var(--nsm-border); transition: background-color .15s ease; cursor: pointer; }
.nsm__toggle-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: #fff; transition: transform .15s ease; }
.nsm__toggle input:checked + .nsm__toggle-track { background: var(--nsm-accent); }
.nsm__toggle input:checked + .nsm__toggle-track::after { transform: translateX(12px); }
.nsm__toggle input:focus-visible + .nsm__toggle-track { outline: 2px solid var(--nsm-accent); outline-offset: 1px; }
.nsm__icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: none; border-radius: var(--nsm-radius-sm); background: transparent; color: var(--nsm-secondary); cursor: pointer; transition: background-color .12s ease, color .12s ease; }
.nsm__icon-btn:hover { background: var(--nsm-hover); color: var(--nsm-text); }
.nsm__icon-btn.is-danger:hover { background: rgba(239, 68, 68, .1); color: #ef4444; }
/* Rule form in modal */
.nsm__form { display: flex; flex-direction: column; gap: 14px; }
.nsm__form-field { display: flex; flex-direction: column; gap: 6px; }
.nsm__form-label { font-family: var(--nsm-font); font-size: 11.5px; font-weight: 600; color: var(--nsm-secondary); letter-spacing: .01em; }
.nsm__form-input,
.nsm__form-textarea,
.nsm__form-select { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-bg); color: var(--nsm-text); font-family: inherit; font-size: 12.5px; line-height: 1.5; transition: border-color .12s ease, box-shadow .12s ease; }
.nsm__form-input:focus,
.nsm__form-textarea:focus,
.nsm__form-select:focus { outline: none; border-color: var(--nsm-accent); }
.nsm__form-textarea { min-height: 320px; resize: vertical; font-family: var(--nsm-mono); font-size: 11.5px; line-height: 1.55; }
.nsm__form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.nsm__form-label-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.nsm__form-preview-btn { font-family: var(--nsm-font); font-size: 11px; font-weight: 500; padding: 2px 10px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-bg); color: var(--nsm-secondary); cursor: pointer; transition: background-color .12s ease, color .12s ease, border-color .12s ease; }
.nsm__form-preview-btn:hover { border-color: var(--nsm-accent-line); color: var(--nsm-accent); background: var(--nsm-accent-soft); }
.nsm__markdown-preview { box-sizing: border-box; min-height: 320px; max-height: 60vh; overflow: auto; padding: 18px 20px; border: 1px solid var(--nsm-border); border-radius: var(--nsm-radius-sm); background: var(--nsm-muted-surface); font-size: 12.5px; line-height: 1.7; color: var(--nsm-text); }
.nsm__markdown-preview h1, .nsm__markdown-preview h2, .nsm__markdown-preview h3 { font-family: var(--nsm-font); margin: 10px 0 6px; font-weight: 600; color: var(--nsm-text); }
.nsm__markdown-preview h1 { font-size: 17px; }
.nsm__markdown-preview h2 { font-size: 15px; }
.nsm__markdown-preview h3 { font-size: 13.5px; }
.nsm__markdown-preview p { margin: 4px 0; }
.nsm__markdown-preview ul { margin: 6px 0 6px 20px; padding: 0; }
.nsm__markdown-preview li { margin: 2px 0; }
.nsm__markdown-preview strong { color: var(--nsm-text); }
.nsm__markdown-preview em { color: var(--nsm-secondary); font-style: italic; }
.nsm__markdown-preview code { font-family: var(--nsm-mono); font-size: 11.5px; padding: 1px 5px; border-radius: 3px; background: rgba(0,0,0,.06); color: #b91c1c; }
.nsm__form-target { display: flex; flex-direction: column; gap: 6px; }
.nsm__form-target-row { display: flex; gap: 8px; align-items: stretch; }
.nsm__form-target-row .nsm__form-input { flex: 1 1 200px; }
.nsm__form-enable { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: none; border-radius: var(--nsm-radius-sm); background: var(--nsm-muted-surface); }
.nsm__form-enable-label { font-size: 12px; color: var(--nsm-text); }
.nsm__modal-footer { display: flex; gap: 8px; justify-content: flex-end; padding-top: 10px; border-top: 1px solid var(--nsm-border); margin-top: 6px; }
.nsm__modal-footer .nsm__button--danger { margin-right: auto; }
@media (max-width: 600px) {
  .nsm__form-row { grid-template-columns: 1fr; }
}
@media (max-width: 1080px) {
  .nsm__layout { grid-template-columns: minmax(0, 1fr); }
  .nsm__aside { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
  .nsm__detail-card { grid-column: span 2; }
}
@media (max-width: 900px) {
  .nsm__workspace { grid-template-columns: 1fr; }
  .nsm__sidebar { position: static; flex-direction: row; overflow-x: auto; padding: 6px; }
  .nsm__module { flex: 1 1 45%; min-width: 140px; }
  .nsm__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .nsm__stat:nth-child(3) { border-left: 0; border-top: 1px solid var(--nsm-border); }
  .nsm__stat:nth-child(4) { border-top: 1px solid var(--nsm-border); }
  .nsm__inner { padding-left: 22px; padding-right: 22px; }
}
@media (max-width: 720px) {
  .nsm__header { gap: 16px; }
  .nsm__title { font-size: 21px; }
  .nsm__mark { width: 34px; height: 34px; padding: 7px; }
  .nsm__actions { width: 100%; }
  .nsm__actions .nsm__button { flex: 1 1 auto; }
  .nsm__toolbar { padding: 7px; }
  .nsm__viewtabs { order: 3; flex: 1 1 100%; }
  .nsm__viewtab { flex: 1; }
  .nsm__toolbar-spacer { display: none; }
  .nsm__row-path { max-width: 100%; }
  .nsm__row-meta { flex-wrap: wrap; }
  .nsm__aside { grid-template-columns: minmax(0, 1fr); }
  .nsm__detail-card { grid-column: auto; }
  .nsm__months { padding-left: 16px; }
  .nsm__row { padding-right: 5px; }
  .nsm__row-actions { opacity: 1; }
  .nsm__dialog { padding: 18px; }
}
@media (hover: none) {
  .nsm__row-actions { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .nsm__dot.is-live, .nsm__dot.is-pending { animation: none; }
  .nsm__spinner { animation-duration: 2s; }
  .nsm__button, .nsm__row, .nsm__chevron, .nsm__row-actions, .nsm__toast { transition: none; animation: none; }
}
`;

    function formatBytes(value) {
      const number = Number(value);
      if (!Number.isFinite(number) || number <= 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      const exponent = Math.min(units.length - 1, Math.floor(Math.log(number) / Math.log(1024)));
      const amount = number / 1024 ** exponent;
      return `${amount >= 10 || exponent === 0 ? Math.round(amount) : amount.toFixed(1)} ${units[exponent]}`;
    }

    function Glyph(props) {
      const size = typeof props.size === 'number' ? props.size : 14;
      const common = {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block' },
      };
      const name = props.name;
      if (name === 'check') return h('svg', common, h('path', { d: 'M3.2 8.2 6.4 11.3 12.8 4.8' }));
      if (name === 'minus') return h('svg', common, h('path', { d: 'M3.5 8h9' }));
      if (name === 'chevron') return h('svg', common, h('path', { d: 'M6 3.5 10.5 8 6 12.5' }));
      if (name === 'search') return h('svg', common, h('circle', { cx: 7, cy: 7, r: 4 }), h('path', { d: 'm10.2 10.2 3.1 3.1' }));
      if (name === 'close') return h('svg', common, h('path', { d: 'm4 4 8 8M12 4l-8 8' }));
      if (name === 'folder') return h('svg', common, h('path', { d: 'M2.2 5.2h11.6v7.1H2.2z' }), h('path', { d: 'M2.2 5.2V3.6h4l1.2 1.6' }));
      if (name === 'refresh') return h('svg', common, h('path', { d: 'M13 7a5 5 0 1 0-.9 3.6' }), h('path', { d: 'M13 3.2V7h-3.8' }));
      if (name === 'restore') return h('svg', common, h('path', { d: 'M3 7a5 5 0 1 1 .9 3.6' }), h('path', { d: 'M3 3.2V7h3.8' }), h('path', { d: 'M6.2 7h7.2v5.4H6.2z' }));
      if (name === 'import') return h('svg', common, h('path', { d: 'M8 2.2v7.2' }), h('path', { d: 'm5.2 6.8 2.8 2.8 2.8-2.8' }), h('path', { d: 'M2.6 10.8v2h10.8v-2' }));
      if (name === 'export') return h('svg', common, h('path', { d: 'M8 9.4V2.2' }), h('path', { d: 'm5.2 4.9 2.8-2.8 2.8 2.8' }), h('path', { d: 'M2.6 10.8v2h10.8v-2' }));
      if (name === 'trash') return h('svg', common, h('path', { d: 'M3.2 4.4h9.6' }), h('path', { d: 'M6.2 4.4V3h3.6v1.4' }), h('path', { d: 'M4.4 4.4l.6 8.3h6l.6-8.3' }), h('path', { d: 'M6.8 7v3.4M9.2 7v3.4' }));
      if (name === 'open') return h('svg', common, h('path', { d: 'M6.2 3.2H3.4v9.4h9.4V9.8' }), h('path', { d: 'M9.2 2.8h4v4' }), h('path', { d: 'm8.2 7.8 4.8-4.8' }));
      if (name === 'copy') return h('svg', common, h('rect', { x: 5.2, y: 5.2, width: 7.6, height: 7.6, rx: 1.2 }), h('path', { d: 'M10.8 5.2V3.4H3.2v7.6h1.8' }));
      if (name === 'archive') return h('svg', common, h('path', { d: 'M2.4 4.6h11.2v8H2.4z' }), h('path', { d: 'M2 2.8h12v2.2H2z' }), h('path', { d: 'M6.2 7.4h3.6' }));
      if (name === 'branch') return h('svg', common, h('circle', { cx: 4.5, cy: 3.6, r: 1.5 }), h('circle', { cx: 11.5, cy: 3.6, r: 1.5 }), h('circle', { cx: 8, cy: 12.4, r: 1.5 }), h('path', { d: 'M4.5 5.1v2.2c0 1.5 1.2 2.7 2.7 2.7h1.6' }), h('path', { d: 'M11.5 5.1v2.2c0 1.5-1.2 2.7-2.7 2.7H8v1' }));
      if (name === 'pin') return h('svg', common, h('path', { d: 'M9.7 2.6 13.4 6.3l-1.9.5-2.6 2.6-.2 2.1-1.3-1.3-2.6 2.6-.9-.9 2.6-2.6L5.2 8l2.1-.2 2.6-2.6.5-1.9Z' }));
      if (name === 'alert') return h('svg', common, h('path', { d: 'M8 2.5 14 13H2L8 2.5Z' }), h('path', { d: 'M8 6.2v3.1M8 11.4v.1' }));
      if (name === 'clock') return h('svg', common, h('circle', { cx: 8, cy: 8, r: 5.6 }), h('path', { d: 'M8 4.8V8l2.2 1.4' }));
      if (name === 'edit') return h('svg', common, h('path', { d: 'M4.2 10.6 10.4 4.4l2.8 2.8L7 13.4H4.2z' }), h('path', { d: 'M10.8 4l2.8 2.8' }));
      if (name === 'save') return h('svg', common, h('path', { d: 'M3.2 3.2h7.2l4 4V12.8H3.2z' }), h('path', { d: 'M6.4 12.8V9.2h3.2v3.6' }));
      if (name === 'plus') return h('svg', common, h('path', { d: 'M8 3.2v9.6M3.2 8h9.6' }));
      return h('svg', common, h('circle', { cx: 8, cy: 8, r: 5 }));
    }

    function Check(props) {
      const on = props.checked === true;
      const mixed = props.mixed === true;
      return h('button', {
        type: 'button',
        role: 'checkbox',
        className: `nsm__check${on ? ' is-on' : ''}${!on && mixed ? ' is-mixed' : ''}`,
        'aria-checked': mixed && !on ? 'mixed' : on ? 'true' : 'false',
        'aria-label': props.label || '',
        title: props.label || '',
        onClick: (event) => {
          event.stopPropagation();
          props.onChange(!on);
        },
      }, on ? h(Glyph, { name: 'check', size: 12 }) : mixed ? h(Glyph, { name: 'minus', size: 12 }) : null);
    }

    function PageMark(props) {
      const size = typeof props.size === 'number' ? props.size : 32;
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 32 32',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block' },
      },
        h('path', { d: 'M9 4.5v23' }),
        h('path', { d: 'M9 8.5h10M9 16h15M9 23.5h10' }),
        h('circle', { cx: 9, cy: 4.5, r: 2.3, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 19, cy: 8.5, r: 1.9, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 24, cy: 16, r: 1.9, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 19, cy: 23.5, r: 1.9, fill: 'currentColor', stroke: 'none' }),
      );
    }

    function ConfirmModal(props) {
      const { title, body, danger, confirmLabel, cancelLabel, onConfirm, onCancel, t } = props;
      const overlayRef = React.useRef(null);
      React.useEffect(() => {
        function onKey(e) {
          if (e.key === 'Escape') onCancel?.();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [onCancel]);
      return h('div', {
        className: 'nsm__modal is-open',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'nsm-confirm-title',
        ref: overlayRef,
        onClick: (e) => { if (e.target === overlayRef.current) onCancel?.(); },
      },
        h('div', { className: 'nsm__modal-card nsm__confirm-card' },
          h('div', { className: 'nsm__modal-head' },
            h('h3', { id: 'nsm-confirm-title' }, title),
          ),
          h('div', { className: 'nsm__modal-body' },
            h('p', null, body),
          ),
          h('div', { className: 'nsm__modal-footer' },
            h('button', { type: 'button', className: 'nsm__button', onClick: onCancel }, cancelLabel || t('rule.form.cancel')),
            h('button', {
              type: 'button',
              className: `nsm__button${danger ? ' nsm__button--danger' : ' nsm__button--primary'}`,
              onClick: onConfirm,
              autoFocus: true,
            }, confirmLabel || t('rule.form.save')),
          ),
        ));
    }

    // Minimal markdown → inline HTML (safe, no external deps)
    function renderMarkdown(md) {
      if (!md) return '';
      // 转义 HTML
      const escaped = String(md)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const lines = escaped.split('\n');
      const out = [];
      let inList = false;
      for (const rawLine of lines) {
        const line = rawLine.replace(/\s+$/, '');
        if (!line.trim()) {
          if (inList) { out.push('</ul>'); inList = false; }
          continue;
        }
        // Headings
        const h = line.match(/^(#{1,3})\s+(.+)$/);
        if (h) {
          if (inList) { out.push('</ul>'); inList = false; }
          const level = h[1].length;
          out.push(`<h${level}>${h[2]}</h${level}>`);
          continue;
        }
        // List items
        const li = line.match(/^[-*]\s+(.+)$/);
        if (li) {
          if (!inList) { out.push('<ul>'); inList = true; }
          out.push(`<li>${li[1]}</li>`);
          continue;
        }
        // Numbered list
        const nl = line.match(/^\d+\.\s+(.+)$/);
        if (nl) {
          if (!inList) { out.push('<ul>'); inList = true; }
          out.push(`<li>${nl[1]}</li>`);
          continue;
        }
        if (inList) { out.push('</ul>'); inList = false; }
        // Inline: **bold** *italic* `code`
        let inline = line
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>');
        out.push(`<p>${inline}</p>`);
      }
      if (inList) out.push('</ul>');
      return out.join('');
    }

    function RuleFormModal(props) {
      const { form, onClose, onChange, onSave, onDelete, t } = props;
      const [titleErr, setTitleErr] = React.useState(false);
      const [contentErr, setContentErr] = React.useState(false);
      const [preview, setPreview] = React.useState(false);
      const overlayRef = React.useRef(null);
      const titleRef = React.useRef(null);

      React.useEffect(() => {
        titleRef.current?.focus();
      }, []);

      React.useEffect(() => {
        function onKey(e) { if (e.key === 'Escape') onClose?.(); }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [onClose]);

      function handleSubmit(e) {
        e.preventDefault?.();
        const titleEmpty = !form?.title?.trim();
        const contentEmpty = !form?.content?.trim();
        setTitleErr(titleEmpty);
        setContentErr(contentEmpty);
        if (titleEmpty || contentEmpty) return;
        onSave?.({ title: form.title.trim(), content: form.content.trim() });
      }

      function onKeydown(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e);
      }

      return h('div', {
        className: 'nsm__modal is-open', role: 'dialog', 'aria-modal': 'true',
        'aria-labelledby': 'nsm-rule-form-title', ref: overlayRef,
        onClick: (e) => { if (e.target === overlayRef.current) onClose?.(); },
      },
        h('div', { className: 'nsm__modal-card nsm__form-card nsm__form-card--rule' },
          h('div', { className: 'nsm__modal-head' },
            h('h3', { id: 'nsm-rule-form-title' }, form?.id ? t('rule.form.editTitle') : t('rule.form.newTitle')),
            h('button', { type: 'button', className: 'nsm__modal-close', 'aria-label': t('rule.form.cancel'), onClick: onClose }, h(Glyph, { name: 'close', size: 14 })),
          ),
          h('form', { className: 'nsm__form', onSubmit: handleSubmit, onKeyDown: onKeydown },
            h('div', { className: 'nsm__form-field' },
              h('label', { className: 'nsm__form-label', htmlFor: 'nsm-rule-title' }, t('rule.form.titleLabel')),
              h('input', {
                id: 'nsm-rule-title', ref: titleRef,
                type: 'text',
                className: `nsm__form-input${titleErr ? ' is-error' : ''}`,
                value: form?.title || '',
                placeholder: t('rule.form.titlePlaceholder'),
                maxLength: 120,
                onChange: (e) => { setTitleErr(false); onChange?.({ title: e.target.value }); },
              }),
            ),
            h('div', { className: 'nsm__form-field' },
              h('div', { className: 'nsm__form-label-row' },
                h('label', { className: 'nsm__form-label', htmlFor: 'nsm-rule-content' }, t('rule.form.contentLabel')),
                h('button', {
                  type: 'button', className: 'nsm__form-preview-btn',
                  onClick: () => setPreview((v) => !v),
                }, preview ? t('rule.form.editMode') : t('rule.form.previewMode')),
              ),
              preview
                ? h('div', {
                    className: 'nsm__markdown-preview',
                    dangerouslySetInnerHTML: { __html: renderMarkdown(form?.content || '') },
                  })
                : h('textarea', {
                    id: 'nsm-rule-content',
                    className: `nsm__form-textarea${contentErr ? ' is-error' : ''}`,
                    value: form?.content || '',
                    placeholder: t('rule.form.contentPlaceholder'),
                    rows: 12,
                    onChange: (e) => { setContentErr(false); onChange?.({ content: e.target.value }); },
                  }),
              h('p', { className: 'nsm__form-hint' }, t('rule.form.markdownHint')),
            ),
            h('div', { className: 'nsm__modal-footer' },
              onDelete
                ? h('button', { type: 'button', className: 'nsm__button nsm__button--danger', onClick: onDelete }, t('rule.form.delete'))
                : null,
              h('button', { type: 'button', className: 'nsm__button', onClick: onClose }, t('rule.form.cancel')),
              h('button', { type: 'submit', className: 'nsm__button nsm__button--primary' }, h(Glyph, { name: 'save', size: 12 }), t('rule.form.save')),
            ),
          ),
        ));
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const localeService = ctx.get('locale');
        const layoutService = ctx.get('layout');

        if (localeService && typeof localeService.register === 'function') {
          const zhCodes = ['zh', 'zh-CN', 'zh-Hans', 'zh-Hant', 'zh-TW', 'zh-HK'];
          const enCodes = ['en', 'en-US', 'en-GB'];
          for (const code of zhCodes) {
            ctx.effect(() => localeService.register(NS, code, DICTIONARIES.zh), `nanshan-session-manager: ${code} strings`);
          }
          for (const code of enCodes) {
            ctx.effect(() => localeService.register(NS, code, DICTIONARIES.en), `nanshan-session-manager: ${code} strings`);
          }
        }

        function activeLocale() {
          if (localeService && typeof localeService.getSnapshot === 'function') {
            const snapshot = localeService.getSnapshot();
            if (snapshot && typeof snapshot.active === 'string' && snapshot.active !== '') return snapshot.active;
          }
          if (typeof navigator !== 'undefined' && typeof navigator.language === 'string' && navigator.language !== '') return navigator.language;
          return 'en';
        }

        function systemLocale() {
          if (typeof navigator !== 'undefined' && typeof navigator.language === 'string' && navigator.language !== '') return navigator.language;
          return '';
        }

        function useChinese() {
          const system = systemLocale().toLowerCase();
          if (system.startsWith('zh')) return true;
          if (system.startsWith('en')) return false;
          return activeLocale().toLowerCase().startsWith('zh');
        }

        function localized(key) {
          const chinese = useChinese();
          const primary = chinese ? DICTIONARIES.zh : DICTIONARIES.en;
          const fallback = chinese ? DICTIONARIES.en : DICTIONARIES.zh;
          return primary[key] ?? fallback[key] ?? key;
        }

        function tr(key, values) {
          let text = localized(key);
          if (values) {
            for (const [name, value] of Object.entries(values)) {
              text = text.split(`{${name}}`).join(String(value));
            }
          }
          return text;
        }

        function activeLocaleTag() {
          return useChinese() ? 'zh-CN' : 'en';
        }

        function useTranslate() {
          const [, increment] = React.useState(0);
          React.useEffect(() => {
            if (!localeService || typeof localeService.subscribe !== 'function') return undefined;
            return localeService.subscribe(() => increment((value) => value + 1));
          }, []);
          return localized;
        }

        function formatDateTime(value) {
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return '—';
          try {
            return date.toLocaleString(activeLocaleTag(), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          } catch {
            return date.toISOString().slice(0, 16).replace('T', ' ');
          }
        }

        function formatDate(value) {
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return '—';
          try {
            return date.toLocaleDateString(activeLocaleTag(), { year: 'numeric', month: 'short', day: 'numeric' });
          } catch {
            return date.toISOString().slice(0, 10);
          }
        }

        function relativeTime(value) {
          const timestamp = Number(value);
          if (!Number.isFinite(timestamp) || timestamp <= 0) return '—';
          const delta = Date.now() - timestamp;
          if (delta < 60_000) return tr('relative.justNow');
          if (delta < 3_600_000) return tr('relative.minutes', { n: Math.max(1, Math.floor(delta / 60_000)) });
          if (delta < 86_400_000) return tr('relative.hours', { n: Math.max(1, Math.floor(delta / 3_600_000)) });
          if (delta < 7 * 86_400_000) return tr('relative.days', { n: Math.max(1, Math.floor(delta / 86_400_000)) });
          return formatDate(timestamp);
        }

        function monthKey(value) {
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return '0000-00';
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        function monthLabel(key) {
          const parts = key.split('-').map(Number);
          if (!Number.isFinite(parts[0]) || !Number.isFinite(parts[1]) || parts[0] === 0) return key;
          const date = new Date(parts[0], parts[1] - 1, 1);
          try {
            return date.toLocaleDateString(activeLocaleTag(), { year: 'numeric', month: 'long' });
          } catch {
            return key;
          }
        }

        function shortPath(value) {
          if (typeof value !== 'string' || value === '') return tr('tree.noPath');
          return value.replace(/^\/Users\/[^/]+/, '~');
        }

        function baseName(value) {
          if (typeof value !== 'string' || value === '') return '';
          const parts = value.split(/[\\/]/).filter(Boolean);
          return parts.length > 0 ? parts[parts.length - 1] : value;
        }

        function buildGroups(sessions) {
          const map = new Map();
          for (const session of sessions) {
            const group = session.group && typeof session.group === 'object'
              ? session.group
              : { kind: 'none', id: 'ungrouped', title: '', path: null };
            const key = typeof group.id === 'string' && group.id !== '' ? group.id : 'ungrouped';
            let entry = map.get(key);
            if (entry === undefined) {
              entry = { ...group, key, sessions: [], bytes: 0 };
              map.set(key, entry);
            }
            entry.sessions.push(session);
            entry.bytes += Number(session.sizeBytes) || 0;
          }
          const groups = [...map.values()];
          for (const group of groups) {
            group.sessions.sort((left, right) => right.updatedAt - left.updatedAt || right.createdAt - left.createdAt);
            const months = new Map();
            for (const session of group.sessions) {
              const key = monthKey(session.updatedAt || session.createdAt);
              let month = months.get(key);
              if (month === undefined) {
                month = { key, sessions: [], bytes: 0 };
                months.set(key, month);
              }
              month.sessions.push(session);
              month.bytes += Number(session.sizeBytes) || 0;
            }
            group.months = [...months.values()].sort((left, right) => right.key.localeCompare(left.key));
          }
          groups.sort((left, right) => {
            if (left.kind === 'none') return 1;
            if (right.kind === 'none') return -1;
            return String(left.title || '').localeCompare(String(right.title || ''));
          });
          return groups;
        }

        function buildTrashGroups(entries) {
          const months = new Map();
          for (const entry of entries) {
            const key = monthKey(entry.deletedAt);
            let month = months.get(key);
            if (month === undefined) {
              month = { key, entries: [], bytes: 0 };
              months.set(key, month);
            }
            month.entries.push(entry);
            month.bytes += Number(entry.sizeBytes) || 0;
          }
          const groups = [...months.values()];
          for (const group of groups) group.entries.sort((left, right) => right.deletedAt - left.deletedAt);
          groups.sort((left, right) => right.key.localeCompare(left.key));
          return groups;
        }

        function groupTitle(group) {
          if (group.kind === 'none') return tr('tree.ungrouped');
          return group.title || baseName(group.path) || tr('tree.ungrouped');
        }

        async function post(path, body) {
          const response = await fetch(`${API}${path}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          });
          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload || payload.ok !== true) {
            const message = payload && typeof payload.message === 'string' ? payload.message : `HTTP ${response.status}`;
            const error = new Error(message);
            error.payload = payload;
            throw error;
          }
          return payload;
        }

        function triggerDownload(url) {
          const link = document.createElement('a');
          link.href = url;
          link.download = '';
          link.rel = 'noopener';
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

        function Page() {
          const t = useTranslate();
          const [data, setData] = React.useState(null);
          const [status, setStatus] = React.useState('loading');
          const [error, setError] = React.useState('');
          const [query, setQuery] = React.useState('');
          const [view, setView] = React.useState('sessions');
          const [stateFilter, setStateFilter] = React.useState('all');
          const [selectedIds, setSelectedIds] = React.useState([]);
          const [selectedTrashIds, setSelectedTrashIds] = React.useState([]);
          const [focusedId, setFocusedId] = React.useState(null);
          const [focusedTrashId, setFocusedTrashId] = React.useState(null);
          const [collapsed, setCollapsed] = React.useState(() => new Set());
          const collapseInitializedRef = React.useRef(false);
          const [confirm, setConfirm] = React.useState(null);
          const [busy, setBusy] = React.useState(false);
          const [importing, setImporting] = React.useState(false);
          const [importReport, setImportReport] = React.useState(null);
          const [toast, setToast] = React.useState(null);
          const [dragActive, setDragActive] = React.useState(false);
          const [activeModule, setActiveModule] = React.useState('session');
          const [rulesData, setRulesData] = React.useState({});
          const [rulesStatus, setRulesStatus] = React.useState('idle');
          const [ruleForm, setRuleForm] = React.useState(null);
          const [deleteRuleId, setDeleteRuleId] = React.useState(null);
          const [collapsedRules, setCollapsedRules] = React.useState({});
          const [picker, setPicker] = React.useState(null); // { ruleId, scope, targets, expanded, search }
          const [sessionsData, setSessionsData] = React.useState(null); // tree data for picker
          const rulesLoadedRef = React.useRef(false);
          const dataRef = React.useRef(null);
          const dragDepth = React.useRef(0);
          const fileInputRef = React.useRef(null);
          const toastSeq = React.useRef(0);

          const showToast = React.useCallback((kind, text, action) => {
            toastSeq.current += 1;
            setToast({ kind, text, action, seq: toastSeq.current });
          }, []);

          // ── Rule module helpers ──
          const loadRules = React.useCallback(async () => {
            setRulesStatus('loading');
            try {
              const rules = await loadRulesApi();
              setRulesData(rules);
              rulesLoadedRef.current = true;
              setRulesStatus('ready');
            } catch (err) {
              setRulesStatus('error');
              showToast('error', t('rule.loadError'));
            }
          }, [showToast, t]);

          // Auto-load rules when switching to rule module for the first time
          React.useEffect(() => {
            if (activeModule === 'rule' && !rulesLoadedRef.current) {
              loadRules();
            }
          }, [activeModule, loadRules]);

          const handleToggleRule = React.useCallback(async (id, enabled) => {
            // Optimistic update
            setRulesData((prev) => {
              const next = { ...prev };
              if (next[id]) next[id] = { ...next[id], enabled, updatedAt: Date.now() };
              return next;
            });
            try {
              await toggleRuleApi(id, enabled);
            } catch {
              // Revert
              setRulesData((prev) => {
                const next = { ...prev };
                if (next[id]) next[id] = { ...next[id], enabled: !enabled };
                return next;
              });
              showToast('error', t('rule.saveError'));
            }
          }, [showToast, t]);

          const handleScopeChange = React.useCallback(async (id, nextScope) => {
            const targets = nextScope === 'global' ? [] : (rulesData[id]?.targets || []);
            // Optimistic
            setRulesData((prev) => {
              const next = { ...prev };
              if (next[id]) next[id] = { ...next[id], scope: nextScope, targets, updatedAt: Date.now() };
              return next;
            });
            try {
              await updateRuleApi({ id, scope: nextScope, targets });
            } catch {
              setRulesData((prev) => ({ ...prev }));
              showToast('error', t('rule.saveError'));
            }
          }, [rulesData, showToast, t]);

          // Lazy-load sessions tree data for picker
          const ensureSessionsData = React.useCallback(async () => {
            if (sessionsData && sessionsData.length) return sessionsData;
            try {
              const data = await apiFetch('');
              const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
              setSessionsData(sessions);
              return sessions;
            } catch {
              return [];
            }
          }, [sessionsData]);

          const openPicker = React.useCallback(async (ruleId, scope, existingTargets) => {
            await ensureSessionsData();
            setPicker({
              ruleId,
              scope,
              targets: Array.isArray(existingTargets) ? [...existingTargets] : [],
              expanded: {},
              search: '',
            });
          }, [ensureSessionsData]);

          const closePicker = React.useCallback(() => setPicker(null), []);

          const handlePickerConfirm = React.useCallback(async () => {
            if (!picker) return;
            try {
              await updateRuleApi({ id: picker.ruleId, scope: picker.scope, targets: picker.targets });
              setRulesData((prev) => {
                const next = { ...prev };
                if (next[picker.ruleId]) next[picker.ruleId] = { ...next[picker.ruleId], scope: picker.scope, targets: picker.targets, updatedAt: Date.now() };
                return next;
              });
              showToast('ok', t('rule.saved'));
              setPicker(null);
            } catch {
              showToast('error', t('rule.saveError'));
            }
          }, [picker, showToast, t]);

          const togglePickerTarget = React.useCallback((targetId) => {
            setPicker((prev) => {
              if (!prev) return prev;
              const has = prev.targets.includes(targetId);
              return { ...prev, targets: has ? prev.targets.filter((t) => t !== targetId) : [...prev.targets, targetId] };
            });
          }, []);

          const togglePickerGroup = React.useCallback((key) => {
            setPicker((prev) => prev ? { ...prev, expanded: { ...prev.expanded, [key]: !prev.expanded[key] } } : prev);
          }, []);

          const toggleRuleCollapsed = React.useCallback((id) => {
            setCollapsedRules((prev) => ({ ...prev, [id]: !prev[id] }));
          }, []);

          const handleDeleteRule = React.useCallback(async (id) => {
            try {
              await deleteRuleApi(id);
              setRulesData((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
              });
              setDeleteRuleId(null);
              showToast('ok', t('rule.deleted'));
            } catch {
              showToast('error', t('rule.saveError'));
            }
          }, [showToast, t]);

          const handleSaveRule = React.useCallback(async (form) => {
            try {
              let saved;
              if (form.id) {
                // Update: only title + content (scope/enabled not exposed in UI)
                saved = await updateRuleApi({ id: form.id, title: form.title, content: form.content });
                showToast('ok', t('rule.saved'));
              } else {
                // Create: default scope=global, enabled=true
                saved = await createRuleApi({ title: form.title, content: form.content, scope: 'global', targets: [], enabled: false });
                showToast('ok', t('rule.created'));
              }
              setRulesData((prev) => ({ ...prev, [saved.id]: saved }));
              setRuleForm(null);
            } catch (err) {
              showToast('error', t('rule.saveError'));
            }
          }, [showToast, t]);

          // Computed: filtered + sorted rules
          const computedRules = React.useMemo(() => {
            const all = Object.values(rulesData);
            all.sort((a, b) => b.updatedAt - a.updatedAt);
            return all;
          }, [rulesData]);

          const ruleStats = React.useMemo(() => {
            const total = Object.keys(rulesData).length;
            let enabled = 0;
            const byScope = { global: 0, workspace: 0, session: 0 };
            for (const r of Object.values(rulesData)) {
              if (r.enabled) enabled++;
              byScope[r.scope] = (byScope[r.scope] || 0) + 1;
            }
            return { total, enabled, byScope };
          }, [rulesData]);

          const fetchList = React.useCallback(async (signal) => {
            const response = await fetch(API, { method: 'GET', credentials: 'same-origin', headers: { accept: 'application/json' }, signal });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload || payload.ok !== true) {
              throw new Error(payload && payload.message ? payload.message : `HTTP ${response.status}`);
            }
            return payload;
          }, []);

          const load = React.useCallback(async (options = {}) => {
            if (!options.silent) setStatus(dataRef.current === null ? 'loading' : 'refreshing');
            setError('');
            try {
              const payload = await fetchList(options.signal);
              if (!collapseInitializedRef.current) {
                collapseInitializedRef.current = true;
                setCollapsed(new Set(buildGroups(Array.isArray(payload.sessions) ? payload.sessions : []).map((group) => group.key)));
              }
              dataRef.current = payload;
              setData(payload);
              setStatus('ready');
            } catch (failure) {
              if (failure && failure.name === 'AbortError') return;
              setError(t('error.load'));
              setStatus(dataRef.current === null ? 'error' : 'ready');
            }
          }, [fetchList, t]);

          React.useEffect(() => {
            const controller = new AbortController();
            load({ signal: controller.signal });
            return () => controller.abort();
          }, [load]);

          React.useEffect(() => {
            const timer = setInterval(() => {
              if (document.visibilityState === 'visible' && !document.querySelector('.nsm__modal')) load({ silent: true });
            }, 30_000);
            return () => clearInterval(timer);
          }, [load]);

          React.useEffect(() => {
            if (!toast) return undefined;
            const timer = setTimeout(() => setToast(null), toast.action ? 7000 : 4200);
            return () => clearTimeout(timer);
          }, [toast]);

          React.useEffect(() => {
            if (!data) return;
            const ids = new Set(data.sessions.map((session) => session.id));
            const trashIds = new Set((Array.isArray(data.trash) ? data.trash : []).map((entry) => entry.trashId));
            setSelectedIds((previous) => previous.filter((id) => ids.has(id)));
            setFocusedId((previous) => previous !== null && ids.has(previous) ? previous : null);
            setSelectedTrashIds((previous) => previous.filter((id) => trashIds.has(id)));
            setFocusedTrashId((previous) => previous !== null && trashIds.has(previous) ? previous : null);
          }, [data]);

          React.useEffect(() => {
            setSelectedIds([]);
            setSelectedTrashIds([]);
            setFocusedId(null);
            setFocusedTrashId(null);
          }, [view]);

          React.useEffect(() => {
            if (!confirm) return undefined;
            const onKeyDown = (event) => {
              if (event.key === 'Escape' && !busy) setConfirm(null);
            };
            window.addEventListener('keydown', onKeyDown);
            return () => window.removeEventListener('keydown', onKeyDown);
          }, [confirm, busy]);

          const sessions = data && Array.isArray(data.sessions) ? data.sessions : [];
          const trash = data && Array.isArray(data.trash) ? data.trash : [];
          const stats = data && data.stats ? data.stats : { total: 0, groups: 0, live: 0, archived: 0, trash: 0, bytes: 0 };
          const normalizedQuery = query.trim().toLocaleLowerCase();
          const filterCounts = React.useMemo(() => ({
            all: sessions.length,
            running: sessions.filter((session) => session.running).length,
            open: sessions.filter((session) => session.live && !session.running).length,
            archived: sessions.filter((session) => session.archived).length,
            subagent: sessions.filter((session) => session.origin === 'subagent').length,
            pinned: sessions.filter((session) => session.pinned).length,
            migration: sessions.filter((session) => session.formatStatus === 'migration-required').length,
          }), [sessions]);
          const visibleSessions = React.useMemo(() => {
            return sessions.filter((session) => {
              if (normalizedQuery !== '' && !session.id.toLocaleLowerCase().includes(normalizedQuery)) return false;
              if (stateFilter === 'running') return session.running === true;
              if (stateFilter === 'open') return session.live === true && session.running !== true;
              if (stateFilter === 'archived') return session.archived === true;
              if (stateFilter === 'subagent') return session.origin === 'subagent';
              if (stateFilter === 'pinned') return session.pinned === true;
              if (stateFilter === 'migration') return session.formatStatus === 'migration-required';
              return true;
            });
          }, [sessions, normalizedQuery, stateFilter]);
          const groups = React.useMemo(() => buildGroups(visibleSessions), [visibleSessions]);
          const visibleIds = React.useMemo(() => visibleSessions.map((session) => session.id), [visibleSessions]);
          const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
          const selectedSessions = React.useMemo(() => sessions.filter((session) => selectedSet.has(session.id)), [sessions, selectedSet]);
          const focusedSession = React.useMemo(() => sessions.find((session) => session.id === focusedId) || null, [sessions, focusedId]);
          const selectedBytes = selectedSessions.reduce((total, session) => total + (Number(session.sizeBytes) || 0), 0);
          const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
          const someVisibleSelected = !allVisibleSelected && visibleIds.some((id) => selectedSet.has(id));
          const canDeleteSelected = selectedSessions.some((session) => session.exists);
          const visibleTrash = React.useMemo(() => {
            if (normalizedQuery === '') return trash;
            return trash.filter((entry) => entry.id.toLocaleLowerCase().includes(normalizedQuery));
          }, [trash, normalizedQuery]);
          const trashGroups = React.useMemo(() => buildTrashGroups(visibleTrash), [visibleTrash]);
          const visibleTrashIds = React.useMemo(() => visibleTrash.map((entry) => entry.trashId), [visibleTrash]);
          const trashSelectedSet = React.useMemo(() => new Set(selectedTrashIds), [selectedTrashIds]);
          const selectedTrashEntries = React.useMemo(() => trash.filter((entry) => trashSelectedSet.has(entry.trashId)), [trash, trashSelectedSet]);
          const focusedTrash = React.useMemo(() => trash.find((entry) => entry.trashId === focusedTrashId) || null, [trash, focusedTrashId]);
          const selectedTrashBytes = selectedTrashEntries.reduce((total, entry) => total + (Number(entry.sizeBytes) || 0), 0);
          const allTrashSelected = visibleTrashIds.length > 0 && visibleTrashIds.every((id) => trashSelectedSet.has(id));
          const someTrashSelected = !allTrashSelected && visibleTrashIds.some((id) => trashSelectedSet.has(id));
          const activeVisibleIds = view === 'trash' ? visibleTrashIds : visibleIds;
          const activeAllSelected = view === 'trash' ? allTrashSelected : allVisibleSelected;
          const activeSomeSelected = view === 'trash' ? someTrashSelected : someVisibleSelected;
          const activeSelectionCount = view === 'trash' ? selectedTrashIds.length : selectedIds.length;
          const sessionCount = (n) => n === 1 ? t('tree.countOne') : tr('tree.count', { n });
          const trashCount = (n) => n === 1 ? t('trash.countOne') : tr('trash.count', { n });

          function toggleSelected(ids, on) {
            setSelectedIds((previous) => {
              const next = new Set(previous);
              for (const id of ids) {
                if (on) next.add(id);
                else next.delete(id);
              }
              return [...next];
            });
          }

          function toggleOne(id) {
            setSelectedIds((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
          }

          function toggleTrashSelected(ids, on) {
            setSelectedTrashIds((previous) => {
              const next = new Set(previous);
              for (const id of ids) {
                if (on) next.add(id);
                else next.delete(id);
              }
              return [...next];
            });
          }

          function toggleTrashOne(id) {
            setSelectedTrashIds((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
          }

          function toggleCollapsed(key) {
            setCollapsed((previous) => {
              const next = new Set(previous);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            });
          }

          function allGroupKeys() {
            const keys = [];
            if (view === 'trash') {
              for (const group of trashGroups) keys.push(`trash:${group.key}`);
              return keys;
            }
            for (const group of groups) {
              keys.push(group.key);
              for (const month of group.months) keys.push(`${group.key}::${month.key}`);
            }
            return keys;
          }

          function expandAll() {
            setCollapsed(new Set());
          }

          function collapseAll() {
            setCollapsed(new Set(allGroupKeys()));
          }

          async function refreshNative() {
            const sessionsService = ctx.get('sessions');
            if (sessionsService && typeof sessionsService.refresh === 'function') {
              try {
                await sessionsService.refresh();
              } catch {
                // The local page has its own fresh list; the native sidebar can lag.
              }
            }
          }

          async function openSession(session) {
            const workspacesService = ctx.get('workspaces');
            if (session.archived && workspacesService && typeof workspacesService.unarchiveSession === 'function') {
              try {
                await workspacesService.unarchiveSession(session.id);
                await load({ silent: true });
              } catch {
                // Opening still has a chance if the session is already visible.
              }
            }
            const uiWorkspace = ctx.get('uiWorkspace');
            if (uiWorkspace && typeof uiWorkspace.openSession === 'function') {
              try {
                uiWorkspace.openSession(session.id);
                return;
              } catch {
                // Fall through to the explanatory toast.
              }
            }
            const layout = ctx.get('layout');
            if (layout && typeof layout.selectPanel === 'function') layout.selectPanel(null);
            showToast('error', t('toast.openUnavailable'));
          }

          function goBack() {
            if (layoutService && typeof layoutService.selectPanel === 'function') layoutService.selectPanel(null);
          }

          function requestDelete(ids) {
            const targets = sessions.filter((session) => ids.includes(session.id));
            if (targets.length === 0) return;
            const active = targets.filter((session) => session.live).length;
            setConfirm({
              kind: 'delete',
              ids: targets.map((session) => session.id),
              titles: targets.map((session) => session.title || t('untitled')),
              active,
            });
          }

          function requestPurge(trashIds) {
            const selected = trash.filter((entry) => trashIds.includes(entry.trashId));
            const targets = selected.filter((entry) => entry.pending !== true);
            if (targets.length === 0) {
              if (selected.length > 0) showToast('info', t('trash.pendingPurge'));
              return;
            }
            setConfirm({
              kind: 'purge',
              trashIds: targets.map((entry) => entry.trashId),
              titles: targets.map((entry) => entry.title || t('untitled')),
            });
          }

          async function restoreEntries(trashIds) {
            if (!Array.isArray(trashIds) || trashIds.length === 0 || busy) return;
            setBusy(true);
            try {
              const result = await post('/restore', { trashIds });
              const restored = Array.isArray(result.restored) ? result.restored : [];
              const skipped = (Array.isArray(result.skipped) ? result.skipped.length : 0) + (Array.isArray(result.errors) ? result.errors.length : 0);
              setSelectedTrashIds((previous) => previous.filter((id) => !trashIds.includes(id)));
              setFocusedTrashId(null);
              await load({ silent: true });
              await refreshNative();
              if (restored.length > 0) {
                showToast(skipped > 0 ? 'info' : 'ok', skipped > 0
                  ? `${tr('toast.restored', { n: restored.length })} · ${tr('toast.partial', { n: skipped })}`
                  : tr('toast.restored', { n: restored.length }));
              } else {
                showToast('error', t('error.restore'));
              }
            } catch (failure) {
              showToast('error', failure && failure.message ? failure.message : t('error.restore'));
            } finally {
              setBusy(false);
            }
          }

          async function performConfirm() {
            if (!confirm || busy) return;
            setBusy(true);
            try {
              if (confirm.kind === 'purge') {
                const result = await post('/purge', { trashIds: confirm.trashIds });
                const purged = Array.isArray(result.purged) ? result.purged : [];
                const skipped = (Array.isArray(result.skipped) ? result.skipped.length : 0) + (Array.isArray(result.errors) ? result.errors.length : 0);
                setConfirm(null);
                setSelectedTrashIds((previous) => previous.filter((id) => !confirm.trashIds.includes(id)));
                await load({ silent: true });
                if (purged.length > 0) {
                  showToast(skipped > 0 ? 'info' : 'ok', skipped > 0
                    ? `${tr('toast.purged', { n: purged.length })} · ${tr('toast.partial', { n: skipped })}`
                    : tr('toast.purged', { n: purged.length }));
                } else {
                  showToast('error', t('error.purge'));
                }
                return;
              }

              const result = await post('/delete', { ids: confirm.ids, stopActive: true });
              const deleted = Array.isArray(result.deleted) ? result.deleted : [];
              const trashIds = Array.isArray(result.trashIds) ? result.trashIds : [];
              const pending = Array.isArray(result.pending) ? result.pending : [];
              const skipped = (Array.isArray(result.skipped) ? result.skipped.length : 0) + (Array.isArray(result.errors) ? result.errors.length : 0);
              setConfirm(null);
              setSelectedIds((previous) => previous.filter((id) => !deleted.includes(id)));
              await load({ silent: true });
              await refreshNative();
              if (!document.querySelector('.nsm')) {
                try { layoutService?.selectPanel?.(PANEL_ID); } catch { /* The panel can be reopened from the sidebar. */ }
              }
              if (deleted.length > 0) {
                let message = tr('toast.deleted', { n: deleted.length });
                if (pending.length > 0) message += ` · ${tr('toast.movedPending', { n: pending.length })}`;
                if (skipped > 0) message += ` · ${tr('toast.partial', { n: skipped })}`;
                const undo = trashIds.length > 0
                  ? { label: t('action.undo'), onClick: () => restoreEntries(trashIds) }
                  : undefined;
                showToast(skipped > 0 ? 'info' : 'ok', message, undo);
              } else {
                showToast('error', t('error.action'));
              }
            } catch (failure) {
              showToast('error', failure && failure.message ? failure.message : t('error.action'));
            } finally {
              setBusy(false);
            }
          }

          function exportSessions(ids) {
            const list = Array.isArray(ids) ? ids.filter((id) => typeof id === 'string' && id !== '') : [];
            if (sessions.length === 0) {
              showToast('error', t('toast.noExport'));
              return;
            }
            const url = list.length > 0 ? `${API}/export?ids=${encodeURIComponent(list.join(','))}` : `${API}/export`;
            triggerDownload(url);
            showToast('info', t('toast.exportStarted'));
          }

          async function importFiles(files) {
            const list = Array.from(files || []).filter((file) => file && /\.json$/i.test(file.name || ''));
            if (list.length === 0) {
              showToast('error', t('error.action'));
              return;
            }
            setImporting(true);
            setImportReport(null);
            let imported = 0;
            let skipped = 0;
            let failed = 0;
            const details = [];
            for (const file of list) {
              try {
                const text = await file.text();
                let bundle;
                try {
                  bundle = JSON.parse(text);
                } catch {
                  failed += 1;
                  details.push(`${file.name}: JSON`);
                  continue;
                }
                const result = await post('/import', bundle);
                imported += Number(result.imported) || 0;
                skipped += Array.isArray(result.skipped) ? result.skipped.length : 0;
                failed += Array.isArray(result.errors) ? result.errors.length : 0;
                for (const item of Array.isArray(result.skipped) ? result.skipped.slice(0, 3) : []) {
                  details.push(`${file.name}: ${String(item.reason || 'skipped')}`);
                }
                for (const item of Array.isArray(result.errors) ? result.errors.slice(0, 3) : []) {
                  details.push(`${file.name}: ${String(item.message || 'failed')}`);
                }
              } catch (failure) {
                failed += 1;
                details.push(`${file.name}: ${failure && failure.message ? failure.message : 'failed'}`);
              }
            }
            setImportReport({ imported, skipped, failed, details });
            await load({ silent: true });
            await refreshNative();
            setImporting(false);
            if (imported > 0) {
              showToast(skipped + failed > 0 ? 'info' : 'ok', skipped + failed > 0
                ? `${tr('toast.imported', { n: imported })} · ${tr('toast.partial', { n: skipped + failed })}`
                : tr('toast.imported', { n: imported }));
            } else {
              showToast('error', details.length > 0 ? details[0] : t('error.action'));
            }
          }

          function onFilePicked(event) {
            // Snapshot the FileList before clearing the input: setting value to
            // '' can empty the live list and silently drop the selection.
            const files = event.target.files ? Array.from(event.target.files) : [];
            event.target.value = '';
            if (files.length > 0) importFiles(files);
          }

          function hasFiles(event) {
            return Boolean(event.dataTransfer && Array.from(event.dataTransfer.types || []).includes('Files'));
          }

          function onDragEnter(event) {
            if (!hasFiles(event)) return;
            event.preventDefault();
            dragDepth.current += 1;
            setDragActive(true);
          }

          function onDragOver(event) {
            if (!hasFiles(event)) return;
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
          }

          function onDragLeave() {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragActive(false);
          }

          function onDrop(event) {
            if (!hasFiles(event)) return;
            event.preventDefault();
            dragDepth.current = 0;
            setDragActive(false);
            if (event.dataTransfer && event.dataTransfer.files) importFiles(event.dataTransfer.files);
          }

          function fallbackCopy(text) {
            try {
              const area = document.createElement('textarea');
              area.value = text;
              area.setAttribute('readonly', '');
              area.style.position = 'fixed';
              area.style.left = '-9999px';
              area.style.top = '0';
              document.body.appendChild(area);
              area.select();
              area.setSelectionRange(0, area.value.length);
              const copied = document.execCommand('copy');
              area.remove();
              return copied;
            } catch {
              return false;
            }
          }

          async function copyId(id) {
            try {
              await navigator.clipboard.writeText(id);
              showToast('ok', t('toast.copied'));
            } catch {
              if (fallbackCopy(id)) showToast('ok', t('toast.copied'));
              else showToast('error', t('error.action'));
            }
          }

          function statusOf(session) {
            if (session.running) return 'live';
            if (session.live) return 'open';
            if (session.archived) return 'archived';
            if (session.origin === 'subagent') return 'subagent';
            return 'idle';
          }

          function sessionBadges(session) {
            const badges = [];
            if (session.running) badges.push(h('span', { key: 'live', className: 'nsm__badge nsm__badge--live' }, t('status.live')));
            else if (session.live) badges.push(h('span', { key: 'open', className: 'nsm__badge nsm__badge--open' }, t('status.open')));
            if (session.archived) badges.push(h('span', { key: 'archived', className: 'nsm__badge nsm__badge--archived' }, t('status.archived')));
            if (session.origin === 'subagent') badges.push(h('span', { key: 'subagent', className: 'nsm__badge nsm__badge--subagent' }, t('status.subagent')));
            if (session.formatStatus === 'migration-required') badges.push(h('span', { key: 'migration', className: 'nsm__badge nsm__badge--migration' }, t('status.migration')));
            if (session.pinned) badges.push(h('span', { key: 'pinned', className: 'nsm__badge nsm__badge--pinned' }, h(Glyph, { name: 'pin', size: 9 }), t('status.pinned')));
            return badges;
          }

          function renderRow(session) {
            const selected = selectedSet.has(session.id);
            const canDelete = session.exists === true;
            const title = session.title || t('untitled');
            return h('div', {
              key: session.id,
              className: `nsm__row${selected ? ' is-selected' : ''}${focusedId === session.id ? ' is-focused' : ''}${session.live ? ' is-live' : ''}`,
              role: 'treeitem',
              tabIndex: 0,
              'aria-selected': selected ? 'true' : 'false',
              'aria-label': title,
              onClick: () => setFocusedId(session.id),
              onDoubleClick: () => openSession(session),
              onKeyDown: (event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === ' ') {
                  event.preventDefault();
                  toggleOne(session.id);
                } else if (event.key === 'Enter') {
                  event.preventDefault();
                  openSession(session);
                } else if (event.key === 'Delete' && canDelete) {
                  event.preventDefault();
                  requestDelete([session.id]);
                }
              },
            },
              h(Check, {
                checked: selected,
                label: title,
                onChange: () => toggleOne(session.id),
              }),
              h('span', {
                className: `nsm__dot is-${statusOf(session)}`,
                title: session.running ? t('status.live') : session.live ? t('status.open') : session.archived ? t('status.archived') : session.origin === 'subagent' ? t('status.subagent') : '',
              }),
              h('div', { className: 'nsm__row-main' },
                h('div', { className: 'nsm__row-title-line' },
                  h('span', { className: 'nsm__row-title', title }, title),
                  h('span', { className: 'nsm__badges' }, sessionBadges(session)),
                ),
                h('div', { className: 'nsm__row-meta' },
                  h('span', { className: 'nsm__row-path', title: session.cwd || '' }, shortPath(session.cwd)),
                  h('span', { className: 'nsm__meta-sep' }, '·'),
                  h('span', null, relativeTime(session.updatedAt)),
                  h('span', { className: 'nsm__meta-sep' }, '·'),
                  h('span', { className: 'nsm__meta-size' }, formatBytes(session.sizeBytes)),
                ),
              ),
              h('div', { className: 'nsm__row-actions' },
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button',
                  title: t('action.open'),
                  'aria-label': t('action.open'),
                  onClick: (event) => { event.stopPropagation(); openSession(session); },
                }, h(Glyph, { name: 'open', size: 13 })),
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button',
                  title: t('action.export'),
                  'aria-label': t('action.export'),
                  onClick: (event) => { event.stopPropagation(); exportSessions([session.id]); },
                }, h(Glyph, { name: 'export', size: 13 })),
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button nsm__icon-button--danger',
                  title: canDelete ? t('action.delete') : t('error.action'),
                  'aria-label': t('action.delete'),
                  disabled: !canDelete,
                  onClick: (event) => { event.stopPropagation(); requestDelete([session.id]); },
                }, h(Glyph, { name: 'trash', size: 13 })),
              ),
            );
          }

          function renderMonth(group, month) {
            const key = `${group.key}::${month.key}`;
            const isCollapsed = normalizedQuery === '' && stateFilter === 'all' && collapsed.has(key);
            const ids = month.sessions.map((session) => session.id);
            const all = ids.length > 0 && ids.every((id) => selectedSet.has(id));
            const some = !all && ids.some((id) => selectedSet.has(id));
            return h('div', { key: month.key, className: 'nsm__month' },
              h('div', {
                className: 'nsm__month-head',
                role: 'button',
                tabIndex: 0,
                'aria-expanded': isCollapsed ? 'false' : 'true',
                onClick: () => toggleCollapsed(key),
                onKeyDown: (event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleCollapsed(key);
                  }
                },
              },
                h('span', { className: `nsm__chevron${isCollapsed ? '' : ' is-open'}` }, h(Glyph, { name: 'chevron', size: 12 })),
                h('span', { className: 'nsm__month-title' }, monthLabel(month.key)),
                h('span', { className: 'nsm__month-count' }, tr('tree.monthCount', { n: ids.length })),
                h('span', { className: 'nsm__count' }, formatBytes(month.bytes)),
                h(Check, { checked: all, mixed: some, label: monthLabel(month.key), onChange: (next) => toggleSelected(ids, next) }),
              ),
              isCollapsed ? null : h('div', { className: 'nsm__rows', role: 'group' }, month.sessions.map(renderRow)),
            );
          }

          function renderGroup(group) {
            const ids = group.sessions.map((session) => session.id);
            const isCollapsed = normalizedQuery === '' && stateFilter === 'all' && collapsed.has(group.key);
            const all = ids.length > 0 && ids.every((id) => selectedSet.has(id));
            const some = !all && ids.some((id) => selectedSet.has(id));
            const title = groupTitle(group);
            return h('section', { key: group.key, className: 'nsm__group', role: 'group', 'aria-label': title },
              h('div', {
                className: 'nsm__group-head',
                role: 'button',
                tabIndex: 0,
                'aria-expanded': isCollapsed ? 'false' : 'true',
                onClick: () => toggleCollapsed(group.key),
                onKeyDown: (event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleCollapsed(group.key);
                  }
                },
              },
                h('span', { className: `nsm__chevron${isCollapsed ? '' : ' is-open'}` }, h(Glyph, { name: 'chevron', size: 13 })),
                h('span', { className: 'nsm__folder' }, h(Glyph, { name: 'folder', size: 15 })),
                h('div', { className: 'nsm__group-copy' },
                  h('div', { className: 'nsm__group-title' }, title),
                  group.path ? h('div', { className: 'nsm__group-path', title: group.path }, shortPath(group.path)) : null,
                ),
                h('span', { className: 'nsm__count' }, sessionCount(ids.length)),
                h(Check, { checked: all, mixed: some, label: title, onChange: (next) => toggleSelected(ids, next) }),
              ),
              isCollapsed ? null : h('div', { className: 'nsm__months' }, group.months.map((month) => renderMonth(group, month))),
            );
          }

          function trashBadges(entry) {
            const badges = [];
            badges.push(h('span', { key: 'deleted', className: 'nsm__badge nsm__badge--deleted' }, entry.pending ? t('trash.pending') : t('status.deleted')));
            if (entry.wasRunning) badges.push(h('span', { key: 'running', className: 'nsm__badge nsm__badge--live' }, t('trash.wasRunning')));
            if (entry.wasArchived) badges.push(h('span', { key: 'archived', className: 'nsm__badge nsm__badge--archived' }, t('trash.wasArchived')));
            return badges;
          }

          function renderTrashRow(entry) {
            const selected = trashSelectedSet.has(entry.trashId);
            const title = entry.title || t('untitled');
            return h('div', {
              key: entry.trashId,
              className: `nsm__row nsm__row--trash${selected ? ' is-selected' : ''}${focusedTrashId === entry.trashId ? ' is-focused' : ''}${entry.pending ? ' is-pending' : ''}`,
              role: 'treeitem',
              tabIndex: 0,
              'aria-selected': selected ? 'true' : 'false',
              'aria-label': title,
              onClick: () => setFocusedTrashId(entry.trashId),
              onKeyDown: (event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === ' ') {
                  event.preventDefault();
                  toggleTrashOne(entry.trashId);
                }
              },
            },
              h(Check, { checked: selected, label: title, onChange: () => toggleTrashOne(entry.trashId) }),
              h('span', { className: `nsm__dot ${entry.pending ? 'is-pending' : 'is-deleted'}`, title: entry.pending ? t('trash.pending') : t('status.deleted') }),
              h('div', { className: 'nsm__row-main' },
                h('div', { className: 'nsm__row-title-line' },
                  h('span', { className: 'nsm__row-title', title }, title),
                  h('span', { className: 'nsm__badges' }, trashBadges(entry)),
                ),
                h('div', { className: 'nsm__row-meta' },
                  h('span', { className: 'nsm__row-path', title: entry.cwd || '' }, shortPath(entry.cwd)),
                  h('span', { className: 'nsm__meta-sep' }, '·'),
                  h('span', null, `${t('trash.deletedAt')} ${relativeTime(entry.deletedAt)}`),
                  h('span', { className: 'nsm__meta-sep' }, '·'),
                  h('span', { className: 'nsm__meta-size' }, formatBytes(entry.sizeBytes)),
                ),
              ),
              h('div', { className: 'nsm__row-actions' },
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button',
                  title: t('trash.restore'),
                  'aria-label': t('trash.restore'),
                  disabled: busy,
                  onClick: (event) => { event.stopPropagation(); restoreEntries([entry.trashId]); },
                }, h(Glyph, { name: 'restore', size: 13 })),
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button nsm__icon-button--danger',
                  title: entry.pending ? t('trash.pendingHint') : t('trash.purge'),
                  'aria-label': t('trash.purge'),
                  disabled: busy || entry.pending,
                  onClick: (event) => { event.stopPropagation(); requestPurge([entry.trashId]); },
                }, h(Glyph, { name: 'trash', size: 13 })),
              ),
            );
          }

          function renderTrashGroup(group) {
            const key = `trash:${group.key}`;
            const isCollapsed = normalizedQuery === '' && collapsed.has(key);
            const ids = group.entries.map((entry) => entry.trashId);
            const all = ids.length > 0 && ids.every((id) => trashSelectedSet.has(id));
            const some = !all && ids.some((id) => trashSelectedSet.has(id));
            const label = tr('trash.deletedGroup', { label: monthLabel(group.key) });
            return h('section', { key, className: 'nsm__group nsm__group--trash', role: 'group', 'aria-label': label },
              h('div', {
                className: 'nsm__group-head',
                role: 'button',
                tabIndex: 0,
                'aria-expanded': isCollapsed ? 'false' : 'true',
                onClick: () => toggleCollapsed(key),
                onKeyDown: (event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleCollapsed(key);
                  }
                },
              },
                h('span', { className: `nsm__chevron${isCollapsed ? '' : ' is-open'}` }, h(Glyph, { name: 'chevron', size: 13 })),
                h('span', { className: 'nsm__folder nsm__folder--trash' }, h(Glyph, { name: 'trash', size: 15 })),
                h('div', { className: 'nsm__group-copy' },
                  h('div', { className: 'nsm__group-title' }, label),
                ),
                h('span', { className: 'nsm__count' }, sessionCount(ids.length)),
                h('Check', { checked: all, mixed: some, label, onChange: (next) => toggleTrashSelected(ids, next) }),
              ),
              isCollapsed ? null : h('div', { className: 'nsm__rows', role: 'group' }, group.entries.map(renderTrashRow)),
            );
          }

          function fact(label, value, options = {}) {
            return h('div', { className: 'nsm__fact', key: label },
              h('dt', null, label),
              h('dd', null, options.button ? h('button', { type: 'button', onClick: options.onClick, title: options.title }, value) : value),
            );
          }

          function renderTrashDetail() {
            if (!focusedTrash) {
              return h('section', { className: 'nsm__card nsm__detail-card nsm__detail-empty' },
                h('div', { className: 'nsm__card-head' }, h('h2', null, t('trash.detail'))),
                h('p', null, t('trash.emptyBody')),
              );
            }
            const entry = focusedTrash;
            return h('section', { className: 'nsm__card nsm__detail-card' },
              h('div', { className: 'nsm__card-head' },
                h('h2', { className: 'nsm__detail-title' }, entry.title || t('untitled')),
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button',
                  title: t('action.close'),
                  'aria-label': t('action.close'),
                  onClick: () => setFocusedTrashId(null),
                }, h(Glyph, { name: 'close', size: 13 })),
              ),
              h('div', { className: 'nsm__detail-badges' }, trashBadges(entry)),
              h('dl', { className: 'nsm__facts' },
                fact(t('trash.deletedAt'), formatDateTime(entry.deletedAt)),
                fact(t('trash.originalPath'), shortPath(entry.cwd), { title: entry.cwd || '', button: true, onClick: () => entry.cwd && copyId(entry.cwd) }),
                fact(t('detail.created'), formatDateTime(entry.createdAt)),
                fact(t('detail.size'), formatBytes(entry.sizeBytes)),
                fact(t('detail.id'), h('code', null, entry.id), { title: t('action.copyId'), button: true, onClick: () => copyId(entry.id) }),
              ),
              entry.pending ? h('p', { className: 'nsm__hint', style: { marginTop: 10 } }, t('trash.pendingHint')) : null,
              h('div', { className: 'nsm__detail-actions' },
                h('button', {
                  type: 'button',
                  className: 'nsm__button nsm__button--small nsm__button--primary',
                  disabled: busy,
                  onClick: () => restoreEntries([entry.trashId]),
                }, h(Glyph, { name: 'restore', size: 12 }), t('trash.restore')),
                h('button', {
                  type: 'button',
                  className: 'nsm__button nsm__button--small nsm__button--danger',
                  disabled: busy || entry.pending,
                  title: entry.pending ? t('trash.pendingHint') : t('trash.purge'),
                  onClick: () => requestPurge([entry.trashId]),
                }, h(Glyph, { name: 'trash', size: 12 }), t('trash.purge')),
              ),
            );
          }

          function renderDetail() {
            if (view === 'trash') return renderTrashDetail();
            if (!focusedSession) {
              return h('section', { className: 'nsm__card nsm__detail-card nsm__detail-empty' },
                h('div', { className: 'nsm__card-head' }, h('h2', null, t('detail.title'))),
                h('p', null, t('detail.empty')),
              );
            }
            const session = focusedSession;
            const canDelete = session.exists === true;
            return h('section', { className: 'nsm__card nsm__detail-card' },
              h('div', { className: 'nsm__card-head' },
                h('h2', { className: 'nsm__detail-title' }, session.title || t('untitled')),
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button',
                  title: t('action.close'),
                  'aria-label': t('action.close'),
                  onClick: () => setFocusedId(null),
                }, h(Glyph, { name: 'close', size: 13 })),
              ),
              h('div', { className: 'nsm__detail-badges' }, sessionBadges(session)),
              h('dl', { className: 'nsm__facts' },
                fact(t('detail.workspace'), session.workspace ? session.workspace.title : session.group && session.group.kind !== 'none' ? session.group.title : t('tree.ungrouped')),
                fact(t('detail.path'), shortPath(session.cwd), { title: session.cwd || '', button: true, onClick: () => session.cwd && copyId(session.cwd) }),
                fact(t('detail.created'), formatDateTime(session.createdAt)),
                fact(t('detail.updated'), formatDateTime(session.updatedAt)),
                fact(t('detail.size'), formatBytes(session.sizeBytes)),
                fact(t('detail.turns'), String(session.turns || 0)),
                session.agentPreset ? fact(t('detail.preset'), session.agentPreset) : null,
                fact(t('detail.id'), h('code', null, session.id), { title: t('action.copyId'), button: true, onClick: () => copyId(session.id) }),
              ),
              h('div', { className: 'nsm__detail-actions' },
                h('button', { type: 'button', className: 'nsm__button nsm__button--small nsm__button--primary', onClick: () => openSession(session) }, h(Glyph, { name: 'open', size: 12 }), t('action.open')),
                h('button', { type: 'button', className: 'nsm__button nsm__button--small', onClick: () => exportSessions([session.id]) }, h(Glyph, { name: 'export', size: 12 }), t('action.export')),
                h('button', {
                  type: 'button',
                  className: 'nsm__button nsm__button--small nsm__button--danger',
                  disabled: !canDelete || busy,
                  title: canDelete ? t('action.delete') : t('error.action'),
                  onClick: () => requestDelete([session.id]),
                }, h(Glyph, { name: 'trash', size: 12 }), t('action.delete')),
              ),
            );
          }

          const content = [];
          content.push(h('style', { key: 'styles' }, STYLES));
          content.push(h('header', { key: 'header', className: 'nsm__header' },
            h('div', { className: 'nsm__heading' },
              h('span', { className: 'nsm__mark' }, h(PageMark, { size: 58 })),
              h('div', { className: 'nsm__titles' },
                h('h1', { className: 'nsm__title' }, t('page.title')),
                h('p', { className: 'nsm__subtitle' }, t('page.subtitle')),
              ),
            ),
            h('div', { className: 'nsm__actions' },
              h('button', {
                type: 'button',
                className: 'nsm__button nsm__button--primary',
                disabled: importing,
                onClick: () => fileInputRef.current && fileInputRef.current.click(),
              }, h(Glyph, { name: 'import', size: 13 }), importing ? t('action.importing') : t('action.import')),
              h('button', {
                type: 'button',
                className: 'nsm__button',
                disabled: sessions.length === 0,
                onClick: () => exportSessions([]),
              }, h(Glyph, { name: 'export', size: 13 }), t('action.exportAll')),
              h('button', { type: 'button', className: 'nsm__button nsm__button--ghost', onClick: goBack }, t('action.back')),
            ),
          ));

          if (importReport) {
            const parts = [tr('import.imported', { n: importReport.imported })];
            if (importReport.skipped > 0) parts.push(tr('import.skipped', { n: importReport.skipped }));
            if (importReport.failed > 0) parts.push(tr('import.failed', { n: importReport.failed }));
            content.push(h('div', { key: 'report', className: 'nsm__report', role: 'status' },
              h('div', { className: 'nsm__report-head' },
                h(Glyph, { name: 'alert', size: 13 }),
                h('span', null, `${t('import.report')} · ${parts.join(' · ')}`),
                h('button', {
                  type: 'button',
                  className: 'nsm__icon-button',
                  title: t('action.dismiss'),
                  'aria-label': t('action.dismiss'),
                  onClick: () => setImportReport(null),
                }, h(Glyph, { name: 'close', size: 12 })),
              ),
              importReport.details.length > 0
                ? h('ul', null, importReport.details.slice(0, 5).map((detail, index) => h('li', { key: index }, detail)))
                : null,
            ));
          }

          // ── Module workspace: sidebar (navigation) + main (content) ──
          const mainContent = [];

          if (activeModule === 'session') {
            const pane = [];

            if (data) {
              pane.push(h('section', { key: 'stats', className: 'nsm__stats' },
                h('div', { className: 'nsm__stat' }, h('span', { className: 'nsm__stat-label' }, t('stats.total')), h('span', { className: 'nsm__stat-value' }, String(stats.total))),
                h('div', { className: 'nsm__stat' }, h('span', { className: 'nsm__stat-label' }, t('stats.live')), h('span', { className: 'nsm__stat-value' }, String(stats.live))),
                h('div', { className: 'nsm__stat' }, h('span', { className: 'nsm__stat-label' }, t('stats.groups')), h('span', { className: 'nsm__stat-value' }, String(stats.groups))),
                h('div', { className: 'nsm__stat' }, h('span', { className: 'nsm__stat-label' }, t('stats.size')), h('span', { className: 'nsm__stat-value' }, formatBytes(stats.bytes))),
              ));
            }

            pane.push(h('div', { key: 'toolbar', className: 'nsm__toolbar' },
              h('div', { className: 'nsm__viewtabs', role: 'tablist' },
                h('button', {
                  type: 'button',
                  role: 'tab',
                  'aria-selected': view === 'sessions' ? 'true' : 'false',
                  className: `nsm__viewtab${view === 'sessions' ? ' is-active' : ''}`,
                  onClick: () => setView('sessions'),
                }, t('view.sessions')),
                h('button', {
                  type: 'button',
                  role: 'tab',
                  'aria-selected': view === 'trash' ? 'true' : 'false',
                  className: `nsm__viewtab${view === 'trash' ? ' is-active' : ''}`,
                  onClick: () => setView('trash'),
                }, t('view.trash'), h('span', { className: 'nsm__tab-count' }, String(trash.length))),
              ),
              h('div', { className: 'nsm__search' },
                h('span', { className: 'nsm__search-icon' }, h(Glyph, { name: 'search', size: 14 })),
                h('input', {
                  type: 'search',
                  value: query,
                  placeholder: view === 'trash' ? t('search.trashPlaceholder') : t('search.placeholder'),
                  'aria-label': view === 'trash' ? t('search.trashPlaceholder') : t('search.placeholder'),
                  onChange: (event) => setQuery(event.target.value),
                }),
                query !== '' ? h('button', {
                  type: 'button',
                  className: 'nsm__search-clear',
                  title: t('search.clear'),
                  'aria-label': t('search.clear'),
                  onClick: () => setQuery(''),
                }, h(Glyph, { name: 'close', size: 12 })) : null,
              ),
              h(Check, {
                checked: activeAllSelected,
                mixed: activeSomeSelected,
                label: t('action.selectAll'),
                onChange: (next) => view === 'trash' ? toggleTrashSelected(visibleTrashIds, next) : toggleSelected(visibleIds, next),
              }),
              h('button', {
                type: 'button',
                className: 'nsm__button nsm__button--small nsm__button--ghost',
                disabled: activeVisibleIds.length === 0 && activeSelectionCount === 0,
                onClick: activeSelectionCount > 0
                  ? () => { if (view === 'trash') setSelectedTrashIds([]); else setSelectedIds([]); }
                  : () => { if (view === 'trash') toggleTrashSelected(visibleTrashIds, true); else toggleSelected(visibleIds, true); },
              }, activeSelectionCount > 0 ? t('action.clearSelection') : t('action.selectAll')),
              h('span', { className: 'nsm__toolbar-spacer' }),
              h('button', { type: 'button', className: 'nsm__button nsm__button--small nsm__button--ghost', onClick: expandAll }, t('action.expandAll')),
              h('button', { type: 'button', className: 'nsm__button nsm__button--small nsm__button--ghost', onClick: collapseAll }, t('action.collapseAll')),
              h('button', {
                type: 'button',
                className: 'nsm__button nsm__button--small',
                disabled: status === 'refreshing' || status === 'loading',
                onClick: async () => {
                  await load({ silent: true });
                  await refreshNative();
                  showToast('ok', t('toast.refreshed'));
                },
              }, h(Glyph, { name: 'refresh', size: 12 }), t('action.refresh')),
            ));

            if (data && view === 'sessions') {
              pane.push(h('div', { key: 'filters', className: 'nsm__filters', role: 'group', 'aria-label': t('filter.label') },
                FILTERS.map((id) => h('button', {
                  key: id,
                  type: 'button',
                  className: `nsm__filter${stateFilter === id ? ' is-active' : ''}`,
                  'aria-pressed': stateFilter === id ? 'true' : 'false',
                  onClick: () => setStateFilter(id),
                }, t(`filter.${id}`), h('span', { className: 'nsm__filter-count' }, String(filterCounts[id] || 0)))),
              ));
            }

            if (status === 'loading' && !data) {
              pane.push(h('div', { key: 'loading', className: 'nsm__loading' }, h('span', { className: 'nsm__spinner' }), h('span', null, t('loading'))));
            } else if (status === 'error' && !data) {
              pane.push(h('div', { key: 'error', className: 'nsm__error' },
                h('p', null, error || t('error.load')),
                h('button', { type: 'button', className: 'nsm__button', onClick: () => load({}) }, t('action.retry')),
              ));
            } else if (data) {
              pane.push(h('div', { key: 'layout', className: 'nsm__layout' },
                h('section', { key: 'tree', className: 'nsm__tree-card' },
                  h('div', { className: 'nsm__tree-head' },
                    h('h2', null, view === 'trash' ? t('trash.title') : t('tree.title')),
                    h('span', { className: 'nsm__tree-head-meta' }, view === 'trash'
                      ? trashCount(visibleTrash.length)
                      : sessionCount(visibleSessions.length)),
                  ),
                  h('div', { className: 'nsm__tree-body', role: 'tree', 'aria-label': view === 'trash' ? t('trash.title') : t('page.title') },
                    view === 'trash'
                      ? (visibleTrash.length === 0
                          ? h('div', { className: 'nsm__empty' },
                              h('span', { className: 'nsm__empty-mark nsm__empty-mark--trash' }, h(Glyph, { name: 'trash', size: 52 })),
                              h('h2', null, normalizedQuery === '' ? t('trash.empty') : t('tree.emptyFiltered')),
                              h('p', null, normalizedQuery === '' ? t('trash.emptyBody') : t('tree.emptyFilteredBody')),
                              normalizedQuery === ''
                                ? h('button', { type: 'button', className: 'nsm__button', onClick: () => setView('sessions') }, t('view.sessions'))
                                : h('button', { type: 'button', className: 'nsm__button', onClick: () => setQuery('') }, t('search.clear')),
                            )
                          : trashGroups.map(renderTrashGroup))
                      : (visibleSessions.length === 0
                          ? h('div', { className: 'nsm__empty' },
                              h('span', { className: 'nsm__empty-mark' }, h(PageMark, { size: 64 })),
                              h('h2', null, normalizedQuery === '' && stateFilter === 'all' ? t('empty.title') : t('tree.emptyFiltered')),
                              h('p', null, normalizedQuery === '' && stateFilter === 'all' ? t('empty.body') : t('tree.emptyFilteredBody')),
                              normalizedQuery === '' && stateFilter === 'all'
                                ? h('button', { type: 'button', className: 'nsm__button nsm__button--primary', onClick: () => fileInputRef.current && fileInputRef.current.click() }, t('empty.cta'))
                                : h('button', { type: 'button', className: 'nsm__button', onClick: () => { setQuery(''); setStateFilter('all'); } }, t('search.clear')),
                            )
                          : groups.map(renderGroup)),
                  ),
                ),
                h('aside', { key: 'aside', className: 'nsm__aside' },
                  h('section', { className: 'nsm__card' },
                    h('div', { className: 'nsm__card-head' }, h('h2', null, view === 'trash'
                      ? (selectedTrashEntries.length > 0 ? tr('selection.count', { n: selectedTrashEntries.length }) : t('selection.none'))
                      : (selectedSessions.length > 0 ? tr('selection.count', { n: selectedSessions.length }) : t('selection.none')))),
                    (view === 'trash' ? selectedTrashEntries.length > 0 : selectedSessions.length > 0)
                      ? h('p', { className: 'nsm__selection-size' }, tr('selection.size', { size: formatBytes(view === 'trash' ? selectedTrashBytes : selectedBytes) }))
                      : null,
                    h('div', { className: 'nsm__selection-actions' },
                      view === 'trash' ? [
                        h('button', {
                          key: 'restore',
                          type: 'button',
                          className: 'nsm__button nsm__button--primary',
                          disabled: selectedTrashEntries.length === 0 || busy,
                          onClick: () => restoreEntries(selectedTrashEntries.map((entry) => entry.trashId)),
                        }, h(Glyph, { name: 'restore', size: 13 }), t('trash.restoreSelected')),
                        h('button', {
                          key: 'purge',
                          type: 'button',
                          className: 'nsm__button nsm__button--danger',
                          disabled: selectedTrashEntries.length === 0 || busy,
                          onClick: () => requestPurge(selectedTrashEntries.map((entry) => entry.trashId)),
                        }, h(Glyph, { name: 'trash', size: 13 }), t('trash.purgeSelected')),
                      ] : [
                        h('button', {
                          key: 'export',
                          type: 'button',
                          className: 'nsm__button',
                          disabled: selectedSessions.length === 0,
                          onClick: () => exportSessions(selectedSessions.map((session) => session.id)),
                        }, h(Glyph, { name: 'export', size: 13 }), t('action.exportSelected')),
                        h('button', {
                          key: 'delete',
                          type: 'button',
                          className: 'nsm__button nsm__button--danger',
                          disabled: !canDeleteSelected || busy,
                          onClick: () => requestDelete(selectedSessions.map((session) => session.id)),
                        }, h(Glyph, { name: 'trash', size: 13 }), t('action.deleteSelected')),
                      ],
                    ),
                    h('p', { className: 'nsm__hint' }, view === 'trash' ? t('selection.trashHint') : t('selection.hint')),
                  ),
                  renderDetail(),
                  h('section', { className: 'nsm__card nsm__import-card' },
                    h('div', { className: 'nsm__card-head' }, h('h2', null, t('import.title'))),
                    h('p', { className: 'nsm__hint', style: { marginTop: 0 } }, t('import.hint')),
                    h('button', {
                      type: 'button',
                      className: 'nsm__button',
                      disabled: importing,
                      onClick: () => fileInputRef.current && fileInputRef.current.click(),
                    }, h(Glyph, { name: 'import', size: 13 }), importing ? t('action.importing') : t('action.import')),
                  ),
                ),
              ));

              if (data.sessionRoot) {
                pane.push(h('footer', { key: 'footer', className: 'nsm__footer' },
                  h('div', { className: 'nsm__footer-line' },
                    h('span', null, `${t('footer.storage')} `, h('code', null, data.sessionRoot)),
                  ),
                  h('div', { className: 'nsm__footer-line' },
                    h('span', null, t('footer.package'), h('code', null, PACKAGE_NAME)),
                    h('button', {
                      type: 'button',
                      className: 'nsm__footer-copy',
                      title: t('action.copyPackage'),
                      'aria-label': t('action.copyPackage'),
                      onClick: () => copyId(PACKAGE_NAME),
                    }, h(Glyph, { name: 'copy', size: 11 })),
                  ),
                  h('div', { className: 'nsm__footer-line' }, h('span', null, t('footer.note'))),
                ));
              }
            }

            mainContent.push(h('div', { key: 'pane-session', className: 'nsm__pane nsm__pane--session' }, ...pane));
          } else {
            const pane = [];

            // ── Toolbar ──
            pane.push(h('div', { key: 'rule-toolbar', className: 'nsm__rules-toolbar' },
              h('div', { className: 'nsm__rules-toolbar-head' },
                h('span', { className: 'nsm__rules-title' }, t('rule.title')),
                h('span', { className: 'nsm__rules-meta' }, tr('rule.titleMeta', { total: ruleStats.total, enabled: ruleStats.enabled })),
              ),
              h('button', {
                type: 'button', className: 'nsm__button',
                disabled: rulesStatus === 'loading',
                onClick: () => setRuleForm({ id: null, title: '', content: '' }),
              }, h(Glyph, { name: 'plus', size: 12 }), t('rule.new')),
            ));

            // ── Rules list ──
            if (rulesStatus === 'loading') {
              pane.push(h('div', { key: 'rule-loading', className: 'nsm__loading' },
                h('span', { className: 'nsm__spinner' }), h('span', null, t('loading'))));
            } else if (rulesStatus === 'error') {
              pane.push(h('div', { key: 'rule-error', className: 'nsm__error' },
                h('p', null, t('rule.loadError')),
                h('button', { type: 'button', className: 'nsm__button', onClick: loadRules }, t('action.retry'))));
            } else if (computedRules.length === 0) {
              pane.push(h('div', { key: 'rule-empty', className: 'nsm__empty' },
                h('span', { className: 'nsm__empty-mark' }, h(Glyph, { name: 'branch', size: 52 })),
                h('h2', null, t('rule.empty')),
                h('p', null, t('rule.emptyBody')),
                h('button', { type: 'button', className: 'nsm__button nsm__button--primary', onClick: () => setRuleForm({ id: null, title: '', content: '' }) }, t('rule.emptyCta'))));
            } else {
              pane.push(h('div', { key: 'rule-list', className: 'nsm__rules-list' },
                computedRules.map((rule) => {
                  const isCollapsed = collapsedRules[rule.id] !== false; // default collapsed
                  return h('div', {
                    key: rule.id,
                    className: `nsm__rule-card${rule.enabled ? '' : ' is-disabled'}`,
                  },
                    // ── Head: title + updatedAt ──
                    h('div', { className: 'nsm__rule-card-head' },
                      h('div', {
                        className: `nsm__rule-card-title${rule.enabled ? '' : ' is-disabled'}`,
                        title: rule.title || '(untitled)',
                      }, rule.title || '(untitled)'),
                      h('span', { className: 'nsm__rule-card-meta' },
                        relativeTime(rule.updatedAt),
                      ),
                    ),
                    // ── Body: content (collapsible) ──
                    h('div', { className: 'nsm__rule-card-body' },
                      h('div', {
                        className: `nsm__rule-card-content${isCollapsed ? ' is-collapsed' : ''}`,
                      }, rule.content),
                      rule.content && rule.content.length > 40
                        ? h('button', {
                            type: 'button',
                            className: 'nsm__rule-card-toggle',
                            onClick: () => toggleRuleCollapsed(rule.id),
                          }, isCollapsed ? t('rule.showMore') : t('rule.showLess'))
                        : null,
                    ),
                    // ── Foot: scope segmented tabs + scope indicator + toggle + edit + delete ──
                    h('div', { className: 'nsm__rule-card-foot' },
                      // Scope segmented tabs
                      h('div', { className: 'nsm__scope-tabs', role: 'tablist' },
                        ['global', 'workspace', 'session'].map((scope) =>
                          h('button', {
                            key: scope,
                            type: 'button',
                            role: 'tab',
                            className: `nsm__scope-tab${rule.scope === scope ? ' is-active' : ''}`,
                            title: t(`rule.scope.${scope}Hint`),
                            onClick: () => handleScopeChange(rule.id, scope),
                          }, t(`rule.scope.${scope}`)),
                        ),
                      ),
                      // Scope-specific indicator
                      rule.scope === 'global'
                        ? h('span', { className: 'nsm__scope-global-hint' }, t('rule.scope.globalHint'))
                        : h('button', {
                            type: 'button',
                            className: 'nsm__scope-picker-btn',
                            'data-scope': rule.scope,
                            onClick: () => openPicker(rule.id, rule.scope, rule.targets || []),
                          },
                            t(`rule.scope.${rule.scope}Pick`),
                            h('span', { className: 'nsm__scope-count' }, (rule.targets || []).length || '0'),
                          ),
                      h('div', { className: 'nsm__rule-card-foot-spacer' }),
                      h('label', { className: 'nsm__toggle', title: rule.enabled ? t('rule.toggleOff') : t('rule.toggleOn') },
                        h('input', { type: 'checkbox', checked: rule.enabled, onChange: (e) => handleToggleRule(rule.id, e.target.checked) }),
                        h('span', { className: 'nsm__toggle-track' }),
                      ),
                      h('button', {
                        type: 'button', className: 'nsm__icon-btn',
                        title: t('rule.edit'), 'aria-label': t('rule.edit'),
                        onClick: () => setRuleForm({ id: rule.id, title: rule.title, content: rule.content }),
                      }, h(Glyph, { name: 'edit', size: 13 })),
                      h('button', {
                        type: 'button', className: 'nsm__icon-btn is-danger',
                        title: t('rule.delete'), 'aria-label': t('rule.delete'),
                        onClick: () => setDeleteRuleId(rule.id),
                      }, h(Glyph, { name: 'trash', size: 13 })),
                    ),
                  );
                }),
              ));
            }

            // ── Rule form modal ──
            if (ruleForm) {
              pane.push(h(RuleFormModal, {
                key: 'rule-form-modal',
                form: ruleForm,
                onClose: () => setRuleForm(null),
                onChange: (patch) => setRuleForm((prev) => ({ ...prev, ...patch })),
                onSave: (form) => handleSaveRule(form),
                onDelete: ruleForm.id ? () => { setDeleteRuleId(ruleForm.id); setRuleForm(null); } : null,
                t,
              }));
            }

            // ── Delete confirm modal ──
            if (deleteRuleId) {
              const target = rulesData[deleteRuleId];
              pane.push(h(ConfirmModal, {
                key: 'rule-delete-confirm',
                title: t('rule.deleteConfirmTitle'),
                body: tr('rule.deleteConfirmBody', { title: target?.title || deleteRuleId }),
                danger: true,
                confirmLabel: t('rule.delete'),
                onConfirm: () => handleDeleteRule(deleteRuleId),
                onCancel: () => setDeleteRuleId(null),
                t,
              }));
            }

            // ── Scope picker modal (tree selection — unified) ──
            if (picker) {
              const sessions = Array.isArray(sessionsData) ? sessionsData : [];
              const isSessionPicker = picker.scope === 'session';

              // Build workspace → [sessions] groups (workspace is an object: {id,title,path})
              const byWs = {};
              sessions.forEach((s) => {
                const raw = s?.workspace;
                const wsId = (raw && typeof raw === 'object' ? raw.id : raw) || '(unassigned)';
                const wsTitle = (raw && typeof raw === 'object' ? (raw.title || raw.path) : raw) || '(unassigned)';
                const wsPath = (raw && typeof raw === 'object' ? raw.path : '') || '';
                if (!byWs[wsId]) byWs[wsId] = { id: wsId, title: wsTitle, path: wsPath, sessions: [] };
                byWs[wsId].sessions.push(s);
              });
              const groups = Object.values(byWs).sort((a, b) => a.title.localeCompare(b.title));

              const q = (picker.search || '').toLowerCase().trim();
              const filterMatch = (str) => !q || String(str).toLowerCase().includes(q);

              const renderCheckbox = (checked) => h('input', {
                type: 'checkbox',
                checked: !!checked,
                onChange: () => {},
                readOnly: true,
                style: { flexShrink: 0, margin: 0 },
              });

              const tree = groups.map((ws) => {
                const wsName = ws.title;
                const wsKey = `ws:${ws.id}`;
                const isOpen = picker.expanded[wsKey] !== false;
                const anySessionMatch = ws.sessions.some((s) => filterMatch(s.title || s.id));

                // Determine target value based on scope (workspace scope targets workspace id)
                const wsTarget = ws.id;
                const wsChecked = isSessionPicker
                  ? ws.sessions.every((s) => picker.targets.includes(s.id))
                  : picker.targets.includes(wsTarget);

                // Group sessions by month
                const byMonth = {};
                ws.sessions.forEach((s) => {
                  const m = new Date(s?.updatedAt || s?.createdAt || Date.now()).toISOString().slice(0, 7);
                  if (!byMonth[m]) byMonth[m] = [];
                  byMonth[m].push(s);
                });
                const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

                // Filter-out workspace if no match
                const wsMatch = isSessionPicker
                  ? !q || anySessionMatch || filterMatch(wsName)
                  : !q || filterMatch(wsName);

                if (!wsMatch) return null;

                // Click handler for ws group head
                const onWsToggle = () => {
                  if (isSessionPicker) {
                    // Session picker → toggle all session ids under this ws
                    const allIds = ws.sessions.map((s) => s.id);
                    const allIn = allIds.every((id) => picker.targets.includes(id));
                    setPicker((prev) => {
                      if (!prev) return prev;
                      const rest = prev.targets.filter((t) => !allIds.includes(t));
                      return { ...prev, targets: allIn ? rest : [...rest, ...allIds] };
                    });
                  } else {
                    // Workspace picker → toggle workspace id
                    togglePickerTarget(wsTarget);
                  }
                };

                return h('div', { key: wsKey, className: 'nsm__picker-group' },
                  h('div', { className: 'nsm__picker-group-head', onClick: onWsToggle, style: { cursor: 'pointer' } },
                    h('span', {
                      className: `nsm__picker-group-arrow${isOpen ? ' is-open' : ''}`,
                      onClick: (e) => { e.stopPropagation(); togglePickerGroup(wsKey); },
                      style: { cursor: 'pointer' },
                    }, '▶'),
                    renderCheckbox(wsChecked),
                    h('span', { className: 'nsm__picker-group-label', title: ws.path || wsName }, wsName),
                    h('span', { className: 'nsm__picker-group-count' }, `${ws.sessions.length} 会话`),
                  ),
                  isOpen && isSessionPicker ? months.map((m) => {
                    const monthSessions = byMonth[m];
                    return h('div', { key: m },
                      h('div', { className: 'nsm__picker-month' }, m),
                      monthSessions.map((s) => {
                        if (!filterMatch(s.title || s.id)) return null;
                        const checked = picker.targets.includes(s.id);
                        return h('div', {
                          key: s.id, className: 'nsm__picker-item',
                          onClick: () => togglePickerTarget(s.id),
                        },
                          renderCheckbox(checked),
                          h('span', { className: 'nsm__picker-item-label', title: s.title || s.id }, s.title || s.id),
                          h('span', { className: 'nsm__picker-item-meta' }, relativeTime(s.updatedAt || s.createdAt)),
                        );
                      }).filter(Boolean),
                    );
                  }) : null,
                );
              }).filter(Boolean);

              pane.push(h('div', {
                key: 'rule-scope-picker',
                className: 'nsm__modal',
                onClick: closePicker,
              },
                h('div', { className: 'nsm__modal-card', onClick: (e) => e.stopPropagation(), style: { width: 'min(640px, 90vw)', maxHeight: 'min(72vh, 600px)' } },
                  h('div', { className: 'nsm__modal-head' },
                    h('h3', null, isSessionPicker ? t('rule.picker.sessionTitle') : t('rule.picker.workspaceTitle')),
                    h('button', { className: 'nsm__modal-close', onClick: closePicker }, '✕'),
                  ),
                  h('div', { className: 'nsm__picker' },
                    h('input', {
                      className: 'nsm__picker-search',
                      type: 'text',
                      placeholder: t('rule.picker.search'),
                      value: picker.search,
                      onChange: (e) => setPicker((p) => p ? { ...p, search: e.target.value } : p),
                      autoFocus: true,
                    }),
                    h('div', { className: 'nsm__picker-tree' },
                      tree.length
                        ? tree
                        : h('div', { style: { padding: '24px', textAlign: 'center', color: 'var(--nsm-tertiary)', fontSize: '11.5px' } }, t('rule.picker.empty')),
                    ),
                  ),
                  h('div', { className: 'nsm__picker-actions' },
                    h('span', { className: 'nsm__picker-selected-info' }, tr('rule.picker.selected', { n: picker.targets.length })),
                    h('div', { className: 'nsm__modal-footer' },
                      h('button', { type: 'button', className: 'nsm__button', onClick: closePicker }, t('action.cancel')),
                      h('button', { type: 'button', className: 'nsm__button nsm__button--primary', onClick: handlePickerConfirm }, t('action.save')),
                    ),
                  ),
                ),
              ));
            }

            mainContent.push(h('div', { key: 'pane-rule', className: 'nsm__pane nsm__pane--rule' }, ...pane));
          }

          // ── Assemble workspace: sidebar + main ──
          content.push(h('div', { key: 'workspace', className: 'nsm__workspace' },
            h('nav', { key: 'sidebar', className: 'nsm__sidebar', role: 'navigation' },
              MODULES.map((mod) => h('button', {
                key: mod.id,
                type: 'button',
                role: 'tab',
                'aria-selected': activeModule === mod.id ? 'true' : 'false',
                className: `nsm__module${activeModule === mod.id ? ' is-active' : ''}`,
                onClick: () => setActiveModule(mod.id),
              },
                h('span', { className: 'nsm__module-icon' }, h(Glyph, { name: mod.icon, size: 14 })),
                h('span', { className: 'nsm__module-label' }, t(mod.key)),
              )),
            ),
            h('div', { key: 'main', className: 'nsm__main' }, mainContent),
          ));

          if (dragActive) {
            content.push(h('div', { key: 'drop', className: 'nsm__drop' },
              h('div', { className: 'nsm__drop-card' },
                h('span', { className: 'nsm__mark' }, h(PageMark, { size: 58 })),
                h('h3', null, t('import.drop')),
                h('p', null, t('import.dropHint')),
              ),
            ));
          }

          if (confirm) {
            const isPurge = confirm.kind === 'purge';
            const count = isPurge ? confirm.trashIds.length : confirm.ids.length;
            const title = isPurge
              ? tr('trash.purgeTitle', { n: count })
              : (count === 1 ? t('delete.title.one') : tr('delete.title.many', { n: count }));
            content.push(h('div', {
              key: 'modal',
              className: 'nsm__modal',
              onMouseDown: (event) => { if (event.target === event.currentTarget && !busy) setConfirm(null); },
            },
              h('div', { className: 'nsm__dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'nsm-delete-title' },
                h('h2', { id: 'nsm-delete-title' }, title),
                h('p', { className: 'nsm__dialog-warning' }, isPurge ? t('trash.purgeHint') : t('delete.warning')),
                h('ul', { className: 'nsm__dialog-list' }, confirm.titles.slice(0, 6).map((value, index) => h('li', { key: index }, value))),
                confirm.titles.length > 6 ? h('p', { className: 'nsm__dialog-more' }, tr('delete.more', { n: confirm.titles.length - 6 })) : null,
                !isPurge && confirm.active > 0 ? h('p', { className: 'nsm__dialog-live-note' }, tr('delete.activeNote', { n: confirm.active })) : null,
                h('div', { className: 'nsm__dialog-actions' },
                  h('button', { type: 'button', className: 'nsm__button', disabled: busy, autoFocus: true, onClick: () => setConfirm(null) }, t('action.cancel')),
                  h('button', {
                    type: 'button',
                    className: 'nsm__button nsm__button--danger',
                    disabled: busy,
                    onClick: performConfirm,
                  }, busy
                    ? (isPurge ? t('trash.purge') : t('action.deleteSelected'))
                    : (isPurge ? t('trash.purge') : (confirm.active > 0 ? t('delete.confirmStopDelete') : t('action.confirmDelete')))),
                ),
              ),
            ));
          }

          if (toast) {
            content.push(h('div', { key: 'toast', className: `nsm__toast is-${toast.kind}`, role: 'status', 'aria-live': 'polite' },
              h('span', { className: 'nsm__toast-icon' }, h(Glyph, { name: toast.kind === 'error' ? 'alert' : toast.kind === 'ok' ? 'check' : 'clock', size: 14 })),
              h('span', null, toast.text),
              toast.action ? h('button', {
                type: 'button',
                className: 'nsm__toast-action',
                onClick: () => { const action = toast.action; setToast(null); action.onClick(); },
              }, toast.action.label) : null,
            ));
          }

          content.push(h('input', {
            key: 'file',
            ref: fileInputRef,
            type: 'file',
            accept: '.json,application/json',
            multiple: true,
            className: 'nsm__sr',
            onChange: onFilePicked,
          }));

          return h('div', {
            className: 'nsm',
            onDragEnter,
            onDragOver,
            onDragLeave,
            onDrop,
          }, h('div', { className: 'nsm__inner' }, content));
        }

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 40,
          label: () => localized('nav.title'),
        }, function SessionsIcon(props) {
          const size = typeof props.size === 'number' ? props.size : 16;
          return h('svg', {
            width: size,
            height: size,
            viewBox: '0 0 16 16',
            fill: 'none',
            stroke: 'url(#nsm-nav-blue)',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            'aria-hidden': 'true',
            focusable: 'false',
            style: { display: 'block' },
          },
            h('defs', null,
              h('linearGradient', { id: 'nsm-nav-blue', x1: '3', y1: '3', x2: '13', y2: '13', gradientUnits: 'userSpaceOnUse' },
                h('stop', { offset: '0', stopColor: '#8fd3ff' }),
                h('stop', { offset: '1', stopColor: '#1d4ed8' }),
              ),
            ),
            h('path', { d: 'M3.5 3.5v9' }),
            h('path', { d: 'M3.5 5h4.5M3.5 8h6.5M3.5 11h4.5' }),
            h('circle', { cx: 3.5, cy: 3.5, r: 1.2, fill: '#e0f2fe', stroke: 'none' }),
            h('circle', { cx: 8, cy: 5, r: 1, fill: 'url(#nsm-nav-blue)', stroke: 'none' }),
            h('circle', { cx: 10, cy: 8, r: 1, fill: '#67e8f9', stroke: 'none' }),
            h('circle', { cx: 8, cy: 11, r: 1, fill: 'url(#nsm-nav-blue)', stroke: 'none' }),
          );
        }));

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
        }, Page));
      },
    };
  },
});
