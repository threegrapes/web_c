// @ts-nocheck
import { defineStore } from 'pinia'
import { lsGet, lsSet, lsGetObj, trimMessages, getMobileGreeting, buildUserMessage, buildAiMessage, buildThinkingPlaceholder, noop } from '@/utils/helpers'
import * as C from '@/utils/constants'
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
          return { ...m, edit: () => { s.input = m.text; s.show('已填入输入框，可修改后发送') } }
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
    // 生命周期初始化
    init() {
      let recents = lsGetObj(C.LS_RECENTS, null)
      let currentId = lsGet(C.LS_CURRENT_CHAT_ID, null)
      if (!recents || !recents.length) {
        recents = [{ id: 'current', title: '当前对话', messages: lsGetObj(C.LS_MESSAGES, []) }]
        currentId = 'current'
      }
      const currentChat = recents.find(c => c.id === currentId) || recents[0]
      this.messages = currentChat.messages || []
      this.recentChats = recents
      this.currentChatId = currentChat.id
      lsSet(C.LS_RECENTS, recents)
      lsSet(C.LS_CURRENT_CHAT_ID, currentChat.id)
      lsSet(C.LS_MESSAGES, currentChat.messages || [])
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
    async sendMessage() {
      const userMessage = String(this.input || '').trim()
      if (!userMessage) return
      const draft = this.apiDraft || {}
      const apiUrl = draft.connectorUrl
      const apiKey = draft.accessValue
      const model = draft.model
      if (!apiUrl || !apiKey) { this.show('请先在 API settings 中填写 URL 和 Key'); this.openApiSheet(); return }
      if (!model) { this.show('请先选择或输入一个模型'); this.openApiSheet(); return }

      const attachedImages = this.attachedImages || []
      const userMsg = buildUserMessage(userMessage, attachedImages)
      const thinkingPlaceholder = buildThinkingPlaceholder()
      const newMessages = [...this.messages, userMsg, thinkingPlaceholder]

      this.messages = newMessages
      this.input = ''
      this.isBusy = true
      this.sparkAnim = 'waiting'
      this.attachedImages = []
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
        const h = { 'Content-Type': 'application/json' }
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
        ...(withThinking ? { thinking: { type: 'enabled', budget_tokens: 8000 } } : {})
      } : {
        model, messages: apiMessages, stream: false, temperature: 0.7
      }

      const parseResponse = (data) => {
        let aiReply = '', thinkingText = '', thinkingSummary = ''
        if (isAnthropic) {
          const contentBlocks = data.content || []
          for (const block of contentBlocks) {
            if (block.type === 'thinking' && block.thinking) thinkingText += block.thinking
            else if (block.type === 'text' && block.text) aiReply = block.text
          }
          if (!aiReply) aiReply = '(无回复)'
        } else {
          const msgObj = data.choices?.[0]?.message || {}
          aiReply = msgObj.content || '(无回复)'
          thinkingText = msgObj.reasoning_content || msgObj.reasoning || ''
        }
        if (thinkingText) {
          const firstLine = thinkingText.split('\n').find(l => l.trim()) || ''
          thinkingSummary = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine
        }
        return { aiReply, thinkingText, thinkingSummary }
      }

      try {
        const headers1 = makeHeaders(true)
        const body1 = makeBody(true)
        const resp1 = await fetch(endpoint, { method: 'POST', headers: headers1, body: JSON.stringify(body1) })
        let data
        if (!resp1.ok) {
          if (isAnthropic) {
            const headers2 = makeHeaders(false)
            const body2 = makeBody(false)
            const resp2 = await fetch(endpoint, { method: 'POST', headers: headers2, body: JSON.stringify(body2) })
            if (!resp2.ok) {
              let errText = 'HTTP ' + resp2.status
              try { const errData = await resp2.json(); errText = errData.error?.message || errData.message || errText } catch {}
              throw new Error(errText)
            }
            data = await resp2.json()
          } else {
            let errText = 'HTTP ' + resp1.status
            try { const errData = await resp1.json(); errText = errData.error?.message || errData.message || errText } catch {}
            throw new Error(errText)
          }
        } else {
          data = await resp1.json()
        }

        const { aiReply, thinkingText, thinkingSummary } = parseResponse(data)
        const aiMsg = buildAiMessage(aiReply, {
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
        const cleanedMessages = newMessages.filter(m => m.role !== 'thinking')
        const finalMessages = [...cleanedMessages, aiMsg]
        this.messages = finalMessages
        this.isBusy = false
        this.sparkAnim = null
        lsSet(C.LS_MESSAGES, trimMessages(finalMessages))
        this.saveCurrentChat(finalMessages)
      } catch (error) {
        this.show('连接失败: ' + error.message)
        const cleanedMessages = this.messages.filter(m => m.role !== 'thinking')
        this.messages = cleanedMessages
        this.isBusy = false
        this.sparkAnim = null
        lsSet(C.LS_MESSAGES, trimMessages(cleanedMessages))
        this.saveCurrentChat(cleanedMessages)
      }
    },

    async sendMessageRegen() {
      const cleanMsgs = this.messages.filter(m => m.role !== 'thinking')
      const lastUserMsg = [...cleanMsgs].reverse().find(m => m.role === 'user' || m.align === 'flex-end')
      if (!lastUserMsg) { this.show('没有可重新生成的消息'); return }
      this.messages = cleanMsgs
      this.input = lastUserMsg.text
      await this.sendMessage()
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

    // 最近对话管理
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
      lsSet(C.LS_RECENTS, list)
    },

    newChat() {
      const hasMessages = (this.messages || []).length > 0
      const list = hasMessages ? this.buildSavedRecents() : this.recentChats.filter(c => c.id !== this.currentChatId)
      const newId = 'chat_' + Date.now()
      const newChat = { id: newId, title: '当前对话', messages: [] }
      const newList = [newChat, ...list]
      this.messages = []
      this.input = ''
      this.recentChats = newList
      this.currentChatId = newId
      this.drawer = false
      lsSet(C.LS_MESSAGES, [])
      lsSet(C.LS_RECENTS, newList)
      lsSet(C.LS_CURRENT_CHAT_ID, newId)
      this.show('新对话已开始')
    },

    openChat(chat) {
      if (chat.id === this.currentChatId) { this.drawer = false; return }
      const hasMessages = (this.messages || []).length > 0
      const list = hasMessages ? this.buildSavedRecents() : this.recentChats.filter(c => c.id !== this.currentChatId)
      const target = list.find(c => c.id === chat.id)
      if (!target) return
      this.messages = target.messages || []
      this.input = ''
      this.recentChats = list
      this.currentChatId = target.id
      this.drawer = false
      lsSet(C.LS_MESSAGES, target.messages || [])
      lsSet(C.LS_RECENTS, list)
      lsSet(C.LS_CURRENT_CHAT_ID, target.id)
    },

    deleteChat(chat) {
      let list = this.recentChats.filter(c => c.id !== chat.id)
      if (list.length === 0) {
        const newId = 'chat_' + Date.now()
        list = [{ id: newId, title: '当前对话', messages: [] }]
      }
      if (chat.id === this.currentChatId) {
        this.messages = list[0].messages || []
        this.input = ''
        this.recentChats = list
        this.currentChatId = list[0].id
        this.chatMenu = null
        lsSet(C.LS_MESSAGES, list[0].messages || [])
        lsSet(C.LS_CURRENT_CHAT_ID, list[0].id)
      } else {
        this.recentChats = list
        this.chatMenu = null
      }
      lsSet(C.LS_RECENTS, list)
    },

    renameChat(chat) {
      const newTitle = window.prompt('重命名对话', chat.title)
      if (!newTitle || !newTitle.trim()) return
      const list = this.recentChats.map(c => c.id === chat.id ? { ...c, title: newTitle.trim() } : c)
      this.recentChats = list
      this.chatMenu = null
      lsSet(C.LS_RECENTS, list)
    },

    showChatMenu(chat, e) {
      if (e && e.preventDefault) e.preventDefault()
      if (e && e.stopPropagation) e.stopPropagation()
      const clientX = e && e.clientX ? e.clientX : (e && e.touches && e.touches[0] ? e.touches[0].clientX : 0)
      const clientY = e && e.clientY ? e.clientY : (e && e.touches && e.touches[0] ? e.touches[0].clientY : 0)
      this.chatMenu = { chat, x: clientX, y: clientY }
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

    pullCloud() { this.show('本地模式，无云端') },
    syncCloud() { this.show('本地模式') },
    githubBackup() { this.show('本地模式') },

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

    // 编辑（占位）
    editTextChange(value) { this.editText = value },
    cancelEdit() { this.show('编辑取消') },
    saveEdit() { this.show('编辑保存') }
  }
})
