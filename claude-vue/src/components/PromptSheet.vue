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
          <span class="sheet-title">Prompt templates</span>
          <span class="sheet-spacer"></span>
        </div>

        <div class="list-card">
          <div v-for="(p, i) in store.promptOptions" :key="i" class="list-item">
            <div class="list-item-main" @click="p.pick">
              <div>
                <div class="list-item-title">{{ p.name }}</div>
                <div class="list-item-preview">{{ p.preview }}</div>
              </div>
            </div>
            <button class="list-item-remove" @click="p.remove">×</button>
          </div>
        </div>

        <div class="form-card">
          <div class="form-label">添加新模板</div>
          <input
            :value="store.promptDraftName"
            @input="store.promptDraftNameChange($event.target.value)"
            placeholder="模板名称"
            class="form-input"
          />
          <input
            :value="store.promptDraftText"
            @input="store.promptDraftTextChange($event.target.value)"
            placeholder="模板内容（点击后会填入输入框）"
            class="form-input"
          />
          <button class="form-add" @click="store.addPromptTemplate">添加</button>
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
  padding: 12px 0 calc(env(safe-area-inset-bottom, 0px) + 26px);
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

.sheet-spacer {
  width: 36px;
}

.list-card, .form-card {
  background: #FFF;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #EDE9E0;
  margin-bottom: 12px;
}

.list-item {
  padding: 15px 18px;
  border-bottom: 1px solid #ECE8DF;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item-main {
  cursor: pointer;
  flex: 1;
}

.list-item-title {
  font-size: 15px;
  color: #1A1815;
}

.list-item-preview {
  font-size: 12px;
  color: #B8B3A8;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-remove {
  width: 36px;
  height: 36px;
  border: 1px solid #E7E3DA;
  background: #FFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: #9A958B;
  padding: 0;
  flex: none;
}

.form-card {
  padding: 13px 16px;
}

.form-label {
  font-size: 12px;
  color: #B8B3A8;
  margin-bottom: 7px;
}

.form-input {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 16px;
  color: #1A1815;
  margin-bottom: 8px;
}

.form-add {
  margin-top: 10px;
  border: none;
  background: #1A1815;
  color: #F5F3EE;
  border-radius: 14px;
  padding: 9px 14px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
</style>
