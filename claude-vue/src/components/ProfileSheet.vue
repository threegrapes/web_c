<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div v-if="store.profileOpen" class="profile-sheet">
    <div class="profile-backdrop" @click="store.toggleProfile"></div>
    <div class="profile-panel">
      <div class="profile-handle"></div>

      <div class="profile-header">
        <div class="profile-avatar"></div>
        <div>
          <div class="profile-name">User</div>
          <div class="profile-hint">Set up profile</div>
        </div>
      </div>

      <div class="profile-group">
        <div class="profile-item" @click="store.openApiSheet">
          <div class="profile-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="#48453E" stroke-width="1.5" />
              <path d="M19 12c0-.4 0-.8-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L16 3H8l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6c-.1.4-.1.8-.1 1.2s0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L8 21h8l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" stroke="#48453E" stroke-width="1.3" stroke-linejoin="round" />
            </svg>
            <span class="profile-item-title">API settings</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="divider"></div>
        <div class="profile-item" @click="store.syncCloud">
          <div class="profile-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="profile-item-title">Load demo records</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="divider"></div>
        <div class="profile-item" @click="store.githubBackup">
          <div class="profile-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12M8 7l4-4 4 4M5 15v3a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div>
              <div class="profile-item-title">Export demo snapshot（不会拉回）</div>
              <div class="profile-item-subtitle">只把云端记录存进 Git，不会改变当前页面</div>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="divider"></div>
        <div class="profile-item" @click="store.exportData">
          <div class="profile-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="profile-item-title">导出数据</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="divider"></div>
        <label class="profile-item">
          <div class="profile-item-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#48453E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="profile-item-title">导入数据</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <input type="file" accept=".json" class="import-file-input" @change="(e) => { if (e.target.files[0]) store.importData(e.target.files[0]); e.target.value = '' }" />
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-sheet {
  position: absolute;
  inset: 0;
  z-index: 300;
}

.profile-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  animation: fadeIn 0.15s ease both;
}

.profile-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #F5F3EE;
  border-radius: 16px 16px 0 0;
  padding: 12px 0 calc(env(safe-area-inset-bottom, 0px) + 30px);
  animation: slideUp 0.25s ease both;
}

.profile-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #D1CCC2;
  margin: 0 auto 20px;
}

.profile-header {
  padding: 0 24px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ECEAE4;
}

.profile-name {
  font-size: 17px;
  font-weight: 600;
  color: #1A1815;
}

.profile-hint {
  font-size: 13px;
  color: #9A958B;
  margin-top: 3px;
}

.profile-group {
  margin: 0 16px 12px;
  background: #FFF;
  border-radius: 16px;
  overflow: hidden;
}

.profile-item {
  position: relative;
  padding: 15px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.profile-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-item-title {
  font-size: 15px;
  font-weight: 500;
  color: #1A1815;
}

.profile-item-subtitle {
  font-size: 12px;
  color: #B8B3A8;
  margin-top: 2px;
}

.divider {
  height: 1px;
  background: #ECE8DF;
  margin: 0 18px;
}

.import-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
</style>
