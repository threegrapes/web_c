import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CHAT_DIR = path.join(__dirname, 'chat')
const MANIFEST_PATH = path.join(CHAT_DIR, 'manifest.json')
const CONFIG_DIR = path.join(__dirname, 'config')
const SETTINGS_PATH = path.join(CONFIG_DIR, 'settings.json')
const app = express()
const PORT = 3001

// 确保 chat / config 目录存在
if (!fs.existsSync(CHAT_DIR)) {
  fs.mkdirSync(CHAT_DIR, { recursive: true })
}
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
}

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// ============ 简易认证 ============
// 个人项目：从环境变量读取 token，未设置时跳过认证（开发模式）
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''
const PUBLIC_PATHS = new Set()

function authMiddleware(req, res, next) {
  if (!AUTH_TOKEN) return next() // 未设置 token 则不启用认证
  // 读取 header 或 query 中的 token
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token || req.headers['x-auth-token']
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ success: false, error: '未授权' })
  }
  next()
}

// 对所有 /api 路由启用认证
app.use('/api', authMiddleware)

// ============ 工具函数 ============

/** 校验对话 ID，只允许字母、数字、下划线、连字符 */
function sanitizeId(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '')
}

function getChatPath(id) {
  const safeId = sanitizeId(id)
  if (!safeId) return null
  return path.join(CHAT_DIR, `${safeId}.json`)
}

/** 读取 manifest（对话元数据缓存） */
function loadManifest() {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
    }
  } catch (err) {
    console.warn('[manifest] 读取失败:', err.message)
  }
  return {}
}

/** 写入 manifest */
function saveManifest(manifest) {
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[manifest] 写入失败:', err.message)
  }
}

/** 从 chatData 提取元数据 */
function buildChatMeta(chatData) {
  return {
    id: chatData.id,
    title: chatData.title || '当前对话',
    createdAt: chatData.createdAt || Date.now(),
    updatedAt: chatData.updatedAt || Date.now(),
    messageCount: (chatData.messages || []).length,
    version: chatData.version || 1
  }
}

/** 更新 manifest 中的某个对话条目 */
function updateManifestEntry(id, chatData) {
  const manifest = loadManifest()
  manifest[id] = buildChatMeta(chatData)
  saveManifest(manifest)
}

/** 从 manifest 移除某个对话条目 */
function removeManifestEntry(id) {
  const manifest = loadManifest()
  delete manifest[id]
  saveManifest(manifest)
}

/** 读取聊天文件 */
function readChatFile(id) {
  const filePath = getChatPath(id)
  if (!filePath || !fs.existsSync(filePath)) return null
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    // 兼容旧数据：补上 version
    if (typeof data.version !== 'number') {
      data.version = 1
    }
    return data
  } catch {
    return null
  }
}

/** 写入聊天文件 */
function writeChatFile(id, data) {
  const filePath = getChatPath(id)
  if (!filePath) throw new Error('无效对话 ID')
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  updateManifestEntry(id, data)
}

/** 删除聊天文件 */
function deleteChatFile(id) {
  const filePath = getChatPath(id)
  if (!filePath) return false
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    removeManifestEntry(id)
    return true
  }
  return false
}

/** 列出所有对话元数据（直接读 manifest，不再遍历文件） */
function listChatFiles() {
  const manifest = loadManifest()
  return Object.values(manifest)
    .filter(m => m && m.id)
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
}

/** 初始化 manifest：如果文件没有 manifest 条目则重建 */
function rebuildManifest() {
  const manifest = loadManifest()
  let dirty = false
  const files = fs.readdirSync(CHAT_DIR).filter(f => f.endsWith('.json') && f !== 'manifest.json')
  for (const f of files) {
    const id = f.replace('.json', '')
    if (manifest[id]) continue
    try {
      const data = JSON.parse(fs.readFileSync(path.join(CHAT_DIR, f), 'utf-8'))
      manifest[id] = buildChatMeta(data)
      dirty = true
    } catch {
      // 损坏文件，忽略
    }
  }
  // 清理 manifest 中不存在的文件条目
  const existingIds = new Set(files.map(f => f.replace('.json', '')))
  for (const id of Object.keys(manifest)) {
    if (!existingIds.has(id)) {
      delete manifest[id]
      dirty = true
    }
  }
  if (dirty) saveManifest(manifest)
}

