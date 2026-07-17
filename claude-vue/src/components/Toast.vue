<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div v-if="store.toastShow" class="toast">
    {{ store.toastText }}
  </div>
</template>

<style scoped>
.toast {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100vw - 48px);
  background: #1A1815;
  color: #F5F3EE;
  font-size: 13px;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  animation: fadeUp 0.25s ease both;
  white-space: normal;
  word-break: break-word;
  text-align: center;
  z-index: 500;
}

@keyframes fadeUp { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
</style>
