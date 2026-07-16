<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="chat-input-bar">
    <div class="input-card">
      <textarea
        :value="store.input"
        @input="store.inputChange($event.target.value)"
        @keydown="store.inputKey"
        :placeholder="store.inputPlaceholder"
        rows="1"
        class="input-field"
      />

      <!-- attached images preview -->
      <div v-if="store.hasAttachedImages" class="image-preview-row">
        <div
          v-for="(img, i) in store.attachedImagesDisplay"
          :key="i"
          class="image-thumb"
        >
          <img :src="img.dataUrl" class="image-thumb-img" />
          <button class="image-remove" @click="img.remove">✕</button>
        </div>
        <button class="image-clear" @click="store.clearAttachedImages">清空</button>
      </div>

      <div class="input-toolbar">
        <div class="toolbar-left">
          <button class="tool-btn-round" @click="store.togglePlus">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#6B665E" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
          <button class="tool-btn-pill" @click="store.openApiSheet">
            <span class="tool-btn-text">{{ store.activeModel }}</span>
          </button>
        </div>
        <div class="toolbar-right">
          <button class="tool-btn-icon" @click="store.openPromptSheet">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3" stroke="#6B665E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button class="send-btn" @click="store.send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 10v4M9 7v10M13 5.5v13M17 9v6M21 11v2" stroke="#F5F3EE" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-bar {
  flex: none;
  padding: 8px 14px calc(env(safe-area-inset-bottom, 0px) + 6px);
}

.input-card {
  background: #FBFAF7;
  border: 1px solid #E7E3DA;
  border-radius: 26px;
  padding: 17px 17px 12px;
  box-shadow: 0 1px 3px rgba(43, 38, 30, 0.04);
}

.input-field {
  display: block;
  width: 100%;
  min-height: 30px;
  max-height: 50vh;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.55;
  color: #2B2620;
  padding: 2px 4px 17px;
  font-weight: 300;
  field-sizing: content;
}

.image-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.image-thumb {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  background: #EDEAE3;
}

.image-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-remove {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1A1815;
  color: #FFF;
  border: none;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
}

.image-clear {
  align-self: center;
  height: 28px;
  border: none;
  background: #E7E3DA;
  border-radius: 14px;
  padding: 0 11px;
  font-size: 12px;
  font-family: inherit;
  color: #6B665E;
  cursor: pointer;
}

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tool-btn-round {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F2EFE8;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tool-btn-pill {
  height: 32px;
  display: flex;
  align-items: center;
  background: #F2EFE8;
  border: none;
  border-radius: 18px;
  padding: 7px 14px;
  cursor: pointer;
  font-family: inherit;
  max-width: 178px;
}

.tool-btn-text {
  font-size: 13.5px;
  font-weight: 500;
  color: #3A362F;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-btn-icon {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1A1815;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
