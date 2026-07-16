<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAppStore } from '@/stores/app'
import SparkBadge from './SparkBadge.vue'

const props = defineProps({
  message: { type: Object, required: true },
  showBadge: { type: Boolean, default: false }
})

const store = useAppStore()

const renderedBody = computed(() => {
  if (props.message.isAi) {
    const raw = String(props.message.text || '').trim()
    if (!raw) return ''
    const dirty = marked.parse(raw, { async: false, gfm: true, breaks: true })
    return DOMPurify.sanitize(dirty)
  }
  return String(props.message.text || '').replace(/\n/g, '<br>')
})
</script>

<template>
  <div
    class="message-wrapper"
    :style="{ marginBottom: message.gap, alignItems: message.align }"
  >
    <div class="message-bubble" :style="{ maxWidth: message.maxW, width: message.fullW, background: message.bg, color: message.color, borderRadius: message.radius, padding: message.pad }">
      <!-- thinking placeholder -->
      <div v-if="message.isThinking" class="thinking-row">
        <div class="thinking-icon-wrap">
          <div class="thinking-glow"></div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="thinking-pulse">
            <circle cx="12" cy="12" r="8.5" stroke="#6B665E" stroke-width="1.4" />
            <path d="M12 8v4l2.5 1.5" stroke="#6B665E" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span class="thinking-label">Thinking...</span>
      </div>

      <!-- thinking completed -->
      <div v-if="message.hasThink" class="think-row">
        <button class="think-btn" @click="message.openThink">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="think-icon">
            <circle cx="12" cy="12" r="8.5" stroke="#9A958B" stroke-width="1.4" />
            <path d="M12 8v4l2.5 1.5" stroke="#9A958B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="think-summary">{{ message.thinkSummary }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="think-arrow">
            <path d="M9 6l6 6-6 6" stroke="#B8B3A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- memory recall -->
      <div v-if="message.hasMemory" class="memory-row">
        <button class="memory-toggle" @click="store.toggleMemory">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M9 4.5a4 4 0 0 0-4 4v.3A3 3 0 0 0 5.6 14 3.3 3.3 0 0 0 9 18.5M15 4.5a4 4 0 0 1 4 4v.3A3 3 0 0 1 18.4 14 3.3 3.3 0 0 1 15 18.5M12 4.2v14.5" stroke="#B8B3A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Recalled memories</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :style="{ transform: store.memRot, transition: 'transform .2s' }">
            <path d="M6 9l6 6 6-6" stroke="#B8B3A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div v-if="store.memoryOpen" class="memory-list">
          <div v-for="(mem, i) in message.memoryList" :key="i" class="memory-card">
            <span class="memory-text">{{ mem.text }}</span>
            <span class="memory-tag">{{ mem.tag }}</span>
          </div>
        </div>
      </div>

      <!-- normal message body -->
      <div v-if="message.showNormal" :class="['msg-body', { 'ai-msg-text': message.isAi }]" v-html="renderedBody"></div>

      <!-- edit mode -->
      <div v-if="message.showEdit" class="edit-wrap">
        <textarea
          :value="store.editText"
          @input="store.editTextChange($event.target.value)"
          rows="3"
          class="edit-textarea"
        />
        <div class="edit-actions">
          <button class="btn-cancel" @click="store.cancelEdit">取消</button>
          <button class="btn-send" @click="store.saveEdit">发送</button>
        </div>
      </div>
    </div>

    <!-- user actions -->
    <div v-if="message.showUserActions" class="user-actions">
      <button class="icon-btn" @click="message.edit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- AI actions -->
    <div v-if="message.showActions" class="ai-actions">
      <button class="icon-btn" @click="message.copy">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="#48453E" stroke-width="1.5" />
          <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="#48453E" stroke-width="1.5" />
        </svg>
      </button>
      <button class="icon-btn" @click="message.refresh">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 12a9 9 0 0 1 15.5-6.2M21 5v4h-4M21 12a9 9 0 0 1-15.5 6.2M3 19v-4h4" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="variant-nav">
        <button class="icon-btn" @click="message.prev">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M14 6l-6 6 6 6" stroke="#B8B3A8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="variant-text">{{ message.variantText }}</span>
        <button class="icon-btn" @click="message.next">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M10 6l6 6-6 6" stroke="#B8B3A8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
    <!-- AI icon badge -->
    <div v-if="showBadge" class="badge-wrap">
      <SparkBadge />
    </div>
  </div>
</template>

<style scoped>
.badge-wrap {
  margin-top: 24px;
  display: flex;
  justify-content: flex-start;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  animation: fadeUp 0.35s ease both;
}


.message-bubble {
  font-size: 16px;
  line-height: 1.75;
  letter-spacing: -0.008em;
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-body {
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-body.ai-msg-text {
  white-space: normal;
}

.thinking-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 14px;
}

.thinking-icon-wrap {
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thinking-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #C4BFB5;
  animation: thinkGlow 2s ease-in-out infinite;
}

.thinking-pulse {
  position: relative;
  animation: thinkPulse 1.2s ease-in-out infinite;
}

.thinking-label {
  font-size: 14px;
  color: #9A958B;
  animation: dots 2s ease-in-out infinite;
}

.think-row {
  margin-bottom: 14px;
}

.think-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: none;
  background: transparent;
  padding: 4px 0;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.think-icon { flex: none; opacity: 0.55; }
.think-summary {
  flex: 1;
  font-size: 13.5px;
  color: #9A958B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.think-arrow { flex: none; opacity: 0.45; }

.memory-row {
  margin-bottom: 14px;
}

.memory-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: #8A857B;
  white-space: nowrap;
}

.memory-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.memory-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #FFF;
  border: 1px solid #EDE9E0;
  box-shadow: 0 1px 2px rgba(43, 38, 30, 0.035), 0 10px 30px -10px rgba(43, 38, 30, 0.07);
  border-radius: 12px;
  padding: 10px 13px;
}

.memory-text {
  font-size: 13px;
  color: #6B665E;
  line-height: 1.4;
}

.memory-tag {
  flex: none;
  font-size: 11px;
  font-weight: 500;
  color: #9A958B;
  background: #F2EFE8;
  border-radius: 6px;
  padding: 3px 8px;
}

.edit-wrap {
  background: #ECEAE4;
  border-radius: 22px;
  padding: 12px 16px;
}

.edit-textarea {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  outline: none;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.6;
  color: #2B2620;
  min-height: 60px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.btn-cancel {
  padding: 7px 16px;
  border: 1px solid #DDD8CE;
  background: #FFF;
  border-radius: 16px;
  font-size: 13px;
  font-family: inherit;
  color: #6B665E;
  cursor: pointer;
}

.btn-send {
  padding: 7px 16px;
  border: none;
  background: #1A1815;
  border-radius: 16px;
  font-size: 13px;
  font-family: inherit;
  color: #F5F3EE;
  cursor: pointer;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
  opacity: 0.45;
}

.ai-actions {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 10px;
  opacity: 0.62;
}

.variant-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-size: 12px;
  color: #B8B3A8;
}

.variant-text {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.icon-btn {
  width: 25px;
  height: 25px;
  border: none;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes dots { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
@keyframes thinkPulse { 0%, 100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.15); opacity: .85; } }
@keyframes thinkGlow { 0%, 100% { opacity: 0; } 50% { opacity: .12; } }
</style>
