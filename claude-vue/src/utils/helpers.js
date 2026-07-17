/**
 * localStorage 读写工具，带 try/catch 与对象自动 JSON 序列化。
 */

export function lsGet(k, fallback = '') {
  try {
    const v = localStorage.getItem(k)
    return v !== null ? v : fallback
  } catch {
    return fallback
  }
}

export function lsGetObj(k, fallback) {
  try {
    const v = localStorage.getItem(k)
    if (v === null) return fallback
    return JSON.parse(v)
  } catch {
    return fallback
  }
}

export function lsSet(k, v) {
  try {
    localStorage.setItem(k, typeof v === 'object' ? JSON.stringify(v) : v)
  } catch (e) {
    console.warn('localStorage 写入失败，可能已满:', e)
  }
}

export function trimMessages(msgs, max = 200) {
  if (!msgs || msgs.length <= max) return msgs
  return msgs.slice(msgs.length - max)
}

export function generateChatTitle(messages) {
  const firstUser = messages.find(m => m.role === 'user' || m.align === 'flex-end')
  if (firstUser && firstUser.text) {
    const t = String(firstUser.text).trim()
    if (t) return t.length > 20 ? t.slice(0, 20) + '...' : t
  }
  return '当前对话'
}

export function getMobileGreeting() {
  const hour = new Date().getHours()
  let time = 'Good Evening'
  if (hour >= 5 && hour < 12) time = 'Good Morning'
  else if (hour >= 12 && hour < 18) time = 'Good Afternoon'
  return `${time}, 亦潇`
}

export function buildUserMessage(text, attachedImages = [], sessionId = '') {
  const hasImages = attachedImages.length > 0
  const displayText = hasImages ? (text || '[图片]') : text
  return {
    align: 'flex-end',
    maxW: '82%',
    fullW: 'auto',
    bg: '#ECEAE4',
    color: '#2B2620',
    radius: '22px',
    pad: '12px 18px',
    showActions: false,
    showUserActions: true,
    showNormal: true,
    showEdit: false,
    gap: '32px',
    hasMemory: false,
    hasThink: false,
    text: displayText,
    role: 'user',
    sessionId,
    hasImages,
    imageCount: attachedImages.length
  }
}

export function buildAiMessage(text, opts = {}) {
  return {
    align: 'flex-start',
    maxW: '100%',
    fullW: 'auto',
    bg: 'transparent',
    color: '#2B2620',
    radius: '0',
    pad: '0 2px',
    showActions: true,
    showUserActions: false,
    showNormal: true,
    showEdit: false,
    gap: '32px',
    hasMemory: false,
    hasThink: false,
    variantText: '1 / 1',
    text,
    role: 'assistant',
    isAi: true,
    sessionId: opts.sessionId || '',
    ...opts
  }
}

export function buildThinkingPlaceholder() {
  return {
    align: 'flex-start',
    maxW: '100%',
    fullW: 'auto',
    bg: 'transparent',
    color: '#2B2620',
    radius: '0',
    pad: '0 2px',
    showActions: false,
    showUserActions: false,
    showNormal: false,
    showEdit: false,
    gap: '32px',
    hasMemory: false,
    hasThink: false,
    isThinking: true,
    role: 'thinking',
    text: ''
  }
}

export function noop() {}

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}
