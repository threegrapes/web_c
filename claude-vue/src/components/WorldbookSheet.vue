<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="sheet-overlay">
    <div class="sheet-backdrop" @click="store.closeSheet"></div>
    <div class="sheet-panel">
      <div class="sheet-handle"></div>
      <div class="sheet-scroll sa">
        <div class="sheet-header">
          <button class="sheet-close" @click="store.closeSheet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#48453E" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
          <span class="sheet-title">Worldbook</span>
          <button class="sheet-save" @click="store.saveWorldbook">保存</button>
        </div>

        <div class="worldbook-editor">
          <div class="worldbook-field">
            <div class="worldbook-label">常驻worldbook</div>
            <textarea
              :value="store.wbDraft.permanent"
              @input="store.wbPermanentChange($event.target.value)"
              placeholder="会一直带进 system 的设定、关系、禁忌、世界规则……"
              rows="7"
              class="worldbook-textarea"
            />
          </div>
          <div class="worldbook-field">
            <div class="worldbook-label">触发条目</div>
            <textarea
              :value="store.wbDraft.triggersText"
              @input="store.wbTriggersChange($event.target.value)"
              placeholder="每行一个：关键词 => 触发后插入的内容"
              rows="6"
              class="worldbook-textarea"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet-overlay {
  position: absolute;
  inset: 0;
  z-index: 260;
}

.sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  animation: fadeIn 0.15s ease both;
}

.sheet-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background: #F5F3EE;
  border-radius: 16px 16px 0 0;
  padding: 12px 0 26px;
  animation: slideUp 0.25s ease both;
}

.sheet-handle {
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: #CFCAC1;
  margin: 0 auto 14px;
}

.sheet-scroll {
  max-height: calc(82vh - 40px);
  overflow-y: auto;
  padding: 0 16px 8px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 14px;
}

.sheet-close {
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

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1815;
}

.sheet-save {
  border: none;
  background: #1A1815;
  color: #F5F3EE;
  border-radius: 18px;
  padding: 8px 13px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

.worldbook-editor {
  background: #FFF;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #EDE9E0;
}

.worldbook-field {
  padding: 13px 16px;
  border-bottom: 1px solid #ECE8DF;
}

.worldbook-field:last-child {
  border-bottom: none;
}

.worldbook-label {
  font-size: 12px;
  color: #B8B3A8;
  margin-bottom: 7px;
}

.worldbook-textarea {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  outline: none;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.55;
  color: #1A1815;
  min-height: 120px;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
</style>
