/**
 * marked 实例，预配置代码高亮。
 * 在模块级别创建一次，所有组件共享同一个实例，避免每条消息重复初始化。
 */
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/common'

export const markedInstance = marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try { return hljs.highlight(code, { language: lang }).value } catch {}
    }
    try { return hljs.highlightAuto(code).value } catch {}
    return code
  }
}))