// 启动时重建一次 manifest，保证一致性
rebuildManifest()

// ============ 配置加密 ============

/**
 * 使用 AES-256-CBC 加密敏感字段（如 API Key）。
 * 个人项目：密钥从环境变量 CONFIG_ENCRYPTION_KEY 读取，缺省使用内置默认值。
 * 存储格式：enc:<iv_hex>:<ciphertext_hex>
 */
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || 'claude-vue-personal-default-key'
const _keyBuffer = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()

function encryptText(text) {
  if (!text) return ''
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', _keyBuffer, iv)
  let encrypted = cipher.update(String(text), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `enc:${iv.toString('hex')}:${encrypted}`
}

function decryptText(encrypted) {
  if (!encrypted || typeof encrypted !== 'string') return ''
  if (!encrypted.startsWith('enc:')) return encrypted
  const parts = encrypted.split(':')
  if (parts.length !== 3) return ''
  try {
    const iv = Buffer.from(parts[1], 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', _keyBuffer, iv)
    let decrypted = decipher.update(parts[2], 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return ''
  }
}

/** 读取用户配置 */
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
    }
  } catch (err) {
    console.warn('[settings] 读取失败:', err.message)
  }
  return {}
}

/** 写入用户配置 */
function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[settings] 写入失败:', err.message)
  }
}

// ============ API 路由 ============

/** 获取所有对话列表（元数据，不含消息内容） */
app.get('/api/chats', (req, res) => {
  try {
    const list = listChatFiles()
    res.json({ success: true, data: list })
  } catch (err) {
    res.status(500).json({ success: false, error: '读取对话列表失败: ' + err.message })
  }
})

/** 获取某个对话的完整消息 */
app.get('/api/chats/:id', (req, res) => {
  const data = readChatFile(req.params.id)
  if (!data) {
    return res.status(404).json({ success: false, error: '对话不存在' })
  }
  res.json({ success: true, data })
})

/** 新建对话 */
app.post('/api/chats', (req, res) => {
  const { id, title, messages } = req.body
  if (!id || !sanitizeId(id)) {
    return res.status(400).json({ success: false, error: '缺少或非法的对话 ID' })
  }
  // 如果文件已存在则返回冲突
  if (readChatFile(id)) {
    return res.status(409).json({ success: false, error: '对话已存在' })
  }
  const now = Date.now()
  const chatData = {
    id,
    title: title ?? '当前对话',
    messages: messages || [],
    createdAt: now,
    updatedAt: now,
    version: 1
  }
  try {
    writeChatFile(id, chatData)
    res.json({ success: true, data: chatData })
  } catch (err) {
    res.status(500).json({ success: false, error: '保存对话失败: ' + err.message })
  }
})

/** 更新对话（全量写入消息，带乐观锁） */
app.put('/api/chats/:id', (req, res) => {
  const existing = readChatFile(req.params.id)
  if (!existing) {
    return res.status(404).json({ success: false, error: '对话不存在' })
  }
  const { title, messages, version: clientVersion } = req.body

  // 乐观锁：客户端传了 version 时校验，不一致即冲突
  if (typeof clientVersion === 'number' && clientVersion !== existing.version) {
    return res.status(409).json({
      success: false,
      error: '版本冲突，请重新拉取后合并',
      data: existing
    })
  }

  const updated = {
    ...existing,
    title: title ?? existing.title,
    messages: messages || existing.messages,
    updatedAt: Date.now(),
    version: existing.version + 1
  }
  writeChatFile(req.params.id, updated)
  res.json({ success: true, data: updated })
})

