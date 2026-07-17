<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div v-if="store.showDemoCodeInput" class="demo-modal">
    <div class="demo-backdrop" @click="store.cancelToken"></div>
    <div class="demo-card">
      <div class="demo-title">Demo access placeholder</div>
      <input
        :value="store.demoCodeDraft"
        @input="store.demoCodeDraftChange($event.target.value)"
        placeholder="Demo code"
        class="demo-input"
      />
      <div class="demo-actions">
        <button class="demo-btn-cancel" @click="store.cancelToken">取消</button>
        <button class="demo-btn-confirm" @click="store.confirmToken" @touchend="store.confirmTokenTouch">确定</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-modal {
  position: absolute;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.15s ease both;
}

.demo-card {
  position: relative;
  width: 85%;
  max-width: 340px;
  background: #FFF;
  border-radius: 20px;
  padding: 28px 24px 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: fadeUp 0.2s ease both;
}

.demo-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1815;
  margin-bottom: 16px;
  text-align: center;
}

.demo-input {
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

.demo-actions {
  display: flex;
  gap: 10px;
}

.demo-btn-cancel, .demo-btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}

.demo-btn-cancel {
  border: 1px solid #E7E3DA;
  background: #FFF;
  color: #6B665E;
}

.demo-btn-confirm {
  border: none;
  background: #1A1815;
  color: #F5F3EE;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
