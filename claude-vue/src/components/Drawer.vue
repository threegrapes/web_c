<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div v-if="store.drawerOpen" class="drawer-overlay">
    <div class="drawer-backdrop" @click="store.toggleDrawer"></div>
    <div class="drawer-panel">
      <!-- drawer header -->
      <div class="drawer-header">
        <div class="drawer-title">Companion</div>
        <div class="drawer-avatar" @click="store.toggleProfile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="10" r="3" stroke="#9A958B" stroke-width="1.5" />
            <path d="M5.6 19.5A7 7 0 0 1 12 16a7 7 0 0 1 6.4 3.5" stroke="#9A958B" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <!-- nav items -->
      <div class="drawer-nav">
        <div class="drawer-nav-item" :class="{ active: store.tab === 'chat' }" @click="store.navChat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="#48453E" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
          <span>Chat</span>
        </div>
        <div class="drawer-nav-item" :class="{ active: store.tab === 'home' }" @click="store.navHome">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 11l8-6.5L20 11M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Home</span>
        </div>
        <div class="drawer-nav-item" :class="{ active: store.tab === 'more' }" @click="store.navMore">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="5" cy="6" r="1.5" fill="#48453E" />
            <circle cx="5" cy="12" r="1.5" fill="#48453E" />
            <circle cx="5" cy="18" r="1.5" fill="#48453E" />
            <path d="M10.5 6h9M10.5 12h9M10.5 18h9" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span>More</span>
        </div>
      </div>

      <!-- recents label -->
      <div class="drawer-recents-label">RECENTS</div>

      <!-- recent chats list -->
      <div class="drawer-recents sa">
        <div
          v-for="c in store.displayRecentChats"
          :key="c.id"
          class="recent-chat-item"
          :class="c.activeClass"
          :style="{ background: c.bg }"
          @click="c.open"
          @touchstart="c.touchStart"
          @touchend="c.touchEnd"
          @contextmenu="c.contextMenu"
        >
          <span class="recent-chat-title">{{ c.title }}</span>
          <button class="chat-menu-btn" @click="c.openMenu" aria-label="menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="6" r="2" fill="#9A958B" />
              <circle cx="12" cy="12" r="2" fill="#9A958B" />
              <circle cx="12" cy="18" r="2" fill="#9A958B" />
            </svg>
          </button>
        </div>
      </div>

      <!-- bottom bar -->
      <div class="drawer-bottom">
        <div class="drawer-all-chats" @click="store.pullCloud">
          <span>All chats</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#B8B3A8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <button class="drawer-new" @click="store.newChat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#F5F3EE" stroke-width="2.2" stroke-linecap="round" />
          </svg>
          <span>New</span>
        </button>
      </div>

      <!-- chat context menu -->
      <div v-if="store.chatMenuOpen" class="chat-menu">
        <div class="chat-menu-backdrop" @click="store.closeChatMenu"></div>
        <div class="chat-menu-popover" :style="{ left: store.chatMenuX + 'px', top: store.chatMenuY + 'px' }">
          <div class="chat-menu-item" @click="store.doRenameChat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Rename</span>
          </div>
          <div class="chat-menu-item delete" @click="store.doDeleteChat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" stroke="#C94E4E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Delete</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.12);
  animation: fadeIn 0.15s ease both;
}

.drawer-panel {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: min(300px, 85vw);
  background: #F5F3EE;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 24px rgba(0, 0, 0, 0.06);
  animation: slideInLeft 0.2s ease both;
}

.drawer-header {
  flex: none;
  padding: calc(env(safe-area-inset-top, 0px) + 56px) 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  font-family: 'Newsreader', 'Noto Serif SC', serif;
  font-size: 26px;
  font-weight: 500;
  color: #1A1815;
}

.drawer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFF;
  box-shadow: 0 0 0 1px rgba(43, 38, 30, 0.05), 0 2px 6px rgba(43, 38, 30, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.drawer-nav {
  flex: none;
  padding: 24px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-nav-item {
  padding: 12px 12px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1A1815;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
}

.drawer-nav-item.active {
  background: #EDEAE3;
}

.drawer-recents-label {
  padding: 28px 24px 10px;
  font-size: 12px;
  color: #B8B3A8;
  font-weight: 600;
  letter-spacing: 1px;
}

.drawer-recents {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px;
}

.recent-chat-item {
  padding: 9px 10px 9px 12px;
  border-radius: 10px;
  font-size: 14.5px;
  color: #3A362F;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recent-chat-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-bottom {
  flex: none;
  padding: 12px 16px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-all-chats {
  font-size: 13px;
  color: #B8B3A8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.drawer-new {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1A1815;
  color: #F5F3EE;
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}

.chat-menu {
  position: absolute;
  inset: 0;
  z-index: 400;
}

.chat-menu-backdrop {
  position: absolute;
  inset: 0;
  background: transparent;
}

.chat-menu-popover {
  position: absolute;
  background: #FFF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  padding: 6px;
  min-width: 120px;
  animation: fadeUp 0.15s ease both;
}

.chat-menu-item {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #1A1815;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.chat-menu-item.delete {
  color: #C94E4E;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: none; } }
</style>
