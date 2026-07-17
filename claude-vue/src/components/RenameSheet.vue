<script setup>
/**
 * 重命名弹窗组件，替代 window.prompt。
 * 通过 store.renameSheet 状态驱动：{ show, title, value }
 */
import { ref, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const inputRef = ref(null)

watch(() => store.renameSheet?.show, (show) => {
  if (show) {
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.value = store.renameSheet.value || ''
        inputRef.value.focus()
        inputRef.value.select()
      }
    })
  }
})

function onConfirm() {
  const val = inputRef.value?.value?.trim()
  const cb = store.renameSheet?.onConfirm
  store.closeRenameSheet()
  if (typeof cb === 'function') cb(val || '')
}

function onCancel() {
  const cb = store.renameSheet?.onCancel
  store.closeRenameSheet()
  if (typeof cb === 'function') cb()
}
</script>

<template>
  <div v-if="store.renameSheet?.show" class="rename-overlay">
    <div class="rename-backdrop" @click="onCancel"></div>
    <div class="rename-card">
      <div class="rename-title">{{ store.renameSheet.title || '重命名' }}</div>
      <input
        ref="inputRef"
        type="text"
        class="rename-input"
        :placeholder="store.renameSheet.placeholder || '请输入名称'"
        @keydown.enter="onConfirm"
        @keydown.escape="onCancel"
      />
      <div class="rename-actions">
        <button class="btn-cancel" @click="onCancel">取消</button>
        <button class="btn-confirm" @click="onConfirm">确定</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rename-overlay {
  position: absolute;
  inset: 0;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rename-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.15s ease both;
}

.rename-card {
  position: relative;
  width: 85%;
  max-width: 340px;
  background: #FFF;
  border-radius: 20px;
  padding: 28px 24px 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: fadeUp 0.2s ease both;
}

.rename-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1815;
  margin-bottom: 16px;
}

.rename-input {
  display: block;
  width: 100%;
  border: 1px solid #E7E3DA;
  background: #F5F3EE;
  border-radius: 14px;
  padding: 13px 16px;
  font-size: 16px;
  font-family: inherit;
  color: #2B2620;
  outline: none;
  margin-bottom: 16px;
}

.rename-input:focus {
  border-color: #1A1815;
}

.rename-actions {
  display: flex;
  gap: 10px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}

.btn-cancel {
  border: 1px solid #E7E3DA;
  background: #FFF;
  color: #6B665E;
}

.btn-confirm {
  border: none;
  background: #1A1815;
  color: #F5F3EE;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