/** 增量更新对话（只同步新增/删除/编辑的消息） */
app.patch('/api/chats/:id', (req, res) => {
  const existing = readChatFile(req.params.id)
  if (!existing) {
    return res.status(404).json({ success: false, error: '对话不存在' })
  }
  const { title, added = [], deleted = [], edited = [], version: clientVersion } = req.body

  // 乐观锁：客户端传了 version 时校验，不一致即冲突
  if (typeof clientVersion === 'number' && clientVersion !== existing.version) {
    return res.status(409).json({
      success: false,
      error: '版本冲突，请重新拉取后合并',
      data: existing
    })
  }

  let messages = [...(existing.messages || [])]
  const existingSessionIds = new Set(messages.map(m => m.sessionId).filter(Boolean))

  // 1. 应用新增：过滤掉已存在的 sessionId，追加到末尾
  const addedFiltered = added.filter(m => m.sessionId && !existingSessionIds.has(m.sessionId))
  messages.push(...addedFiltered)

  // 2. 应用删除
  const deletedSet = new Set(deleted.filter(Boolean))
  messages = messages.filter(m => !deletedSet.has(m.sessionId))

  // 3. 应用编辑：只修改 user 消息文本
  const editedMap = new Map()
  for (const e of edited) {
    if (e && e.sessionId) editedMap.set(e.sessionId, e.text)
  }
  messages = messages.map(m => {
    if (m.sessionId && editedMap.has(m.sessionId) && m.role === 'user') {
      return { ...m, text: editedMap.get(m.sessionId) }
    }
    return m
  })

  // 4. 清理 thinking 占位消息
  messages = messages.filter(m => m.role !== 'thinking')

  const updated = {
    ...existing,
    title: title ?? existing.title,
    messages,
    updatedAt: Date.now(),
    version: existing.version + 1
  }
  writeChatFile(req.params.id, updated)
  res.json({ success: true, data: updated })
})

/** 删除整个对话 */
app.delete('/api/chats/:id', (req, res) => {
  const ok = deleteChatFile(req.params.id)
  if (!ok) {
    return res.status(404).json({ success: false, error: '对话不存在' })
  }
  res.json({ success: true })
})

/** 删除某一对消息（根据 sessionId 删除 user + assistant 一对） */
app.delete('/api/chats/:id/messages/:sessionId', (req, res) => {
  const data = readChatFile(req.params.id)
  if (!data) {
    return res.status(404).json({ success: false, error: '对话不存在' })
  }
  const sessionId = req.params.sessionId
  const remaining = (data.messages || []).filter(m => m.sessionId !== sessionId)
  const deleted = (data.messages || []).filter(m => m.sessionId === sessionId)
  if (deleted.length === 0) {
    return res.status(404).json({ success: false, error: '未找到该轮对话' })
  }
  const updated = {
    ...data,
    messages: remaining,
    updatedAt: Date.now(),
    version: data.version + 1
  }
  writeChatFile(req.params.id, updated)
  res.json({ success: true, deletedCount: deleted.length, data: updated })
})

/** 读取用户配置（apiKey 解密后返回，前端可直接使用） */
app.get('/api/settings', (req, res) => {
  try {
    const s = loadSettings()
    const data = {
      name: s.name || '',
      apiType: s.apiType || '',
      apiUrl: s.apiUrl || '',
      apiKey: s.apiKey ? decryptText(s.apiKey) : '',
      activeModel: s.activeModel || '',
      models: Array.isArray(s.models) ? s.models : []
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '读取配置失败: ' + err.message })
  }
})

/** 保存用户配置（apiKey 加密后存储，返回时回传明文方便前端使用） */
app.put('/api/settings', (req, res) => {
  try {
    const { name, apiType, apiUrl, apiKey, activeModel, models } = req.body
    const plainKey = typeof apiKey === 'string' ? apiKey : ''
    const settings = {
      name: name || '',
      apiType: apiType || 'openai',
      apiUrl: apiUrl || '',
      apiKey: plainKey ? encryptText(plainKey) : '',
      activeModel: activeModel || '',
      models: Array.isArray(models) ? models : []
    }
    saveSettings(settings)
    res.json({ success: true, data: { ...settings, apiKey: plainKey } })
  } catch (err) {
    res.status(500).json({ success: false, error: '保存配置失败: ' + err.message })
  }
})

// ============ 启动 ============

app.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`)
  console.log(`Chat files stored in: ${CHAT_DIR}`)
  console.log(`Settings stored in: ${SETTINGS_PATH}`)
})
