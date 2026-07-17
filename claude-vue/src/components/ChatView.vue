<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import Welcome from './Welcome.vue'
import MessageItem from './MessageItem.vue'
import ChatInput from './ChatInput.vue'

const store = useAppStore()
const scrollRef = ref(null)
const showBackBtn = ref(false)
const userScrolledUp = ref(false)

const lastAiIndex = computed(() => {
  const msgs = store.displayMessages
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].isAi) return i
  }
  return -1
})

const isAtBottom = () => {
  const el = scrollRef.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 50
}

const handleScroll = () => {
  const atBottom = isAtBottom()
  userScrolledUp.value = !atBottom
  showBackBtn.value = !atBottom
}

const scrollToBottom = () => {
  nextTick(() => {
    if (userScrolledUp.value) return
    const el = scrollRef.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
  })
}

const goBackToBottom = () => {
  const el = scrollRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  userScrolledUp.value = false
  showBackBtn.value = false
}

onMounted(() => {
  scrollToBottom()
  scrollRef.value?.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => {
  scrollRef.value?.removeEventListener('scroll', handleScroll)
})
watch(() => store.messages, scrollToBottom, { deep: true })
</script>

<template>
  <div class="chat-view">
    <!-- header -->
    <div class="chat-header">
      <div class="header-left">
        <button class="header-btn" @click="store.toggleDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h12M4 17h16" stroke="#48453E" stroke-width="1.7" stroke-linecap="round" />
          </svg>
        </button>
        <button class="header-btn-pill" @click="store.openStyle">
          <img src="/uploads/feather.svg" width="22" height="20" class="header-feather" alt="" />
          <span class="header-style-text">{{ store.activeStyle }}</span>
        </button>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="store.newChat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#48453E" stroke-width="1.7" stroke-linecap="round" />
          </svg>
        </button>
        <button class="header-btn" @click="store.togglePlus">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="1.5" fill="#48453E" />
            <circle cx="12" cy="12" r="1.5" fill="#48453E" />
            <circle cx="12" cy="18" r="1.5" fill="#48453E" />
          </svg>
        </button>
      </div>
    </div>

    <!-- messages area -->
    <div class="messages-area">
      <div class="scroll-fade scroll-fade-top"></div>
      <div class="scroll-fade scroll-fade-bottom"></div>
      <div ref="scrollRef" class="messages-scroll sa">
        <Welcome v-if="store.showWelcome" />

        <div v-if="!store.showWelcome" class="empty-watermark">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" class="watermark-icon">
            <path d="M32 4 L34.5 26 L56 16 L38 28.5 L60 32 L38 35.5 L56 48 L34.5 38 L32 60 L29.5 38 L8 48 L26 35.5 L4 32 L26 28.5 L8 16 L29.5 26 Z" fill="#1A1815" />
            <circle cx="32" cy="32" r="5" fill="#1A1815" />
          </svg>
        </div>

        <MessageItem
          v-for="(m, i) in store.displayMessages"
          :key="m.sessionId || i"
          :message="m"
          :show-badge="i === lastAiIndex"
        />
      </div>
      <button v-if="showBackBtn" class="back-to-bottom" @click="goBackToBottom">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        回到最新消息
      </button>
    </div>

    <ChatInput />
  </div>
</template>

<style scoped>
.chat-view {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  flex: none;
  padding: 18px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 9px;
}

.header-left {
  min-width: 0;
}

.header-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFF;
  border: none;
  box-shadow: 0 0 0 1px rgba(43, 38, 30, 0.05), 0 2px 6px rgba(43, 38, 30, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.header-btn-pill {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #FFF;
  border: none;
  border-radius: 20px;
  padding: 0 14px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 0 0 1px rgba(43, 38, 30, 0.05), 0 2px 6px rgba(43, 38, 30, 0.05);
  min-width: 0;
  max-width: 150px;
}

.header-feather {
  flex: none;
  display: block;
}

.header-style-text {
  font-size: 13.5px;
  font-weight: 600;
  color: #3A362F;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messages-area {
  flex: 1;
  min-height: 0;
  position: relative;
}

.scroll-fade {
  position: absolute;
  left: 0;
  right: 0;
  height: 24px;
  z-index: 5;
  pointer-events: none;
}

.scroll-fade-top {
  top: 0;
  background: linear-gradient(#F5F3EE, rgba(245, 243, 238, 0));
}

.scroll-fade-bottom {
  bottom: 0;
  height: 20px;
  background: linear-gradient(rgba(245, 243, 238, 0), #F5F3EE);
}

.messages-scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 10px 20px 10px;
}

.empty-watermark {
  position: sticky;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
}

.watermark-icon {
  opacity: 0.08;
}

.badge-wrap {
  margin-top: 24px;
  display: flex;
  justify-content: flex-start;
}

.back-to-bottom {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  background: #FFF;
  color: #48453E;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 0 0 1px rgba(43, 38, 30, 0.08), 0 4px 12px rgba(43, 38, 30, 0.12);
  z-index: 10;
  transition: opacity 0.2s;
}
</style>
