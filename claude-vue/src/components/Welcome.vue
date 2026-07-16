<script setup>
import { useAppStore } from '@/stores/app'
import SparkBadge from './SparkBadge.vue'

const store = useAppStore()
</script>

<template>
  <div class="welcome-container">
    <!-- web: horizontal -->
    <div class="welcome-web">
      <SparkBadge :width="48" :height="48" style="font-size: 2.8rem;" />
      <span class="welcome-text">Hi, How can I help you today?</span>
    </div>
    <!-- mobile: vertical -->
    <div class="welcome-mobile">
      <SparkBadge :width="56" :height="56" style="font-size: 3.2rem;" />
      <span class="welcome-text-mobile">{{ store.mobileGreeting }}</span>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
}

.welcome-web {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6em;
  padding: 120px 24px 80px;
  min-height: 100%;
}

.welcome-mobile {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 100px 24px 60px;
  min-height: 100%;
}

.welcome-text {
  font-size: 2.5rem;
  font-weight: 400;
  color: #9A958B;
  line-height: 1.35;
}

.welcome-text-mobile {
  font-size: 1.35rem;
  font-weight: 400;
  color: #9A958B;
  line-height: 1.45;
}

@media (max-width: 768px) {
  .welcome-web { display: none !important; }
  .welcome-mobile { display: flex !important; }
}
</style>
