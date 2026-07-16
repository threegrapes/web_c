<script setup>
/**
 * 通用 SVG 图标组件。
 * 简化各组件中的 SVG 重复代码，通过 props 传入 path 数据与描边/填充模式。
 */
const props = defineProps({
  width: { type: [Number, String], default: 18 },
  height: { type: [Number, String], default: 18 },
  viewBox: { type: String, default: '0 0 24 24' },
  path: { type: String, default: '' },
  strokeWidth: { type: [Number, String], default: 1.7 },
  stroke: { type: String, default: 'currentColor' },
  fill: { type: String, default: 'none' },
  strokeLinecap: { type: String, default: 'round' },
  strokeLinejoin: { type: String, default: 'round' },
  style: { type: Object, default: () => ({}) }
})
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :style="style"
    class="svg-icon"
  >
    <path
      :d="path"
      :stroke-width="strokeWidth"
      :stroke-linecap="strokeLinecap"
      :stroke-linejoin="strokeLinejoin"
    />
  </svg>
</template>

<style scoped>
.svg-icon {
  flex: none;
  display: block;
}
</style>
