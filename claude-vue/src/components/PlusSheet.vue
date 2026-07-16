<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div v-if="store.plusOpen" class="plus-sheet">
    <div class="plus-backdrop" @click="store.togglePlus"></div>
    <div class="plus-panel">
      <div class="plus-handle"></div>
      <div class="plus-header">
        <button class="plus-close" @click="store.togglePlus">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#48453E" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
        <span class="plus-title">Add to chat</span>
        <span class="plus-prompts" @click="store.openPromptSheet">Prompts</span>
      </div>

      <div class="plus-card">
        <div class="plus-item" @click="store.openPromptSheet">
          <div class="plus-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3c-4.97 0-9 3.58-9 8 0 1.5.5 2.9 1.3 4.1L3 21l5.5-1.5C10 20.2 11 20.5 12 20.5c4.97 0 9-3.58 9-8s-4.03-8-9-8Z" stroke="#48453E" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M9 11h.01M12 11h.01M15 11h.01" stroke="#48453E" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="plus-item-title">Prompt template</span>
          </div>
          <div class="plus-item-right">
            <span class="plus-item-hint">{{ store.promptCount }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div class="divider"></div>
        <div class="plus-item" @click="store.openApiSheet">
          <div class="plus-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#48453E" stroke-width="1.5" />
              <path d="M12 8v8M8 12h8" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span class="plus-item-title">Switch model</span>
          </div>
          <div class="plus-item-right">
            <span class="plus-item-hint">{{ store.activeModel }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div class="divider"></div>
        <div class="plus-item" @click="store.openAiSheet">
          <div class="plus-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="8" width="18" height="12" rx="2" stroke="#48453E" stroke-width="1.5" />
              <path d="M8 8V5a4 4 0 0 1 8 0v3" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span class="plus-item-title">Persona</span>
          </div>
          <div class="plus-item-right">
            <span class="plus-item-hint">{{ store.activeCompanion }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div class="divider"></div>
        <div class="plus-item" @click="store.openWorldbookSheet">
          <div class="plus-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" stroke="#48453E" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M9 4v6l2-1.3L13 10V4" stroke="#48453E" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
            <span class="plus-item-title">Worldbook</span>
          </div>
          <div class="plus-item-right">
            <span class="plus-item-hint">{{ store.wbHint }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div class="divider"></div>
        <div class="plus-item" @click="store.openStyle">
          <div class="plus-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5l-4.9 2.7.9-5.5-4-3.9 5.5-.8L12 3Z" stroke="#48453E" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
            <span class="plus-item-title">Style</span>
          </div>
          <div class="plus-item-right">
            <span class="plus-item-hint">{{ store.activeStyle }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div class="divider"></div>
        <div class="plus-item" @click="store.triggerImageSelect">
          <div class="plus-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#48453E" stroke-width="1.5" />
              <circle cx="8.5" cy="8.5" r="1.8" fill="#48453E" />
              <path d="M21 15l-5-5L5 21" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="plus-item-title">Image / 图片</span>
          </div>
          <div class="plus-item-right">
            <span class="plus-item-hint">{{ store.attachedImageHint }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plus-sheet {
  position: absolute;
  inset: 0;
  z-index: 200;
}

.plus-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  animation: fadeIn 0.15s ease both;
}

.plus-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #EDEAE3;
  border-radius: 16px 16px 0 0;
  padding: 12px 0 30px;
  animation: slideUp 0.25s ease both;
}

.plus-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #D1CCC2;
  margin: 0 auto 14px;
}

.plus-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 16px;
}

.plus-close {
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

.plus-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1815;
}

.plus-prompts {
  font-size: 14px;
  color: #9A958B;
  cursor: pointer;
}

.plus-card {
  margin: 0 16px;
  background: #FFF;
  border-radius: 16px;
  overflow: hidden;
}

.plus-item {
  padding: 15px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.plus-item-left {
  display: flex;
  align-items: center;
  gap: 13px;
}

.plus-item-title {
  font-size: 15px;
  font-weight: 500;
  color: #1A1815;
}

.plus-item-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.plus-item-hint {
  font-size: 14px;
  color: #9A958B;
}

.divider {
  height: 1px;
  background: #ECE8DF;
  margin: 0 18px;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
</style>
