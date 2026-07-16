<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="home-view sa">
    <div class="home-header">
      <button class="home-menu-btn" @click="store.toggleDrawer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M4 12h12M4 17h16" stroke="#48453E" stroke-width="1.7" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="home-hero">
      <div class="home-label">COMPANION</div>
      <div class="home-greeting">Good morning.</div>
      <div class="home-subtitle">Set up your companion space</div>
    </div>

    <!-- dawn card -->
    <div class="home-card">
      <div class="card-label">Pinned note</div>
      <div class="card-body serif">Add your own note here. This card is intentionally blank for public reuse.</div>
      <div class="card-meta">Save · Reply</div>
    </div>

    <!-- countdown -->
    <div class="home-card countdown" @click="store.openAnniv">
      <div>
        <div class="card-title">Next anniversary</div>
        <div class="card-subtitle">MM.DD</div>
      </div>
      <div class="countdown-value">
        <span class="countdown-number">0</span>
        <span class="countdown-unit">days</span>
      </div>
    </div>

    <!-- status row -->
    <div class="status-row">
      <div class="status-card">
        <div class="card-label">Weather</div>
        <div class="status-number">—°</div>
        <div class="card-subtitle">Add data</div>
      </div>
      <div class="status-card">
        <div class="card-label">Sleep</div>
        <div class="status-number">—</div>
        <div class="card-subtitle">Add data</div>
      </div>
      <div class="status-card" @click="store.openMood">
        <div class="card-label">Mood</div>
        <div class="status-emoji">—</div>
        <div class="card-subtitle">Add data</div>
      </div>
    </div>

    <!-- recent -->
    <div class="recent-label">Recent</div>
    <div class="home-card" @click="store.openMoments">
      <div class="card-label">Companion · Placeholder</div>
      <div class="card-body">Replace this preview with your own moment content.</div>
    </div>
    <div class="home-card" @click="store.openDiary">
      <div class="card-label">Diary · Placeholder</div>
      <div class="card-body serif">Untitled entry</div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 8px 20px 24px;
}

.home-header {
  padding: 4px 0 6px;
}

.home-menu-btn {
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

.home-hero {
  padding: 6px 0 24px;
}

.home-label {
  font-size: 12px;
  color: #B8B3A8;
  letter-spacing: 2.5px;
  font-weight: 600;
}

.home-greeting {
  font-family: 'Newsreader', 'Noto Serif SC', serif;
  font-size: 29px;
  font-weight: 400;
  color: #1A1815;
  margin-top: 10px;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.home-subtitle {
  font-size: 14px;
  color: #9A958B;
  margin-top: 6px;
}

.home-card {
  background: #FFF;
  border: 1px solid #EDE9E0;
  box-shadow: 0 1px 2px rgba(43, 38, 30, 0.035), 0 10px 30px -10px rgba(43, 38, 30, 0.07);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  cursor: pointer;
}

.card-label {
  font-size: 12px;
  color: #B8B3A8;
  font-weight: 500;
  letter-spacing: 0.3px;
  margin-bottom: 10px;
}

.card-body {
  font-size: 17px;
  line-height: 1.7;
  color: #3A362F;
}

.card-body.serif {
  font-family: 'Newsreader', 'Noto Serif SC', serif;
}

.card-meta {
  margin-top: 14px;
  font-size: 12.5px;
  color: #B8B3A8;
}

.countdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #1A1815;
}

.card-subtitle {
  font-size: 13px;
  color: #B8B3A8;
  margin-top: 4px;
}

.countdown-value {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.countdown-number {
  font-family: 'Newsreader', serif;
  font-size: 38px;
  font-weight: 400;
  color: #1A1815;
  line-height: 1;
  letter-spacing: -0.02em;
}

.countdown-unit {
  font-size: 13px;
  color: #9A958B;
}

.status-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 22px;
}

.status-card {
  background: #FFF;
  border: 1px solid #EDE9E0;
  box-shadow: 0 1px 2px rgba(43, 38, 30, 0.035), 0 10px 30px -10px rgba(43, 38, 30, 0.07);
  border-radius: 16px;
  padding: 14px 12px;
  text-align: center;
}

.status-number {
  font-family: 'Newsreader', serif;
  font-size: 22px;
  color: #1A1815;
  margin-top: 6px;
}

.status-emoji {
  font-size: 18px;
  margin-top: 6px;
}

.recent-label {
  font-size: 13px;
  font-weight: 500;
  color: #9A958B;
  margin-bottom: 12px;
}
</style>
