<script setup>
/**
 * 通用确认弹窗组件。
 * 通过 store.confirmDialog 状态驱动：{ show, title, message, confirmText, onConfirm }
 */
import { useAppStore } from '@/stores/app'

const store = useAppStore()

function onConfirm() {
  const cb = store.confirmDialog?.onConfirm
  store.closeConfirmDialog()
  if (typeof cb === 'function') cb()
}

function onCancel() {
  const cb = store.confirmDialog?.onCancel
  store.closeConfirmDialog()
  if (typeof cb === 'function') cb()
}
</script>

<template>
  <div v-if="store.confirmDialog?.show" class="confirm-overlay">
    <div class="confirm-backdrop" @click="onCancel"></div>
    <div class="confirm-card">
      <div v-if="store.confirmDialog.title" class="confirm-title">{{ store.confirmDialog.title }}</div>
      <div class="confirm-message">{{ store.confirmDialog.message || '确定要执行此操作吗？' }}</div>
      <div class="confirm-actions">
        <button class="btn-cancel" @click="onCancel">取消</button>
        <button class="btn-confirm" @click="onConfirm">{{ store.confirmDialog.confirmText || '确定' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: absolute;
  inset: 0;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.15s ease both;
}

.confirm-card {
  position: relative;
  width: 85%;
  max-width: 320px;
  background: #FFF;
  border-radius: 20px;
  padding: 28px 24px 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: fadeUp 0.2s ease both;
}

.confirm-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1815;
  margin-bottom: 8px;
}

.confirm-message {
  font-size: 14px;
  color: #6B665E;
  line-height: 1.6;
  margin-bottom: 20px;
}

.confirm-actions {
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
  background: #C94E4E;
  color: #FFF;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
