// @ts-nocheck
import { defineStore } from 'pinia'
import { lsGet, lsSet, lsGetObj, trimMessages, getMobileGreeting, buildUserMessage, buildAiMessage, buildThinkingPlaceholder, noop } from '@/utils/helpers'
import * as C from '@/utils/constants'
import { fetchChatList, fetchChat, createChat, updateChat, patchChat, deleteChat as apiDeleteChat, fetchSettings, saveSettings } from '@/utils/api'
import { sparkStartAnim, sparkStopAnim } from '@/utils/sparkAnim'

/**
 * 应用主状态管理。
 * 将原 index.html 中单个 DCLogic 组件的全部逻辑收敛到 Pinia store，
 * 各 Vue 组件只负责展示与派发事件。
 */

export const useAppStore = defineStore('app', {
  state: () => ({
    // 导航
    tab: C.TABS.CHAT,
    sub: null,

    // 浮层/抽屉状态
    memory: false,
    drawer: false,
    plus: false,
    profile: false,
    style: false,
    sheet: null,

    // Toast
    toastShow: false,
    toastText: '',
    toastTimer: null,

    // 其他 UI
    apiAdvanced: false,
    editText: '',
    editingSessionId: '',
    currentThoughtText: C.DEMO_THOUGHT,
    showDemoCodeInput: false,
    demoCodeDraft: '',

    // 精灵动画
    sparkAnim: null,

    // 输入
    input: '',

    // 消息
    messages: [],
    isBusy: false,

    // 自定义模型输入
    customModelInput: '',

    // API 配置
    apiDraft: {
      name: lsGet(C.LS_API_NAME, 'My API'),
      apiType: lsGet(C.LS_API_TYPE, C.API_TYPES.OPENAI),
      connectorUrl: lsGet(C.LS_API_URL, ''),
      accessValue: lsGet(C.LS_API_KEY, ''),
      model: lsGet(C.LS_ACTIVE_MODEL, ''),
      useGateway: false,
      models: lsGetObj(C.LS_MY_MODELS, [])
    },
    availableModels: lsGetObj(C.LS_MY_MODELS, []),

    // Style
    styleDraft: {
      title: lsGet(C.LS_STYLE_TITLE, C.DEFAULT_STYLE.title),
      content: lsGet(C.LS_STYLE_CONTENT, C.DEFAULT_STYLE.content)
    },

    // Worldbook
    wbDraft: {
      permanent: lsGet(C.LS_WB_PERM, ''),
      triggersText: lsGet(C.LS_WB_TRIGGERS, '')
    },

    // Prompt templates
    promptTemplates: lsGetObj(C.LS_PROMPTS, C.DEFAULT_PROMPTS),
    promptDraftName: '',
    promptDraftText: '',

    // Persona
    personas: lsGetObj(C.LS_PERSONAS, C.DEFAULT_PERSONAS),
    personaDraftName: '',
    personaDraftText: '',
    activePersona: lsGet(C.LS_ACTIVE_PERSONA, ''),

    // 最近对话
    recentChats: [],
    currentChatId: 'current',

    // 后端连接状态
    serverConnected: false,
    _syncTimer: null,
    _reconnectTimer: null,

    // 服务端 version 缓存（chatId -> version）
    _chatVersions: {},

    // 增量同步变更集（chatId -> { added, deleted, edited }）
    _chatPending: {},

    // 聊天上下文菜单
    chatMenu: null,

    // 图片附件
    attachedImages: []
  }),

  getters: {
    isChat: (s) => s.tab === C.TABS.CHAT && !s.sub,
    isHome: (s) => s.tab === C.TABS.HOME && !s.sub,
    isMore: (s) => s.tab === C.TABS.MORE && !s.sub,
    showSub: (s) => !!s.sub,

    isApiSheet: (s) => s.sheet === C.SHEETS.API,
    isAiSheet: (s) => s.sheet === C.SHEETS.AI,
    isPromptSheet: (s) => s.sheet === C.SHEETS.PROMPT,
    isWorldbookSheet: (s) => s.sheet === C.SHEETS.WORLDBOOK,
    isThoughtSheet: (s) => s.sheet === C.SHEETS.THOUGHT,
    sheetOpen: (s) => !!s.sheet,

    isApiAdvanced: (s) => s.apiAdvanced,

    isAnthropic: (s) => (s.apiDraft.apiType || C.API_TYPES.OPENAI) === C.API_TYPES.ANTHROPIC,

    activeModel: (s) => s.apiDraft.model || '未选择模型',
    activeStyle: (s) => s.styleDraft.title || 'Soft neutral',
    activeCompanion: (s) => s.activePersona || '未选择',
    apiConfigured: (s) => !!s.apiDraft.connectorUrl && !!s.apiDraft.accessValue,

    showWelcome: (s) => (s.messages || []).length === 0,
    hasMessages: (s) => (s.messages || []).length > 0,
    hasAttachedImages: (s) => (s.attachedImages || []).length > 0,
    attachedImageHint: (s) => ((s.attachedImages || []).length > 0 ? s.attachedImages.length + ' 张' : '选择'),
    attachedImagesDisplay: (s) => (s.attachedImages || []).map((img, i) => ({ ...img, remove: () => s.removeAttachedImage(i) })),

    inputPlaceholder: (s) => (s.apiConfigured ? 'Message companion...' : '请先配置 API...'),
    mobileGreeting: () => getMobileGreeting(),
    welcomeText: (s) => {
      if (s.hasMessages) return ''
      return s.apiConfigured
        ? '你好！已配置好 API，选择模型后即可开始对话。'
        : '你好！请先点击右上角 ⋯ → API settings 配置你的中转站 URL 和 Key，然后拉取模型开始对话。'
    },

    subTitle: (s) => C.SUB_TITLES[s.sub] || '',
    promptCount: (s) => (s.promptTemplates || []).length + ' items',
    wbHint: (s) => (s.wbDraft.permanent ? '已配置' : '未配置'),

    apiModelListHint: (s) => {
      if (s.availableModels?.length > 0) return '已加载 ' + s.availableModels.length + ' 个模型'
      return s.apiConfigured ? '点击"拉模型"获取可用模型' : '请先配置 URL 和 Key'
    },

    apiModelOptions: (s) => {
      const model = s.apiDraft.model
      if ((s.availableModels || []).length > 0) {
        return s.availableModels.map(m => ({
          name: m,
          bd: m === model ? '#1A1815' : '#E7E3DA',
          bg: m === model ? '#1A1815' : '#FFF',
          fg: m === model ? '#F5F3EE' : '#2B2620',
          pick: () => s.selectModel(m),
          remove: () => s.removeModel(m)
        }))
      }
      return [{
        name: '暂无模型，点击"拉模型"或手动添加',
        bd: '#E7E3DA',
        bg: '#FFF',
        fg: '#9A958B',
        pick: () => s.show('请先拉模型或手动输入模型名'),
        remove: noop
      }]
    },

    apiOptions: (s) => [
      {
        name: s.apiDraft.name || 'My API',
        title: s.apiDraft.name || 'My API',
        model: s.apiDraft.model || '未选择',
        bg: '#1A1815',
        bd: '#1A1815',
        fg: '#F5F3EE',
        subFg: '#D8D3CA',
        badgeDisplay: 'inline-flex',
        badgeBg: '#F2EFE8',
        badgeFg: '#6B665E',
        pick: () => s.openApiSheet()
      }
    ],

    aiOptions: (s) => (s.personas || []).map((p, i) => ({
      name: p.name,
      state: p.name === s.activePersona ? '✓ 已选中' : '',
      color: p.name === s.activePersona ? '#1A1815' : '#9A958B',
      pick: () => s.selectPersona(p.name),
      remove: () => s.removePersona(i)
    })),

    promptOptions: (s) => (s.promptTemplates || []).map((p, i) => ({
      name: p.name,
      preview: p.text,
      pick: () => s.usePromptTemplate(p.text),
      remove: () => s.removePromptTemplate(i)
    })),

    styleOptions: (s) => {
      const title = s.styleDraft.title
      return [
        {
          name: 'Soft neutral',
          bg: title === 'Soft neutral' ? '#1A1815' : '#FFF',
          bd: title === 'Soft neutral' ? '#1A1815' : '#E7E3DA',
          fg: title === 'Soft neutral' ? '#F5F3EE' : '#2B2620',
          pick: () => {
            s.styleDraft = { title: 'Soft neutral', content: 'Warm companion UI.' }
            s.show('已切换到 Soft neutral')
          }
        },
        {
          name: 'Quiet paper',
          bg: title === 'Quiet paper' ? '#1A1815' : '#FFF',
          bd: title === 'Quiet paper' ? '#1A1815' : '#E7E3DA',
          fg: title === 'Quiet paper' ? '#F5F3EE' : '#2B2620',
          pick: () => {
            s.styleDraft = { title: 'Quiet paper', content: '安静、克制、像写在纸上的文字。少用感叹号，不说废话，像私人的日记笔记。' }
            s.show('已切换到 Quiet paper')
          }
        }
      ]
    },

    displayRecentChats: (s) => (s.recentChats || []).map(c => ({
      ...c,
      activeClass: c.id === s.currentChatId ? 'chat-menu-active' : '',
      bg: c.id === s.currentChatId ? '#EDEAE3' : 'transparent',
      open: () => s.openChat(c),
      openMenu: (e) => { e.stopPropagation(); s.showChatMenu(c, e) },
      touchStart: (e) => s.startLongPress(c, e),
      touchEnd: () => s.cancelLongPress(),
      contextMenu: (e) => { e.preventDefault(); s.showChatMenu(c, e) }
    })),

    displayMessages: (s) => {
      if ((s.messages || []).length === 0) return []
      return s.messages.map((m) => {
        if (m.role === 'user' || m.align === 'flex-end') {
          const isEditing = s.editingSessionId === m.sessionId && !!m.sessionId
          return {
            ...m,
            showEdit: isEditing,
            showNormal: !isEditing,
            edit: m.sessionId
              ? () => { s.editingSessionId = m.sessionId; s.editText = m.text }
              : () => { s.input = m.text; s.show('已填入输入框，可修改后发送') },
            delete: () => s.deleteSession(m.sessionId)
          }
        }
        if (m.role === 'assistant' || m.align === 'flex-start') {
          return {
            ...m,
            isAi: true,
            copy: m.copy || (() => { navigator.clipboard.writeText(m.text); s.show('已复制') }),
            refresh: m.refresh || (() => {
              const idx = s.messages.findIndex(x => x === m)
              if (idx > -1) {
                const msgs = [...s.messages]
                msgs.splice(idx, 1)
                s.messages = msgs
                s.sendMessageRegen()
              }
            }),
            prev: m.prev || (() => s.show('无更多版本')),
            next: m.next || (() => s.show('无更多版本')),
            openThink: m.openThink || noop
          }
        }
        return m
      })
    },

    apiDetailHint: (s) => {
      if (!s.apiConfigured) return '请先配置 URL 和 Key'
      return s.isAnthropic ? 'Anthropic 格式 - /v1/messages' : 'OpenAI 兼容 - /v1/chat/completions'
    },

    memoryOpen: (s) => s.memory,
    memRot: (s) => (s.memory ? 'rotate(180deg)' : 'rotate(0deg)'),
    drawerOpen: (s) => s.drawer,
    profileOpen: (s) => s.profile,
    plusOpen: (s) => s.plus,
    styleOpen: (s) => s.style,
    chatMenuOpen: (s) => !!s.chatMenu,
    chatMenuX: (s) => s.chatMenu?.x || 0,
    chatMenuY: (s) => s.chatMenu?.y || 0
  },

  actions: {
    // 生命周期初始化：从后端拉取数据，后端不可用时回退到 localStorage
    async init() {
      // 加载用户 API 配置：后端有则覆盖本地，后端无则把本地现有配置同步上去
      try {
        const remote = await fetchSettings()
        if (remote && remote.apiUrl) {
          this.apiDraft = {
            name: remote.name || 'My API',
            apiType: remote.apiType || C.API_TYPES.OPENAI,
            connectorUrl: remote.apiUrl,
            accessValue: remote.apiKey || '',
            model: remote.activeModel || '',
            useGateway: false,
            models: remote.models || []
          }
          this.availableModels = remote.models || []
          // 同步回 localStorage 兜底
          lsSet(C.LS_API_URL, remote.apiUrl)
          lsSet(C.LS_API_KEY, remote.apiKey || '')
          lsSet(C.LS_API_NAME, remote.name || 'My API')
          lsSet(C.LS_API_TYPE, remote.apiType || C.API_TYPES.OPENAI)
          lsSet(C.LS_ACTIVE_MODEL, remote.activeModel || '')
          lsSet(C.LS_MY_MODELS, remote.models || [])
        } else if (this.apiDraft && this.apiDraft.connectorUrl) {
          // 后端无配置但本地有，迁移到后端
          await saveSettings({
            name: this.apiDraft.name,
            apiType: this.apiDraft.apiType,
            apiUrl: this.apiDraft.connectorUrl,
            apiKey: this.apiDraft.accessValue,
            activeModel: this.apiDraft.model,
            models: this.apiDraft.models || this.availableModels || []
          })
        }
      } catch (err) {
        console.warn('[init] 加载 API 配置失败:', err.message)
      }
      try {
        const chatList = await fetchChatList()
        if (chatList && chatList.length > 0) {
          // 后端有数据，优先使用
          this.serverConnected = true
          this.recentChats = chatList.map(c => ({
            id: c.id,
            title: c.title,
            messages: []  // 消息内容按需加载，列表只存元数据
          }))
          // 确定当前对话：优先使用 localStorage 记录的 ID，否则取列表第一个
          let currentId = lsGet(C.LS_CURRENT_CHAT_ID, null)
          const found = this.recentChats.find(c => c.id === currentId)
          if (!found) currentId = this.recentChats[0].id
          this.currentChatId = currentId
          // 加载当前对话的消息
          await this.loadChatMessages(currentId)
          lsSet(C.LS_CURRENT_CHAT_ID, currentId)
        } else {
          // 后端无数据，可能是首次使用或后端刚启动
          this.serverConnected = true
          // 尝试从 localStorage 迁移旧数据到后端
          const oldRecents = lsGetObj(C.LS_RECENTS, null)
          if (oldRecents && oldRecents.length > 0) {
            for (const c of oldRecents) {
              try {
                await createChat(c.id, c.title, c.messages || [])
                this.recentChats.push({ id: c.id, title: c.title, messages: [] })
              } catch {}
            }
            if (this.recentChats.length > 0) {
              this.currentChatId = this.recentChats[0].id
              await this.loadChatMessages(this.currentChatId)
            }
          } else {
            // 完全没有历史数据，创建一个初始对话
            const newId = 'chat_' + Date.now()
            try {
              await createChat(newId, '当前对话', [])
              this.recentChats = [{ id: newId, title: '当前对话', messages: [] }]
              this.currentChatId = newId
              this.messages = []
            } catch {}
          }
          lsSet(C.LS_CURRENT_CHAT_ID, this.currentChatId)
        }
      } catch (err) {
        // 后端不可用，回退到 localStorage（兼容模式）
        console.warn('[init] 后端不可用，回退 localStorage:', err.message)
        this.serverConnected = false
        let recents = lsGetObj(C.LS_RECENTS, null)
        let currentId = lsGet(C.LS_CURRENT_CHAT_ID, null)
        if (!recents || !recents.length) {
          recents = [{ id: 'current', title: '当前对话', messages: lsGetObj(C.LS_MESSAGES, []) }]
          currentId = 'current'
        }
      const currentChat = recents.find(c => c.id === currentId) || recents[0]
      this.messages = lsGetObj(C.LS_MESSAGES, []) || currentChat.messages || []
      this.recentChats = recents
        this.currentChatId = currentChat.id
        lsSet(C.LS_RECENTS, recents)
        lsSet(C.LS_CURRENT_CHAT_ID, currentChat.id)
        lsSet(C.LS_MESSAGES, currentChat.messages || [])
        // 后端不可用，启动自动重连检测
        this.startReconnectTimer()
      }
      // 启动定时同步
      this.startSyncTimer()
      // 页面关闭前先同步写 localStorage 兜底，再尝试同步后端
      window.addEventListener('beforeunload', () => {
        lsSet(C.LS_MESSAGES, this._serializeMessages())
        this.flushCurrentChat()
      })
    },

    /** 从后端加载指定对话的消息 */
    async loadChatMessages(chatId) {
      if (!this.serverConnected) return
      try {
        const data = await fetchChat(chatId)
        if (data) {
          this.messages = (data.messages || []).map(m => this._restoreMessageCallbacks(m))
          lsSet(C.LS_MESSAGES, this.messages)
          // 记录服务端 version
          if (typeof data.version === 'number') {
            this._chatVersions[chatId] = data.version
          }
          // 从服务端拉取后，本地变更集已包含在 messages 中，清空 pending
          this._clearPending(chatId)
        }
      } catch (err) {
        console.warn('[loadChatMessages] 加载失败:', err.message)
      }
    },

    /** 恢复消息对象中的回调函数（JSON 序列化会丢失函数） */
    _restoreMessageCallbacks(m) {
      if (m.role === 'user' || m.align === 'flex-end') {
        return { ...m, showActions: false, showUserActions: true, showNormal: true, showEdit: false }
      }
      if (m.role === 'assistant' || m.align === 'flex-start') {
        return {
          ...m,
          isAi: true,
          showActions: true,
          showUserActions: false,
          showNormal: true,
          showEdit: false,
          copy: m.copy || (() => { navigator.clipboard.writeText(m.text); this.show('已复制') }),
          refresh: m.refresh || (() => {
            const idx = this.messages.findIndex(x => x.text === m.text && x.role === 'assistant')
            if (idx > -1) { const msgs = [...this.messages]; msgs.splice(idx, 1); this.messages = msgs; this.sendMessageRegen() }
          }),
          prev: m.prev || (() => this.show('无更多版本')),
          next: m.next || (() => this.show('无更多版本')),
          openThink: m.openThink || (m.thinkSummary ? (() => this.openThoughtSheet(m.text)) : noop)
        }
      }
      return m
    },

    // 同步精灵动画到 DOM（已迁移到 SparkBadge.vue 内部管理）
    syncSparkAnim() { /* noop */ },

    // Toast
    show(text) {
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastShow = true
      this.toastText = text || ''
      this.toastTimer = setTimeout(() => { this.toastShow = false }, 2200)
    },

    // 导航切换
    navChat() { this.tab = C.TABS.CHAT; this.sub = null; this.drawer = false },
    navHome() { this.tab = C.TABS.HOME; this.sub = null; this.drawer = false },
    navMore() { this.tab = C.TABS.MORE; this.sub = null; this.drawer = false },
    openMoments() { this.sub = C.SUBS.MOMENTS },
    openDiary() { this.sub = C.SUBS.DIARY },
    openMood() { this.sub = C.SUBS.MOOD },
    openAnniv() { this.sub = C.SUBS.ANNIVERSARY },
    closeSub() { this.sub = null },

    // 浮层开关
    toggleDrawer() { this.drawer = !this.drawer },
    togglePlus() { this.plus = !this.plus },
    toggleProfile() { this.profile = !this.profile },
    toggleMemory() { this.memory = !this.memory },

    openApiSheet() { this.plus = false; this.profile = false; this.sheet = C.SHEETS.API },
    openAiSheet() { this.plus = false; this.profile = false; this.sheet = C.SHEETS.AI },
    openPromptSheet() { this.plus = false; this.profile = false; this.sheet = C.SHEETS.PROMPT },
    openWorldbookSheet() { this.plus = false; this.profile = false; this.sheet = C.SHEETS.WORLDBOOK },
    openThoughtSheet(text) { this.plus = false; this.profile = false; this.sheet = C.SHEETS.THOUGHT; this.currentThoughtText = text || C.DEMO_THOUGHT },
    openStyle() { this.style = true },

    closeSheet() {
      const selectedModel = (this.apiDraft || {}).model || ''
      const trimmedModels = selectedModel ? [selectedModel] : []
      this.availableModels = trimmedModels
      this.apiDraft = { ...(this.apiDraft || {}), models: trimmedModels }
      lsSet(C.LS_MY_MODELS, trimmedModels)
      this.sheet = null
      this.profile = false
      this.plus = false
    },

    closeStyle() { this.style = false },

    // 输入框
    inputChange(value) { this.input = value },
    inputKey(e) {
      if (e && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    },

    // 发送消息
    async sendMessage(sessionId = '') {
      const userMessage = String(this.input || '').trim()
      if (!userMessage) return
      const draft = this.apiDraft || {}
      const apiUrl = draft.connectorUrl
      const apiKey = draft.accessValue
      const model = draft.model
      if (!apiUrl || !apiKey) { this.show('请先在 API settings 中填写 URL 和 Key'); this.openApiSheet(); return }
      if (!model) { this.show('请先选择或输入一个模型'); this.openApiSheet(); return }

      const finalSessionId = sessionId || ('session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6))
      const attachedImages = this.attachedImages || []
      const userMsg = buildUserMessage(userMessage, attachedImages, finalSessionId)
      const thinkingPlaceholder = buildThinkingPlaceholder()
      const newMessages = [...this.messages, userMsg, thinkingPlaceholder]

      this.messages = newMessages
      this.input = ''
      this.isBusy = true
      this.sparkAnim = 'waiting'
      this.attachedImages = []
      // 记录待同步的 user 消息
      this._getPending(this.currentChatId).added.push(this._serializeOneMessage(userMsg))
      lsSet(C.LS_MESSAGES, trimMessages(newMessages.filter(m => m.role !== 'thinking')))

      const apiMessages = []
      const wbPerm = lsGet(C.LS_WB_PERM, '')
      const styleContent = lsGet(C.LS_STYLE_CONTENT, '')
      let systemPrompt = ''
      const activePersona = lsGet(C.LS_ACTIVE_PERSONA, '')
      if (activePersona) {
        const personaList = lsGetObj(C.LS_PERSONAS, [])
        const personaObj = personaList.find(p => p.name === activePersona)
        if (personaObj && personaObj.text) systemPrompt += personaObj.text + '\n'
      }
      if (wbPerm) systemPrompt += wbPerm + '\n'
      if (styleContent) systemPrompt += 'Style: ' + styleContent
      if (systemPrompt) apiMessages.push({ role: 'system', content: systemPrompt.trim() })

      const isAnthropic = this.isAnthropic
      for (const m of newMessages) {
        const role = m.role || (m.align === 'flex-end' ? 'user' : 'assistant')
        if (m.role === 'user' && m.hasImages && attachedImages.length > 0) {
          const contentParts = []
          if (m.text && m.text !== '[图片]') {
            contentParts.push({ type: 'text', text: m.text })
          } else if (!m.text) {
            contentParts.push({ type: 'text', text: '请描述这张图片' })
          }
          for (const img of attachedImages) {
            const base64Data = img.dataUrl ? img.dataUrl.split(',')[1] : ''
            const mediaType = img.type || 'image/jpeg'
            if (isAnthropic) {
              contentParts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } })
            } else {
              contentParts.push({ type: 'image_url', image_url: { url: img.dataUrl } })
            }
          }
          apiMessages.push({ role, content: contentParts })
        } else {
          apiMessages.push({ role, content: m.text })
        }
      }

      const base = apiUrl.replace(/\/+$/, '')
      const endpoint = isAnthropic ? base + '/v1/messages' : base + '/v1/chat/completions'

      const makeHeaders = (withThinking) => {
        const h = {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
        if (isAnthropic) {
          h['x-api-key'] = apiKey
          h['anthropic-version'] = withThinking ? '2025-04-14' : '2023-06-01'
          if (withThinking) h['anthropic-beta'] = 'extended-thinking-2025-04-11'
        } else {
          h['Authorization'] = 'Bearer ' + apiKey
        }
        return h
      }

      const makeBody = (withThinking) => isAnthropic ? {
        model,
        max_tokens: withThinking ? 16000 : 4096,
        messages: apiMessages.filter(m => m.role !== 'system'),
        system: systemPrompt.trim() || undefined,
        stream: true,
        ...(withThinking ? { thinking: { type: 'enabled', budget_tokens: 8000 } } : {})
      } : {
        model, messages: apiMessages, stream: true, temperature: 0.7
      }

      const readStream = async (response, onDelta) => {
        if (!response.body) throw new Error('响应不支持流式读取')
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let done = false
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          if (readerDone) { done = true; break }
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const dataStr = trimmed.replace(/^data:\s*/, '').trim()
            if (dataStr === '[DONE]') { done = true; break }
            if (!dataStr) continue
            try {
              const data = JSON.parse(dataStr)
              onDelta(data)
            } catch (e) {
              console.warn('SSE JSON 解析失败:', dataStr, e)
            }
          }
        }
      }

      const extractError = async (response) => {
        let errText = 'HTTP ' + response.status
        try {
          const errData = await response.json()
          errText = errData.error?.message || errData.message || errText
        } catch {}
        return errText
      }

      try {
        let response
        const headers1 = makeHeaders(true)
        const body1 = makeBody(true)
        console.log('[stream] request body:', body1)
        const resp1 = await fetch(endpoint, { method: 'POST', headers: headers1, body: JSON.stringify(body1) })
        console.log('[stream] response status:', resp1.status, 'content-type:', resp1.headers.get('content-type'))
        if (!resp1.ok) {
          if (isAnthropic) {
            const headers2 = makeHeaders(false)
            const body2 = makeBody(false)
            const resp2 = await fetch(endpoint, { method: 'POST', headers: headers2, body: JSON.stringify(body2) })
            if (!resp2.ok) throw new Error(await extractError(resp2))
            response = resp2
          } else {
            throw new Error(await extractError(resp1))
          }
        } else {
          response = resp1
        }

        let aiReply = ''
        let thinkingText = ''
        let thinkingSummary = ''

        // 把 thinking placeholder 替换为可流式渲染的 AI 消息
        let streamIdx = this.messages.findIndex(m => m.role === 'thinking')
        if (streamIdx > -1) {
          const msgs = [...this.messages]
          msgs[streamIdx] = buildAiMessage('', finalSessionId, { showActions: false, isStreaming: true })
          this.messages = msgs
        }
        this.sparkAnim = 'writing'

        const updateStreamText = () => {
          if (streamIdx < 0) return
          const msgs = [...this.messages]
          msgs[streamIdx] = { ...msgs[streamIdx], text: aiReply || '...' }
          this.messages = msgs
        }

        const contentType = (response.headers.get('content-type') || '').toLowerCase()
        if (!contentType.includes('text/event-stream')) {
          // 上游未返回 SSE，退回到一次性 JSON 解析
          const data = await response.json()
          if (isAnthropic) {
            const contentBlocks = data.content || []
            for (const block of contentBlocks) {
              if (block.type === 'thinking' && block.thinking) thinkingText += block.thinking
              else if (block.type === 'text' && block.text) aiReply = block.text
            }
          } else {
            const msgObj = data.choices?.[0]?.message || {}
            aiReply = msgObj.content || ''
            thinkingText = msgObj.reasoning_content || msgObj.reasoning || ''
          }
          updateStreamText()
        } else {
          await readStream(response, (data) => {
            if (isAnthropic) {
              if (data.type === 'content_block_delta') {
                const delta = data.delta || {}
                if (delta.type === 'text_delta' && delta.text) aiReply += delta.text
                else if (delta.type === 'thinking_delta' && delta.thinking) thinkingText += delta.thinking
              }
            } else {
              const delta = data.choices?.[0]?.delta || {}
              if (delta.content) aiReply += delta.content
              if (delta.reasoning_content) thinkingText += delta.reasoning_content
              else if (delta.reasoning) thinkingText += delta.reasoning
            }
            updateStreamText()
          })
        }

        if (!aiReply) aiReply = '(无回复)'
        if (thinkingText) {
          const firstLine = thinkingText.split('\n').find(l => l.trim()) || ''
          thinkingSummary = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine
        }

        const aiMsg = buildAiMessage(aiReply, finalSessionId, {
          hasThink: !!thinkingText,
          thinkSummary: thinkingSummary || 'Thought process',
          openThink: thinkingText ? (() => this.openThoughtSheet(thinkingText)) : noop,
          copy: () => { navigator.clipboard.writeText(aiReply); this.show('已复制') },
          refresh: () => {
            const idx = this.messages.findIndex(m => m.text === aiReply && m.role === 'assistant')
            if (idx > -1) {
              const msgs = [...this.messages]
              msgs.splice(idx, 1)
              this.messages = msgs
              this.sendMessageRegen()
            }
          },
          prev: () => this.show('无更多版本'),
          next: () => this.show('无更多版本')
        })
        const msgs = [...this.messages]
        if (streamIdx > -1) msgs[streamIdx] = aiMsg
        else msgs.push(aiMsg)
        this.messages = msgs
        this.isBusy = false
        this.sparkAnim = null
        lsSet(C.LS_MESSAGES, trimMessages(msgs))
        this.saveCurrentChat(msgs)
        // 记录待同步的 AI 消息
        this._getPending(this.currentChatId).added.push(this._serializeOneMessage(aiMsg))
        // AI 回复完成 → 立即同步到后端
        this.flushCurrentChat()
      } catch (error) {
        this.show('连接失败: ' + error.message)
        const cleanedMessages = this.messages.filter(m => m.role !== 'thinking' && !m.isStreaming)
        this.messages = cleanedMessages
        this.isBusy = false
        this.sparkAnim = null
        lsSet(C.LS_MESSAGES, trimMessages(cleanedMessages))
        this.saveCurrentChat(cleanedMessages)
        this.flushCurrentChat()
      }
    },

    async sendMessageRegen() {
      const cleanMsgs = this.messages.filter(m => m.role !== 'thinking')
      const lastUserMsg = [...cleanMsgs].reverse().find(m => m.role === 'user' || m.align === 'flex-end')
      if (!lastUserMsg) { this.show('没有可重新生成的消息'); return }
      this.messages = cleanMsgs
      this.input = lastUserMsg.text
      // 复用原 sessionId，确保重新生成的 AI 回复与旧 user 消息仍是一对
      await this.sendMessage(lastUserMsg.sessionId)
    },

    async deleteSession(sessionId) {
      if (!sessionId) { this.show('无法删除：缺少 sessionId'); return }
      // 本地立即删除
      const remaining = this.messages.filter(m => m.sessionId !== sessionId)
      this.messages = remaining
      lsSet(C.LS_MESSAGES, trimMessages(remaining.filter(m => m.role !== 'thinking')))
      this.saveCurrentChat(remaining)
      this.show('已删除该轮对话')
      // 记录到增量变更集：移除同 sessionId 的 added/edited，加入 deleted
      const pending = this._getPending(this.currentChatId)
      pending.added = pending.added.filter(m => m.sessionId !== sessionId)
      pending.edited = pending.edited.filter(e => e.sessionId !== sessionId)
      if (!pending.deleted.includes(sessionId)) {
        pending.deleted.push(sessionId)
      }
      // 立即同步到后端
      this.flushCurrentChat()
    },

    // API 模型管理
    async fetchApiModels() {
      const draft = this.apiDraft || {}
      const apiUrl = draft.connectorUrl
      const apiKey = draft.accessValue
      if (!apiUrl || !apiKey) { this.show('请先填写 URL 和 Key'); return }
      this.show('正在拉取模型列表...')
      const base = apiUrl.replace(/\/+$/, '')
      const isAnthropic = this.isAnthropic
      const modelsEndpoint = base + '/v1/models'
      try {
        const headers = {}
        if (isAnthropic) { headers['x-api-key'] = apiKey; headers['anthropic-version'] = '2025-04-14' }
        else { headers['Authorization'] = 'Bearer ' + apiKey }
        const response = await fetch(modelsEndpoint, { headers })
        if (!response.ok) throw new Error('HTTP ' + response.status)
        const data = await response.json()
        let modelList = isAnthropic
          ? (data.data || []).map(m => m.id || m.name || m.model)
          : (data.data || []).map(m => m.id)
        modelList = modelList.filter(Boolean).sort()
        const existing = this.availableModels || []
        const merged = [...new Set([...existing, ...modelList])].sort()
        this.availableModels = merged
        lsSet(C.LS_MY_MODELS, merged)
        this.apiDraft = { ...(this.apiDraft || {}), models: merged }
        this.show('已加载 ' + modelList.length + ' 个模型')
      } catch (error) {
        this.show('拉取失败: ' + error.message)
      }
    },

    addCustomModel() {
      const name = String(this.customModelInput || '').trim()
      if (!name) { this.show('请输入模型名称'); return }
      const existing = this.availableModels || []
      if (existing.includes(name)) { this.show('该模型已在列表中'); return }
      const merged = [...existing, name].sort()
      this.availableModels = merged
      this.customModelInput = ''
      lsSet(C.LS_MY_MODELS, merged)
      this.apiDraft = { ...(this.apiDraft || {}), models: merged }
      this.show('已添加 ' + name)
    },

    selectModel(modelId) {
      this.apiDraft = { ...(this.apiDraft || {}), model: modelId }
      lsSet(C.LS_ACTIVE_MODEL, modelId)
      this.show('已选择 ' + modelId)
    },

    removeModel(modelId) {
      const merged = (this.availableModels || []).filter(m => m !== modelId)
      this.availableModels = merged
      this.apiDraft = { ...(this.apiDraft || {}), models: merged }
      lsSet(C.LS_MY_MODELS, merged)
      if (this.apiDraft.model === modelId) {
        this.apiDraft = { ...(this.apiDraft || {}), model: '' }
        lsSet(C.LS_ACTIVE_MODEL, '')
      }
      this.show('已移除 ' + modelId)
    },

    saveApiDraft() {
      const draft = this.apiDraft || {}
      if (!draft.connectorUrl || !draft.accessValue) { this.show('URL 和 Key 不能为空'); return }
      lsSet(C.LS_API_URL, draft.connectorUrl)
      lsSet(C.LS_API_KEY, draft.accessValue)
      lsSet(C.LS_API_NAME, draft.name || 'My API')
      lsSet(C.LS_API_TYPE, draft.apiType || C.API_TYPES.OPENAI)
      lsSet(C.LS_ACTIVE_MODEL, draft.model || '')
      const selectedModel = draft.model || ''
      const trimmedModels = selectedModel ? [selectedModel] : []
      this.availableModels = trimmedModels
      this.apiDraft = { ...(this.apiDraft || {}), models: trimmedModels }
      lsSet(C.LS_MY_MODELS, trimmedModels)
      // 同步到后端（apiKey 加密存储）
      saveSettings({
        name: draft.name || 'My API',
        apiType: draft.apiType || C.API_TYPES.OPENAI,
        apiUrl: draft.connectorUrl,
        apiKey: draft.accessValue,
        activeModel: draft.model || '',
        models: trimmedModels
      }).catch(err => console.warn('[saveApiDraft] 后端同步失败:', err.message))
      this.show('API 配置已保存')
      this.closeSheet()
    },

    deleteApiDraft() {
      this.apiDraft = { name: '', apiType: C.API_TYPES.OPENAI, connectorUrl: '', accessValue: '', model: '', useGateway: false, models: [] }
      lsSet(C.LS_API_URL, '')
      lsSet(C.LS_API_KEY, '')
      lsSet(C.LS_API_NAME, '')
      lsSet(C.LS_API_TYPE, C.API_TYPES.OPENAI)
      lsSet(C.LS_ACTIVE_MODEL, '')
      // 同步清空后端配置
      saveSettings({ name: '', apiType: C.API_TYPES.OPENAI, apiUrl: '', apiKey: '', activeModel: '', models: [] })
        .catch(err => console.warn('[deleteApiDraft] 后端同步失败:', err.message))
      this.show('API 配置已清空')
      this.closeSheet()
    },

    newApiDraft() {
      this.apiDraft = { name: '', apiType: C.API_TYPES.OPENAI, connectorUrl: '', accessValue: '', model: '', useGateway: false, models: this.availableModels || [] }
      this.apiAdvanced = true
      this.sheet = C.SHEETS.API
      this.plus = false
      this.profile = false
    },

    setApiOpenAI() { this.apiDraft = { ...(this.apiDraft || {}), apiType: C.API_TYPES.OPENAI } },
    setApiAnthropic() { this.apiDraft = { ...(this.apiDraft || {}), apiType: C.API_TYPES.ANTHROPIC } },
    toggleApiGateway() { /* noop placeholder */ },
    toggleApiAdvanced() { this.apiAdvanced = !this.apiAdvanced },

    apiNameChange(value) { this.apiDraft = { ...(this.apiDraft || {}), name: value } },
    connectorUrlChange(value) { this.apiDraft = { ...(this.apiDraft || {}), connectorUrl: value } },
    accessValueChange(value) { this.apiDraft = { ...(this.apiDraft || {}), accessValue: value } },
    apiModelChange(value) { this.apiDraft = { ...(this.apiDraft || {}), model: value } },
    customModelInputChange(value) { this.customModelInput = value },

    // 图片附件
    triggerImageSelect() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/jpeg,image/png,image/gif,image/webp'
      input.multiple = true
      input.onchange = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        const maxTotal = 5
        const existing = this.attachedImages || []
        if (existing.length + files.length > maxTotal) { this.show('最多附加 ' + maxTotal + ' 张图片'); return }
        const readers = files.map(file => new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result, size: file.size })
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(file)
        }))
        Promise.all(readers).then(results => {
          const valid = results.filter(r => r !== null)
          if (valid.length) {
            this.attachedImages = [...existing, ...valid]
            this.plus = false
            this.show('已添加 ' + valid.length + ' 张图片')
          }
        })
      }
      input.click()
    },

    removeAttachedImage(index) {
      const list = [...(this.attachedImages || [])]
      list.splice(index, 1)
      this.attachedImages = list
    },

    clearAttachedImages() {
      this.attachedImages = []
    },

    // ======== 同步机制 ========

    /** 启动定时同步 */
    startSyncTimer() {
      if (this._syncTimer) clearInterval(this._syncTimer)
      this._syncTimer = setInterval(() => this.syncToServer(), C.SYNC_INTERVAL)
    },

    /** 停止定时同步 */
    stopSyncTimer() {
      if (this._syncTimer) { clearInterval(this._syncTimer); this._syncTimer = null }
    },

    /** 启动后端重连检测 */
    startReconnectTimer() {
      if (this._reconnectTimer) clearInterval(this._reconnectTimer)
      this._reconnectTimer = setInterval(() => this.checkServer(), 30000)
    },

    /** 停止后端重连检测 */
    stopReconnectTimer() {
      if (this._reconnectTimer) { clearInterval(this._reconnectTimer); this._reconnectTimer = null }
    },

    /** 检测后端是否恢复，并重新进入同步模式 */
    async checkServer() {
      try {
        const chatList = await fetchChatList()
        if (!this.serverConnected) {
          console.log('[checkServer] 后端已恢复')
          this.serverConnected = true
          this.stopReconnectTimer()
          // 重新初始化列表与当前对话消息
          const currentId = this.currentChatId
          this.recentChats = chatList.map(c => ({ id: c.id, title: c.title, messages: [] }))
          const found = this.recentChats.find(c => c.id === currentId)
          if (found) {
            await this.loadChatMessages(currentId)
          } else if (this.recentChats.length > 0) {
            this.currentChatId = this.recentChats[0].id
            await this.loadChatMessages(this.currentChatId)
            lsSet(C.LS_CURRENT_CHAT_ID, this.currentChatId)
          }
          this.startSyncTimer()
        }
      } catch (err) {
        // 后端仍然不可用，保持降级模式
        this.serverConnected = false
      }
    },

    /** 定时同步：将当前对话的消息写入后端 */
    async syncToServer() {
      if (!this.serverConnected || !this.currentChatId || this.isBusy) return
      try {
        await this._syncToServerImpl(this.currentChatId, false)
      } catch (err) {
        console.warn('[syncToServer] 同步失败:', err.message)
        // 如果后端可能断开，启动重连检测
        if (!this._reconnectTimer) this.startReconnectTimer()
      }
    },

    /** 立即同步当前对话到后端（关键事件触发） */
    async flushCurrentChat() {
      if (!this.serverConnected || !this.currentChatId) return
      try {
        await this._syncToServerImpl(this.currentChatId, true)
      } catch (err) {
        console.warn('[flushCurrentChat] 同步失败:', err.message)
      }
    },

    /** 真正的同步实现：优先 PATCH 增量同步，冲突时回退全量 PUT */
    async _syncToServerImpl(chatId, isFlush) {
      if (!chatId) return
      const localTitle = this._currentTitle()
      const pending = this._getPending(chatId)
      const hasPending = pending.added.length > 0 || pending.deleted.length > 0 || pending.edited.length > 0

      let serverData = null
      try {
        serverData = await fetchChat(chatId)
      } catch (err) {
        console.warn('[_syncToServerImpl] 拉取最新数据失败:', err.message)
      }

      let versionToSend = this._chatVersions[chatId]

      // 服务端版本更新，需要全量合并
      if (serverData && typeof serverData.version === 'number') {
        const serverVersion = serverData.version
        if (typeof versionToSend !== 'number' || serverVersion > versionToSend) {
          const localMessages = this._serializeMessages()
          const merged = this._mergeMessages(localMessages, serverData.messages)
          this.messages = merged.map(m => this._restoreMessageCallbacks(m))
          lsSet(C.LS_MESSAGES, this.messages)
          this.saveCurrentChat(this.messages)
          const updated = await updateChat(chatId, localTitle, this._serializeMessages(), serverVersion)
          if (updated && typeof updated.version === 'number') {
            this._chatVersions[chatId] = updated.version
          }
          this._clearPending(chatId)
          if (isFlush) this.show('已合并其他页面的更新')
          return
        }
      }

      // version 一致，优先 PATCH 增量同步
      if (hasPending) {
        try {
          const updated = await patchChat(chatId, versionToSend, {
            title: localTitle,
            added: pending.added,
            deleted: pending.deleted,
            edited: pending.edited
          })
          if (updated && typeof updated.version === 'number') {
            this._chatVersions[chatId] = updated.version
          }
          this._clearPending(chatId)
          return
        } catch (err) {
          console.warn('[_syncToServerImpl] 增量同步失败，回退全量:', err.message)
        }
      }

      // 没有 pending 或增量失败，用全量兜底
      const updated = await updateChat(chatId, localTitle, this._serializeMessages(), versionToSend)
      if (updated && typeof updated.version === 'number') {
        this._chatVersions[chatId] = updated.version
      }
      this._clearPending(chatId)
    },

    /** 合并本地和服务端消息，以 sessionId 为键，本地优先 */
    _mergeMessages(local, remote) {
      const map = new Map()
      for (const m of remote) {
        if (m.sessionId) map.set(m.sessionId, m)
      }
      for (const m of local) {
        if (m.sessionId) map.set(m.sessionId, m)
      }
      const result = []
      const seen = new Set()
      for (const m of [...remote, ...local]) {
        if (!m.sessionId) {
          result.push(m)
          continue
        }
        if (!seen.has(m.sessionId)) {
          seen.add(m.sessionId)
          result.push(map.get(m.sessionId))
        }
      }
      return result
    },

    /** 获取当前对话的标题 */
    _currentTitle() {
      const firstUser = this.messages.find(m => m.role === 'user' || m.align === 'flex-end')
      let title = '当前对话'
      if (firstUser && firstUser.text) {
        const t = String(firstUser.text).trim()
        if (t) title = t.length > 20 ? t.slice(0, 20) + '...' : t
      }
      return title
    },

    /** 序列化单条消息 */
    _serializeOneMessage(m) {
      if (!m || m.role === 'thinking') return null
      const clean = {
        role: m.role,
        text: m.text,
        sessionId: m.sessionId || '',
        align: m.align,
        hasImages: m.hasImages || false,
        imageCount: m.imageCount || 0,
        hasThink: m.hasThink || false,
        thinkSummary: m.thinkSummary || ''
      }
      if (m.role === 'assistant') {
        clean.isAi = true
        clean.variantText = m.variantText || '1 / 1'
      }
      return clean
    },

    /** 序列化消息：去掉回调函数和 UI 状态属性，只保留业务数据 */
    _serializeMessages() {
      return (this.messages || []).map(m => this._serializeOneMessage(m)).filter(Boolean)
    },

    /** 获取指定对话的待同步变更集 */
    _getPending(chatId) {
      if (!chatId) return { added: [], deleted: [], edited: [] }
      if (!this._chatPending[chatId]) {
        this._chatPending[chatId] = { added: [], deleted: [], edited: [] }
      }
      return this._chatPending[chatId]
    },

    /** 清空指定对话的待同步变更集 */
    _clearPending(chatId) {
      if (chatId) {
        this._chatPending[chatId] = { added: [], deleted: [], edited: [] }
      } else {
        this._chatPending = {}
      }
    },

    // ======== 最近对话管理 ========

    buildSavedRecents() {
      const { messages, currentChatId, recentChats } = this
      return recentChats.map(c => {
        if (c.id === currentChatId) {
          const firstUser = messages.find(m => m.role === 'user' || m.align === 'flex-end')
          let title = c.title
          if (firstUser && firstUser.text) {
            const t = String(firstUser.text).trim()
            if (t) title = t.length > 20 ? t.slice(0, 20) + '...' : t
          }
          return { ...c, title, messages: [...messages] }
        }
        return c
      })
    },

    saveCurrentChat(messages) {
      const msgs = messages || this.messages
      const { currentChatId, recentChats } = this
      const list = recentChats.map(c => {
        if (c.id === currentChatId) {
          const firstUser = msgs.find(m => m.role === 'user' || m.align === 'flex-end')
          let title = c.title
          if (firstUser && firstUser.text) {
            const t = String(firstUser.text).trim()
            if (t) title = t.length > 20 ? t.slice(0, 20) + '...' : t
          }
          return { ...c, title, messages: [...msgs] }
        }
        return c
      })
      this.recentChats = list
      // localStorage 只存轻量元数据列表，不再存全量消息
      const metaList = list.map(c => ({ id: c.id, title: c.title, messages: [] }))
      lsSet(C.LS_RECENTS, metaList)
      // 当前对话的消息仍保留一份在 localStorage 作为缓冲
      lsSet(C.LS_MESSAGES, trimMessages(msgs.filter(m => m.role !== 'thinking')))
    },

    async newChat() {
      // 先把当前对话同步到后端
      await this.flushCurrentChat()
      const newId = 'chat_' + Date.now()
      const newChatObj = { id: newId, title: '当前对话', messages: [] }

      // 在后端创建
      if (this.serverConnected) {
        try {
          await createChat(newId, '当前对话', [])
        } catch (err) {
          console.warn('[newChat] 后端创建失败:', err.message)
        }
      }

      // 更新列表
      const hasMessages = (this.messages || []).length > 0
      const list = hasMessages ? this.buildSavedRecents() : this.recentChats.filter(c => c.id !== this.currentChatId)
      const newList = [newChatObj, ...list]
      this.messages = []
      this.input = ''
      this.recentChats = newList
      this.currentChatId = newId
      this.drawer = false
      lsSet(C.LS_MESSAGES, [])
      lsSet(C.LS_RECENTS, newList.map(c => ({ id: c.id, title: c.title, messages: [] })))
      lsSet(C.LS_CURRENT_CHAT_ID, newId)
      this.show('新对话已开始')
    },

    async openChat(chat) {
      if (chat.id === this.currentChatId) { this.drawer = false; return }
      // 先把当前对话同步到后端
      await this.flushCurrentChat()

      // 从后端加载目标对话的消息
      if (this.serverConnected) {
        try {
          const data = await fetchChat(chat.id)
          if (data) {
            this.messages = (data.messages || []).map(m => this._restoreMessageCallbacks(m))
          }
        } catch (err) {
          console.warn('[openChat] 后端加载失败:', err.message)
          // 回退：从 recentChats 列表取（仅适用于有本地缓冲的情况）
          const target = this.recentChats.find(c => c.id === chat.id)
          this.messages = target?.messages || []
        }
      } else {
        const target = this.recentChats.find(c => c.id === chat.id)
        this.messages = target?.messages || []
      }

      this.input = ''
      this.currentChatId = chat.id
      this.drawer = false
      lsSet(C.LS_MESSAGES, this.messages)
      lsSet(C.LS_CURRENT_CHAT_ID, chat.id)
    },

    async deleteChat(chat) {
      // 后端删除
      if (this.serverConnected) {
        try {
          await apiDeleteChat(chat.id)
        } catch (err) {
          console.warn('[deleteChat] 后端删除失败:', err.message)
        }
      }

      let list = this.recentChats.filter(c => c.id !== chat.id)
      if (list.length === 0) {
        const newId = 'chat_' + Date.now()
        const newChatObj = { id: newId, title: '当前对话', messages: [] }
        list = [newChatObj]
        if (this.serverConnected) {
          try { await createChat(newId, '当前对话', []) } catch {}
        }
      }
      if (chat.id === this.currentChatId) {
        if (this.serverConnected) {
          // 从后端加载替代对话的消息
          try {
            const data = await fetchChat(list[0].id)
            this.messages = (data?.messages || []).map(m => this._restoreMessageCallbacks(m))
          } catch { this.messages = [] }
        } else {
          this.messages = list[0].messages || []
        }
        this.input = ''
        this.recentChats = list
        this.currentChatId = list[0].id
        this.chatMenu = null
        lsSet(C.LS_MESSAGES, this.messages)
        lsSet(C.LS_CURRENT_CHAT_ID, list[0].id)
      } else {
        this.recentChats = list
        this.chatMenu = null
      }
      lsSet(C.LS_RECENTS, list.map(c => ({ id: c.id, title: c.title, messages: [] })))
    },

    async renameChat(chat) {
      const newTitle = window.prompt('重命名对话', chat.title)
      if (!newTitle || !newTitle.trim()) return
      const list = this.recentChats.map(c => c.id === chat.id ? { ...c, title: newTitle.trim() } : c)
      this.recentChats = list
      this.chatMenu = null
      lsSet(C.LS_RECENTS, list.map(c => ({ id: c.id, title: c.title, messages: [] })))
      // 同步标题到后端
      if (this.serverConnected) {
        try {
          await updateChat(chat.id, newTitle.trim(), null)
        } catch (err) {
          console.warn('[renameChat] 后端更新标题失败:', err.message)
        }
      }
    },

    showChatMenu(chat, e) {
      if (e && e.preventDefault) e.preventDefault()
      if (e && e.stopPropagation) e.stopPropagation()
      const clientX = e && e.clientX ? e.clientX : (e && e.touches && e.touches[0] ? e.touches[0].clientX : 0)
      const clientY = e && e.clientY ? e.clientY : (e && e.touches && e.touches[0] ? e.touches[0].clientY : 0)
      // 弹窗宽度约 148px、高度约 100px，做视口边界检测防止超出屏幕
      const vw = (typeof window !== 'undefined' && window.innerWidth) || 320
      const vh = (typeof window !== 'undefined' && window.innerHeight) || 480
      const menuW = 148
      const menuH = 100
      const clampedX = Math.max(8, Math.min(clientX, vw - menuW - 8))
      const clampedY = Math.max(8, Math.min(clientY, vh - menuH - 8))
      this.chatMenu = { chat, x: clampedX, y: clampedY }
    },

    closeChatMenu() { this.chatMenu = null },

    startLongPress(chat, e) {
      this.cancelLongPress()
      const touch = e && e.touches && e.touches[0]
      const x = touch ? touch.clientX : (e ? e.clientX : 0)
      const y = touch ? touch.clientY : (e ? e.clientY : 0)
      this._longPressTimer = setTimeout(() => {
        this._longPressTimer = null
        this.showChatMenu(chat, { clientX: x, clientY: y, preventDefault: noop, stopPropagation: noop })
      }, 500)
    },

    cancelLongPress() {
      if (this._longPressTimer) {
        clearTimeout(this._longPressTimer)
        this._longPressTimer = null
      }
    },

    doRenameChat(e) {
      if (e && e.stopPropagation) e.stopPropagation()
      if (this.chatMenu) this.renameChat(this.chatMenu.chat)
    },

    doDeleteChat(e) {
      if (e && e.stopPropagation) e.stopPropagation()
      if (this.chatMenu) this.deleteChat(this.chatMenu.chat)
    },

    pullCloud() { this.show('数据已保存在本地后端 chat-server') },
    syncCloud() { this.flushCurrentChat(); this.show('已同步到后端') },
    async githubBackup() { await this.flushCurrentChat(); this.show('数据已同步到后端') },

    // Worldbook
    saveWorldbook() {
      const wb = this.wbDraft || {}
      lsSet(C.LS_WB_PERM, wb.permanent || '')
      lsSet(C.LS_WB_TRIGGERS, wb.triggersText || '')
      this.show('Worldbook 已保存')
    },

    wbPermanentChange(value) { this.wbDraft = { ...(this.wbDraft || {}), permanent: value } },
    wbTriggersChange(value) { this.wbDraft = { ...(this.wbDraft || {}), triggersText: value } },

    // Prompt templates
    addPromptTemplate() {
      const name = String(this.promptDraftName || '').trim()
      const text = String(this.promptDraftText || '').trim()
      if (!name || !text) { this.show('名称和内容不能为空'); return }
      const list = [...(this.promptTemplates || []), { name, text }]
      this.promptTemplates = list
      this.promptDraftName = ''
      this.promptDraftText = ''
      lsSet(C.LS_PROMPTS, list)
      this.show('已添加模板 ' + name)
    },

    removePromptTemplate(idx) {
      const list = [...(this.promptTemplates || [])]
      list.splice(idx, 1)
      this.promptTemplates = list
      lsSet(C.LS_PROMPTS, list)
      this.show('已移除模板')
    },

    usePromptTemplate(text) {
      this.input = text
      this.sheet = null
    },

    promptDraftNameChange(value) { this.promptDraftName = value },
    promptDraftTextChange(value) { this.promptDraftText = value },

    // Persona
    addPersona() {
      const name = String(this.personaDraftName || '').trim()
      const text = String(this.personaDraftText || '').trim()
      if (!name || !text) { this.show('名称和设定不能为空'); return }
      const list = [...(this.personas || []), { name, text }]
      this.personas = list
      this.personaDraftName = ''
      this.personaDraftText = ''
      lsSet(C.LS_PERSONAS, list)
      this.show('已添加角色 ' + name)
    },

    removePersona(idx) {
      const list = [...(this.personas || [])]
      if (list[idx]?.name === this.activePersona) {
        this.activePersona = ''
        lsSet(C.LS_ACTIVE_PERSONA, '')
      }
      list.splice(idx, 1)
      this.personas = list
      lsSet(C.LS_PERSONAS, list)
      this.show('已移除角色')
    },

    selectPersona(name) {
      this.activePersona = name
      lsSet(C.LS_ACTIVE_PERSONA, name)
      this.show('已选择 ' + name)
      this.closeSheet()
    },

    personaDraftNameChange(value) { this.personaDraftName = value },
    personaDraftTextChange(value) { this.personaDraftText = value },

    // Style
    saveStyle() {
      const st = this.styleDraft || {}
      lsSet(C.LS_STYLE_TITLE, st.title || '')
      lsSet(C.LS_STYLE_CONTENT, st.content || '')
      this.show('Style 已保存')
    },

    styleTitleChange(value) { this.styleDraft = { ...(this.styleDraft || {}), title: value } },
    styleContentChange(value) { this.styleDraft = { ...(this.styleDraft || {}), content: value } },

    // Demo code
    cancelToken() { this.showDemoCodeInput = false; this.demoCodeDraft = '' },
    confirmToken() { this.show('Demo access placeholder'); this.showDemoCodeInput = false; this.demoCodeDraft = '' },
    confirmTokenTouch() { this.confirmToken() },
    demoCodeDraftChange(value) { this.demoCodeDraft = value },

    // 编辑
    editTextChange(value) { this.editText = value },
    cancelEdit() {
      this.editingSessionId = ''
      this.editText = ''
    },
    saveEdit() {
      const sessionId = this.editingSessionId
      if (!sessionId) return
      const newText = this.editText.trim()
      if (!newText) { this.show('内容不能为空'); return }
      const idx = this.messages.findIndex(m => m.sessionId === sessionId && (m.role === 'user' || m.align === 'flex-end'))
      if (idx === -1) return
      const msgs = [...this.messages]
      msgs[idx] = { ...msgs[idx], text: newText }
      this.messages = msgs
      this.editingSessionId = ''
      this.editText = ''
      lsSet(C.LS_MESSAGES, trimMessages(msgs.filter(m => m.role !== 'thinking')))
      this.saveCurrentChat(msgs)
      this.show('已修改')
      // 记录到增量变更集
      const pending = this._getPending(this.currentChatId)
      const existingEdit = pending.edited.find(e => e.sessionId === sessionId)
      if (existingEdit) {
        existingEdit.text = newText
      } else {
        pending.edited.push({ sessionId, text: newText })
      }
      // 编辑后立即同步到后端
      this.flushCurrentChat()
    }
  }
})
