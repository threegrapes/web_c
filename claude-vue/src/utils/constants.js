/**
 * 应用级常量。集中管理 localStorage key 与默认值，便于维护与避免拼写错误。
 */

export const LS_API_URL = 'api_url'
export const LS_API_KEY = 'api_key'
export const LS_API_NAME = 'api_name'
export const LS_API_TYPE = 'api_type'
export const LS_ACTIVE_MODEL = 'active_model'
export const LS_MY_MODELS = 'my_models'
export const LS_MESSAGES = 'chat_messages'
export const LS_STYLE_TITLE = 'style_title'
export const LS_STYLE_CONTENT = 'style_content'
export const LS_WB_PERM = 'wb_permanent'
export const LS_WB_TRIGGERS = 'wb_triggers'
export const LS_PROMPTS = 'prompt_templates'
export const LS_PERSONAS = 'personas'
export const LS_ACTIVE_PERSONA = 'active_persona'
export const LS_RECENTS = 'recent_chats'
export const LS_CURRENT_CHAT_ID = 'current_chat_id'

export const MAX_MESSAGES = 200
export const DEMO_THOUGHT = 'This is a placeholder for the Thought process panel.\n\nReplace this area with your own explanation text if needed.'

export const DEFAULT_STYLE = { title: 'Soft neutral', content: 'Warm companion UI.' }
export const DEFAULT_PROMPTS = [
  { name: 'Gentle reply', text: '请温柔地回复我' },
  { name: 'Long note', text: '请写一段长文' }
]
export const DEFAULT_PERSONAS = [
  { name: 'Companion persona', text: '你是一个温柔的伴侣AI，善解人意，说话温和' },
  { name: 'Soft assistant', text: '你是一个高效的助手，简洁专业地回答问题' }
]

export const TABS = {
  CHAT: 'chat',
  HOME: 'home',
  MORE: 'more'
}

export const SUBS = {
  MOMENTS: 'moments',
  DIARY: 'diary',
  MOOD: 'mood',
  ANNIVERSARY: 'anniversary'
}

export const SHEETS = {
  API: 'api',
  AI: 'ai',
  PROMPT: 'prompt',
  WORLDBOOK: 'worldbook',
  THOUGHT: 'thought'
}

export const SUB_TITLES = {
  [SUBS.MOMENTS]: 'Moments',
  [SUBS.DIARY]: 'Diary / Letters',
  [SUBS.MOOD]: 'Mood',
  [SUBS.ANNIVERSARY]: 'Anniversaries'
}

export const API_TYPES = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic'
}

export const MOBILE_GREETING_NAME = '亦潇'
