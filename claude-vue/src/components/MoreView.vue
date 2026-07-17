<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="more-view sa">
    <div class="more-header">
      <button class="more-menu-btn" @click="store.toggleDrawer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M4 12h12M4 17h16" stroke="#48453E" stroke-width="1.7" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="more-title">More</div>

    <div class="more-card">
      <div class="more-item" @click="store.openAnniv">
        <div class="more-item-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" stroke="#9A958B" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
          <div>
            <div class="more-item-title">Anniversaries</div>
            <div class="more-item-subtitle">0</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="divider"></div>
      <div class="more-item" @click="store.openDiary">
        <div class="more-item-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Z" stroke="#9A958B" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
          <div>
            <div class="more-item-title">Diary / Letters</div>
            <div class="more-item-subtitle">0</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="divider"></div>
      <div class="more-item" @click="store.openMoments">
        <div class="more-item-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="#9A958B" stroke-width="1.5" />
            <circle cx="8.5" cy="10" r="1.5" stroke="#9A958B" stroke-width="1.4" />
            <path d="M5 18l4.5-4 3 2.5L16 12l3 3" stroke="#9A958B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div>
            <div class="more-item-title">Moments</div>
            <div class="more-item-subtitle">0 posts</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="divider"></div>
      <div class="more-item" @click="store.openMood">
        <div class="more-item-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#9A958B" stroke-width="1.5" />
            <path d="M8.5 14.5a4 4 0 0 0 7 0" stroke="#9A958B" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="9" cy="9.5" r=".8" fill="#9A958B" />
            <circle cx="15" cy="9.5" r=".8" fill="#9A958B" />
          </svg>
          <div>
            <div class="more-item-title">Mood</div>
            <div class="more-item-subtitle">No entries yet</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <div class="more-card">
      <div class="more-item" @click="store.openWorldbookSheet">
        <div class="more-item-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" stroke="#9A958B" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M9 4v6l2-1.3L13 10V4" stroke="#9A958B" stroke-width="1.4" stroke-linejoin="round" />
          </svg>
          <div>
            <div class="more-item-title">Worldbook</div>
            <div class="more-item-subtitle">{{ store.wbHint }}</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <div class="more-card">
      <div class="more-item" @click="store.openPromptSheet">
        <div class="more-item-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="8" width="16" height="12" rx="2" stroke="#9A958B" stroke-width="1.5" />
            <path d="M4 12h16M9 8V5h6v3M12 14v3" stroke="#9A958B" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <div>
            <div class="more-item-title">Prompt templates</div>
            <div class="more-item-subtitle">{{ store.promptCount }}</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="divider"></div>
      <div class="more-item" @click="store.openAiSheet">
        <div class="more-item-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#9A958B" stroke-width="1.5" />
            <path d="M12 7v5l3 2" stroke="#9A958B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div>
            <div class="more-item-title">Persona</div>
            <div class="more-item-subtitle">{{ store.activeCompanion }}</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <div class="more-card settings-card" @click="store.toggleProfile">
      <div class="more-item-left">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="#9A958B" stroke-width="1.5" />
          <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L16 3H8l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 3 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L8 21h8l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" stroke="#9A958B" stroke-width="1.4" stroke-linejoin="round" />
        </svg>
        <div class="more-item-title">Settings</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 6l6 6-6 6" stroke="#D1CCC2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.more-view {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: calc(env(safe-area-inset-top, 0px) + 8px) 20px 24px;
}

.more-header {
  padding: 4px 0 6px;
}

.more-menu-btn {
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
  margin-left: -4px;
}

.more-title {
  padding: 6px 0 20px;
  font-family: 'Newsreader', 'Noto Serif SC', serif;
  font-size: 27px;
  font-weight: 400;
  color: #1A1815;
  letter-spacing: -0.01em;
}

.more-card {
  background: #FFF;
  border: 1px solid #EDE9E0;
  box-shadow: 0 1px 2px rgba(43, 38, 30, 0.035), 0 10px 30px -10px rgba(43, 38, 30, 0.07);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 14px;
}

.more-item {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.more-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.more-item-title {
  font-size: 15px;
  font-weight: 500;
  color: #1A1815;
}

.more-item-subtitle {
  font-size: 12px;
  color: #B8B3A8;
  margin-top: 2px;
}

.divider {
  height: 1px;
  background: #ECE8DF;
  margin: 0 18px;
}

.settings-card {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  margin-top: 14px;
}
</style>
