<script setup>
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="sheet-overlay">
    <div class="sheet-backdrop" @click="store.closeSheet"></div>
    <div class="sheet-panel">
      <div class="sheet-handle"></div>
      <div class="sheet-scroll sa">
        <div class="sheet-header">
          <button class="sheet-close" @click="store.closeSheet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#48453E" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
          <span class="sheet-title">API settings</span>
          <button class="sheet-new" @click="store.newApiDraft">新建</button>
        </div>

        <div class="model-cards">
          <button
            v-for="(p, i) in store.apiOptions"
            :key="i"
            class="model-card"
            :style="{ borderColor: p.bd, background: p.bg }"
            @click="p.pick"
          >
            <div class="model-card-row">
              <span class="model-card-title" :style="{ color: p.fg }">{{ p.title }}</span>
              <span class="model-badge" :style="{ color: p.badgeFg, background: p.badgeBg, display: p.badgeDisplay }">默认</span>
            </div>
            <div class="model-card-sub" :style="{ color: p.subFg }">{{ p.model }}</div>
          </button>
        </div>

        <div class="api-editor">
          <div class="api-fields">
            <div class="api-field-group">
              <label class="api-field">
                <div class="api-field-label">preset</div>
                <input
                  :value="store.apiDraft.name"
                  @input="store.apiNameChange($event.target.value)"
                  placeholder="渠道名"
                  class="api-input"
                />
              </label>
              <label class="api-field">
                <div class="api-field-label">模型</div>
                <input
                  :value="store.apiDraft.model"
                  @input="store.apiModelChange($event.target.value)"
                  placeholder="模型名"
                  class="api-input"
                />
              </label>
            </div>
            <div class="api-model-hint-row">
              <div class="api-model-hint">{{ store.apiModelListHint }}</div>
              <button class="api-fetch-btn" @click="store.fetchApiModels">拉模型</button>
            </div>
            <div class="model-options">
              <div v-for="(m, i) in store.apiModelOptions" :key="i" class="model-option">
                <button
                  class="model-option-btn"
                  :style="{ borderColor: m.bd, background: m.bg, color: m.fg }"
                  @click="m.pick"
                >
                  {{ m.name }}
                </button>
                <button class="model-option-remove" @click="m.remove">×</button>
              </div>
            </div>
            <div class="custom-model-row">
              <input
                :value="store.customModelInput"
                @input="store.customModelInputChange($event.target.value)"
                placeholder="手动输入模型名..."
                class="api-input custom-model-input"
              />
              <button class="api-add-btn" @click="store.addCustomModel">添加</button>
            </div>
          </div>

          <button class="api-advanced-toggle" @click="store.toggleApiAdvanced">
            <span class="api-advanced-title">连接细节</span>
            <span class="api-advanced-hint">
              <span>{{ store.apiDetailHint }}</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                :style="{ transform: store.isApiAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }"
              >
                <path d="M6 9l6 6 6-6" stroke="#B8B3A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>

          <div v-if="store.isApiAdvanced" class="api-advanced-panel">
            <div class="api-type-btns">
              <button
                class="api-type-btn"
                :style="{ borderColor: store.isAnthropic ? '#E7E3DA' : '#1A1815', background: store.isAnthropic ? '#FFF' : '#1A1815', color: store.isAnthropic ? '#2B2620' : '#F5F3EE' }"
                @click="store.setApiOpenAI"
              >OpenAI兼容</button>
              <button
                class="api-type-btn"
                :style="{ borderColor: store.isAnthropic ? '#1A1815' : '#E7E3DA', background: store.isAnthropic ? '#1A1815' : '#FFF', color: store.isAnthropic ? '#F5F3EE' : '#2B2620' }"
                @click="store.setApiAnthropic"
              >Anthropic</button>
              <button class="api-type-btn" :style="{ background: '#E1DDD4' }" @click="store.toggleApiGateway">直连模式</button>
            </div>
            <div class="api-advanced-fields">
              <input
                :value="store.apiDraft.connectorUrl"
                @input="store.connectorUrlChange($event.target.value)"
                placeholder="中转站 baseURL，如 https://api.example.com"
                class="api-input"
              />
              <input
                :value="store.apiDraft.accessValue"
                @input="store.accessValueChange($event.target.value)"
                placeholder="API Key，如 sk-xxxx..."
                class="api-input"
              />
            </div>
          </div>
        </div>

        <div class="api-actions">
          <button class="api-save" @click="store.saveApiDraft">保存并使用</button>
          <button class="api-delete" @click="store.deleteApiDraft">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet-overlay {
  position: absolute;
  inset: 0;
  z-index: 260;
}

.sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  animation: fadeIn 0.15s ease both;
}

.sheet-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background: #F5F3EE;
  border-radius: 16px 16px 0 0;
  padding: 12px 0 calc(env(safe-area-inset-bottom, 0px) + 26px);
  animation: slideUp 0.25s ease both;
  box-shadow: none;
}

.sheet-handle {
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: #CFCAC1;
  margin: 0 auto 14px;
}

.sheet-scroll {
  max-height: calc(82vh - 40px);
  overflow-y: auto;
  padding: 0 16px 8px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 14px;
}

.sheet-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #FFF;
  border: none;
  box-shadow: 0 0 0 1px rgba(43, 38, 30, 0.05), 0 2px 6px rgba(43, 38, 30, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1815;
}

.sheet-new {
  border: none;
  background: #1A1815;
  color: #F5F3EE;
  border-radius: 18px;
  padding: 8px 13px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

.model-cards {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 2px 12px;
}

.model-card {
  flex: none;
  width: 178px;
  border: 1px solid;
  border-radius: 18px;
  padding: 10px 12px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
}

.model-card-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.model-card-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-badge {
  font-size: 10px;
  border-radius: 8px;
  padding: 2px 5px;
}

.model-card-sub {
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 3px;
}

.api-editor {
  background: #FFF;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #EDE9E0;
}

.api-fields {
  padding: 12px 14px;
  border-bottom: 1px solid #ECE8DF;
}

.api-field-group {
  display: grid;
  grid-template-columns: 0.72fr 1.28fr;
  gap: 10px;
  align-items: end;
}

.api-field {
  min-width: 0;
}

.api-field-label {
  font-size: 11.5px;
  color: #B8B3A8;
  margin-bottom: 6px;
}

.api-input {
  width: 100%;
  border: none;
  outline: none;
  background: #F7F5F0;
  border-radius: 12px;
  padding: 9px 10px;
  font-family: inherit;
  font-size: 16px;
  color: #1A1815;
}

.api-model-hint-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

.api-model-hint {
  font-size: 11.5px;
  color: #B8B3A8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.api-fetch-btn {
  border: none;
  background: #ECEAE4;
  color: #3A362F;
  border-radius: 14px;
  padding: 7px 11px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.model-options {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  padding-top: 9px;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 2px;
}

.model-option-btn {
  flex: none;
  max-width: 200px;
  border: 1px solid;
  border-radius: 14px;
  padding: 7px 10px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-option-remove {
  flex: none;
  width: 28px;
  height: 28px;
  border: 1px solid #E7E3DA;
  background: #FFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: #9A958B;
  padding: 0;
  line-height: 1;
}

.custom-model-row {
  display: flex;
  gap: 7px;
  margin-top: 9px;
}

.custom-model-input {
  flex: 1;
  border-radius: 14px;
  font-size: 12px;
}

.api-add-btn {
  border: none;
  background: #1A1815;
  color: #F5F3EE;
  border-radius: 14px;
  padding: 9px 14px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

.api-advanced-toggle {
  width: 100%;
  border: none;
  background: #FFF;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: inherit;
  cursor: pointer;
}

.api-advanced-title {
  font-size: 13px;
  font-weight: 600;
  color: #3A362F;
}

.api-advanced-hint {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #9A958B;
}

.api-advanced-panel {
  padding: 0 14px 14px;
  border-top: 1px solid #ECE8DF;
}

.api-type-btns {
  padding-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.api-type-btn {
  border: 1px solid;
  border-radius: 14px;
  padding: 7px 10px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

.api-advanced-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 10px;
}

.api-actions {
  display: flex;
  gap: 10px;
  padding-top: 12px;
}

.api-save {
  flex: 1;
  border: none;
  background: #1A1815;
  color: #F5F3EE;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.api-delete {
  border: none;
  background: #FFF;
  color: #9A958B;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
</style>
