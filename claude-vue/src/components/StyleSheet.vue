<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div v-if="store.styleOpen" class="style-sheet">
    <div class="style-backdrop" @click="store.closeStyle"></div>
    <div class="style-panel">
      <div class="style-handle"></div>
      <div class="style-header">
        <button class="style-close" @click="store.closeStyle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#48453E" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
        <span class="style-title">Style</span>
        <button class="style-save" @click="store.saveStyle">保存</button>
      </div>

      <div class="style-options">
        <button
          v-for="(st, i) in store.styleOptions"
          :key="i"
          class="style-option"
          :style="{ borderColor: st.bd, background: st.bg, color: st.fg }"
          @click="st.pick"
        >
          {{ st.name }}
        </button>
      </div>

      <div class="style-editor">
        <div class="style-field">
          <div class="style-field-label">名字</div>
          <input
            :value="store.styleDraft.title"
            @input="store.styleTitleChange($event.target.value)"
            placeholder="比如：精简 / 小说感"
            class="style-input"
          />
        </div>
        <div class="style-field">
          <div class="style-field-label">Style 内容</div>
          <textarea
            :value="store.styleDraft.content"
            @input="store.styleContentChange($event.target.value)"
            placeholder="这里写语气、文风、回复习惯，会随聊天带进 system。"
            rows="7"
            class="style-textarea"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.style-sheet {
  position: absolute;
  inset: 0;
  z-index: 250;
}

.style-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  animation: fadeIn 0.15s ease both;
}

.style-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #F5F3EE;
  border-radius: 16px 16px 0 0;
  padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 30px);
  animation: slideUp 0.25s ease both;
  max-height: 82%;
  overflow-y: auto;
}

.style-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #D1CCC2;
  margin: 0 auto 16px;
}

.style-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.style-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #FFF;
  border: none;
  box-shadow: 0 0 0 1px rgba(43, 38, 30, 0.05), 0 2px 6px rgba(43, 38, 30, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.style-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1815;
}

.style-save {
  border: none;
  background: #1A1815;
  color: #F5F3EE;
  border-radius: 18px;
  padding: 8px 13px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

.style-options {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 0 12px;
}

.style-option {
  flex: none;
  border: 1px solid;
  border-radius: 18px;
  padding: 8px 12px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.style-editor {
  background: #FFF;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #EDE9E0;
}

.style-field {
  padding: 13px 16px;
  border-bottom: 1px solid #ECE8DF;
}

.style-field:last-child {
  border-bottom: none;
}

.style-field-label {
  font-size: 12px;
  color: #B8B3A8;
  margin-bottom: 7px;
}

.style-input,
.style-textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 15px;
  color: #1A1815;
  resize: vertical;
}

.style-input {
  padding: 0;
}

.style-textarea {
  line-height: 1.55;
  min-height: 120px;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
</style>
