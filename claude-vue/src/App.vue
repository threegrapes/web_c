<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import ChatView from '@/components/ChatView.vue'
import HomeView from '@/components/HomeView.vue'
import MoreView from '@/components/MoreView.vue'
import SubPage from '@/components/SubPage.vue'
import Drawer from '@/components/Drawer.vue'
import ProfileSheet from '@/components/ProfileSheet.vue'
import StyleSheet from '@/components/StyleSheet.vue'
import PlusSheet from '@/components/PlusSheet.vue'
import ApiSheet from '@/components/ApiSheet.vue'
import PersonaSheet from '@/components/PersonaSheet.vue'
import PromptSheet from '@/components/PromptSheet.vue'
import WorldbookSheet from '@/components/WorldbookSheet.vue'
import ThoughtSheet from '@/components/ThoughtSheet.vue'
import Toast from '@/components/Toast.vue'
import DemoCodeModal from '@/components/DemoCodeModal.vue'

const store = useAppStore()

onMounted(async () => {
  await store.init()
})
</script>

<template>
  <div class="app-shell">
    <div class="app-content">
      <ChatView v-if="store.isChat" />
      <HomeView v-else-if="store.isHome" />
      <MoreView v-else-if="store.isMore" />
      <SubPage v-if="store.showSub" />
    </div>

    <Drawer />
    <ProfileSheet />
    <StyleSheet />
    <PlusSheet />

    <ApiSheet v-if="store.isApiSheet" />
    <PersonaSheet v-else-if="store.isAiSheet" />
    <PromptSheet v-else-if="store.isPromptSheet" />
    <WorldbookSheet v-else-if="store.isWorldbookSheet" />
    <ThoughtSheet v-else-if="store.isThoughtSheet" />

    <DemoCodeModal />
    <Toast />
  </div>
</template>

<style>
/* 全局基础样式：与原 <helmet> 中的全局样式等价 */
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  background: #d6d2c8;
}

.app-shell {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #F5F3EE;
  color: #1A1815;
  font-family: -apple-system, 'Noto Sans SC', 'Helvetica Neue', sans-serif;
  overflow: hidden;
  letter-spacing: -0.01em;
}

.app-content {
  flex: 1;
  min-height: 0;
  position: relative;
}

.sa::-webkit-scrollbar { width: 0; display: none; }
.sa { scrollbar-width: none; -webkit-overflow-scrolling: touch; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes dots { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
@keyframes thinkPulse { 0%, 100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.15); opacity: .85; } }
@keyframes thinkGlow { 0%, 100% { opacity: 0; } 50% { opacity: .12; } }
@keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: none; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }

.recent-chat-item { position: relative; }
.chat-menu-btn {
  opacity: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .15s;
}
@media (hover: hover) {
  .recent-chat-item:hover .chat-menu-btn { opacity: 1; }
}
@media (hover: none) {
  .chat-menu-btn { display: none; }
}

.welcome-web { display: flex; align-items: center; justify-content: center; gap: .6em; padding: 120px 24px 80px; min-height: 100%; }
.welcome-mobile { display: none; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 100px 24px 60px; min-height: 100%; }

@media (max-width: 768px) {
  .welcome-web { display: none !important; }
  .welcome-mobile { display: flex !important; }
}

.ai-msg-text pre { background: #2B2620; color: #E7E3DA; border-radius: 10px; padding: 14px 16px; margin: 12px 0; overflow-x: auto; font-size: 14px; line-height: 1.6; }
.ai-msg-text code { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: .9em; }
.ai-msg-text :not(pre) > code { background: #EDEAE3; color: #B33D3D; padding: 2px 6px; border-radius: 5px; font-size: .88em; word-break: break-word; }
.ai-msg-text table { border-collapse: collapse; margin: 12px 0; width: auto; max-width: 100%; display: block; overflow-x: auto; }
.ai-msg-text th, .ai-msg-text td { border: 1px solid #D6D2C8; padding: 8px 14px; text-align: left; font-size: 15px; }
.ai-msg-text th { background: #EDEAE3; font-weight: 600; }
.ai-msg-text blockquote { border-left: 4px solid #C9A86C; margin: 10px 0; padding: 8px 16px; color: #6B665E; }
.ai-msg-text ul, .ai-msg-text ol { padding-left: 24px; margin: 8px 0; }
.ai-msg-text li { margin: 4px 0; }
.ai-msg-text p { margin: 8px 0; }
.ai-msg-text h1, .ai-msg-text h2, .ai-msg-text h3, .ai-msg-text h4 { margin: 18px 0 10px; font-weight: 700; line-height: 1.35; }
.ai-msg-text a { color: #B33D3D; text-decoration: underline; }
.ai-msg-text img { max-width: 100%; border-radius: 8px; }
.ai-msg-text hr { border: none; border-top: 1px solid #E7E3DA; margin: 16px 0; }

.spark-badge { display: block; }
.spark-anim-waiting { animation: thinkPulse 1.2s ease-in-out infinite; }
.spark-anim-writing { animation: thinkPulse 0.8s ease-in-out infinite; }
</style>
