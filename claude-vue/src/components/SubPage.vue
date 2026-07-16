<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="sub-page" style="animation: slideIn .25s ease both;">
    <div class="sub-header">
      <button class="sub-back" @click="store.closeSub">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#48453E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="sub-title">{{ store.subTitle }}</div>
    </div>

    <div class="sub-body sa">
      <!-- Moments -->
      <div v-if="store.sub === 'moments'" class="sub-card">
        <div class="sub-card-icon"></div>
        <div class="sub-card-title">Empty moments page</div>
        <div class="sub-card-desc">Replace this area with your own moments component.</div>
      </div>

      <!-- Diary -->
      <div v-if="store.sub === 'diary'" class="sub-card">
        <div class="sub-card-icon"></div>
        <div class="sub-card-title">Empty diary page</div>
        <div class="sub-card-desc">Replace this area with your own diary or letters component.</div>
      </div>

      <!-- Mood -->
      <div v-if="store.sub === 'mood'" class="sub-card">
        <div class="sub-card-icon"></div>
        <div class="sub-card-title">Empty mood page</div>
        <div class="sub-card-desc">Replace this area with your own mood tracker component.</div>
      </div>

      <!-- Anniversaries -->
      <div v-if="store.sub === 'anniversary'" class="sub-card">
        <div class="sub-card-icon"></div>
        <div class="sub-card-title">Empty anniversaries page</div>
        <div class="sub-card-desc">Replace this area with your own countdown or anniversary component.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-page {
  position: absolute;
  inset: 0;
  background: #F5F3EE;
  display: flex;
  flex-direction: column;
}

.sub-header {
  flex: none;
  padding: 4px 16px 12px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.sub-back {
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

.sub-title {
  font-size: 17px;
  font-weight: 500;
  color: #1A1815;
}

.sub-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 20px 24px;
}

.sub-card {
  background: #FFF;
  border: 1px solid #EDE9E0;
  box-shadow: 0 1px 2px rgba(43, 38, 30, 0.035), 0 10px 30px -10px rgba(43, 38, 30, 0.07);
  border-radius: 20px;
  padding: 30px 22px;
  text-align: center;
}

.sub-card-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: #F2EFE8;
  margin: 0 auto 15px;
}

.sub-card-title {
  font-size: 16px;
  font-weight: 500;
  color: #1A1815;
}

.sub-card-desc {
  font-size: 13px;
  color: #9A958B;
  line-height: 1.65;
  margin-top: 8px;
}

@keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
</style>
