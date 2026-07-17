/**
 * 后端 Chat Server API 调用封装。
 * 所有与 chat-server 交互的逻辑集中在此，store 中只调用这些函数。
 *
 * 开发环境通过 Vite proxy（/api → localhost:3001/api）访问后端，
 * 生产环境直接使用 CHAT_SERVER_URL 常量。
 */

import { CHAT_SERVER_URL } from './constants'
import { lsGet } from './helpers'

/** 判断是否在开发环境（Vite dev server 会代理 /api） */
const IS_DEV = import.meta.env.DEV

/** 获取 API 基础路径 */
function getBaseUrl() {
  if (IS_DEV) return '/api'   // 通过 Vite 代理
  return CHAT_SERVER_URL      // 生产环境直连
}

/** 获取认证 token（如有） */
function getAuthToken() {
  return lsGet('auth_token', '')
}

/** 通用请求函数 */
async function request(method, path, body = null) {
  const url = getBaseUrl() + path
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  const token = getAuthToken()
  if (token) opts.headers['Authorization'] = 'Bearer ' + token
  if (body) opts.body = JSON.stringify(body)
  try {
    const res = await fetch(url, opts)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || '请求失败')
    return data
  } catch (err) {
    console.warn('[chat-api]', method, path, err.message)
    throw err
  }
}

/** 获取对话列表（元数据，不含消息内容） */
export async function fetchChatList() {
  const data = await request('GET', '/chats')
  return data.data || []
}

/** 获取某个对话的完整数据（含消息） */
export async function fetchChat(id) {
  const data = await request('GET', `/chats/${id}`)
  return data.data
}

/** 新建对话 */
export async function createChat(id, title = '当前对话', messages = []) {
  const data = await request('POST', '/chats', { id, title, messages })
  return data.data
}

/** 更新对话（全量写入消息，可携带 version 做乐观锁） */
export async function updateChat(id, title, messages, version = null) {
  const body = { title, messages }
  if (typeof version === 'number') body.version = version
  const data = await request('PUT', `/chats/${id}`, body)
  return data.data
}

/**
 * 增量更新对话
 * @param {string} id - 对话 ID
 * @param {number} version - 客户端当前版本
 * @param {Object} changes - 变更集 { added: [], deleted: [], edited: [], title? }
 */
export async function patchChat(id, version, changes = {}) {
  const body = { version }
  if (changes.title) body.title = changes.title
  if (Array.isArray(changes.added) && changes.added.length) body.added = changes.added
  if (Array.isArray(changes.deleted) && changes.deleted.length) body.deleted = changes.deleted
  if (Array.isArray(changes.edited) && changes.edited.length) body.edited = changes.edited
  const data = await request('PATCH', `/chats/${id}`, body)
  return data.data
}

/** 删除整个对话 */
export async function deleteChat(id) {
  await request('DELETE', `/chats/${id}`)
}

/** 删除某一对消息（根据 sessionId） */
export async function deleteSessionPair(id, sessionId) {
  const data = await request('DELETE', `/chats/${id}/messages/${sessionId}`)
  return data.data
}

/** 读取用户 API 配置（apiKey 已由后端解密，可直接使用） */
export async function fetchSettings() {
  const data = await request('GET', '/settings')
  return data.data || null
}

/**
 * 保存用户 API 配置（apiKey 由后端加密存储）。
 * @param {Object} config - { name, apiType, apiUrl, apiKey, activeModel, models }
 */
export async function saveSettings(config = {}) {
  const body = {
    name: config.name,
    apiType: config.apiType,
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
    activeModel: config.activeModel,
    models: config.models
  }
  const data = await request('PUT', '/settings', body)
  return data.data
}
