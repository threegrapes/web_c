<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="thought-sheet">
    <div class="thought-panel">
      <div class="thought-header">
        <button class="thought-close" @click="store.closeSheet">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#48453E" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
        <div class="thought-title">Thought process</div>
        <div class="thought-spacer"></div>
      </div>
      <div class="thought-body sa">
        <div class="thought-text">{{ store.thoughtText }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thought-sheet {
  position: absolute;
  inset: 0;
  z-index: 260;
}

.thought-panel {
  position: absolute;
  top: 36px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 18px 18px 0 0;
  padding: 0;
  animation: slideUp 0.25s ease both;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
}

.thought-header {
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 12px 0 16px;
  background: linear-gradient(rgba(255, 255, 255, 0.72) 60%, rgba(255, 255, 255, 0));
}

.thought-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #FFF;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
  margin-left: 16px;
}

.thought-title {
  flex: 1;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #1A1815;
  letter-spacing: -0.01em;
  margin-right: 52px;
}

.thought-spacer {
  width: 36px;
  flex: none;
}

.thought-body {
  height: calc(100% - 64px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 24px 44px;
}

.thought-text {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 17px;
  line-height: 1.8;
  color: #1A1815;
  font-weight: 400;
  letter-spacing: -0.01em;
  white-space: pre-wrap;
  word-break: break-word;
}

@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
</style>
