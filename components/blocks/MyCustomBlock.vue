<script setup lang="ts">
// Define your block's TypeScript interface
interface MyCustomBlockData {
  title?: string;
  subtitle?: string;
  background_color?: string;
  content?: string;
}

defineProps<{
  data: MyCustomBlockData;
}>();
</script>

<template>
  <BlockContainer>
    <div class="blueprint-container">
      <!-- Top measurement line -->
      <div class="blueprint-measure-top">
        <span class="blueprint-label">SECTION A-A</span>
      </div>
      
      <!-- Main blueprint content -->
      <div class="blueprint-content">
        <!-- Corner markers -->
        <div class="blueprint-corner blueprint-corner-tl"></div>
        <div class="blueprint-corner blueprint-corner-tr"></div>
        <div class="blueprint-corner blueprint-corner-bl"></div>
        <div class="blueprint-corner blueprint-corner-br"></div>
        
        <!-- Side measurements -->
        <div class="blueprint-measure-left">
          <div class="blueprint-dimension">
            <span>240</span>
          </div>
        </div>
        
        <div class="blueprint-measure-right">
          <div class="blueprint-dimension">
            <span>120</span>
          </div>
        </div>
        
        <!-- Content area -->
        <div class="blueprint-inner">
          <div class="blueprint-header" v-if="data.title">
            <h2 class="blueprint-title">
              {{ data.title?.toUpperCase() }}
            </h2>
            <div class="blueprint-title-underline"></div>
          </div>
          
          <div class="blueprint-spec-block" v-if="data.subtitle">
            <div class="blueprint-spec-label">SPECIFICATION:</div>
            <div class="blueprint-spec-value">{{ data.subtitle }}</div>
          </div>
          
          <div class="blueprint-notes" v-if="data.content">
            <div class="blueprint-notes-header">
              <span>NOTES:</span>
              <div class="blueprint-notes-line"></div>
            </div>
            <div class="blueprint-notes-content">
              {{ data.content }}
            </div>
          </div>
          
          <!-- Technical drawing elements -->
          <div class="blueprint-drawing">
            <svg viewBox="0 0 200 100" class="blueprint-svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="200" height="100" fill="url(#grid)" />
              <rect x="20" y="20" width="160" height="60" fill="none" stroke="#374151" stroke-width="1"/>
              <circle cx="100" cy="50" r="15" fill="none" stroke="#374151" stroke-width="1"/>
              <line x1="85" y1="50" x2="115" y2="50" stroke="#374151" stroke-width="0.5"/>
              <line x1="100" y1="35" x2="100" y2="65" stroke="#374151" stroke-width="0.5"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Bottom info bar -->
      <div class="blueprint-footer">
        <div class="blueprint-footer-left">
          <span class="blueprint-project">PROJECT: CUSTOM BLOCK</span>
          <span class="blueprint-scale">SCALE: 1:1</span>
        </div>
        <div class="blueprint-footer-right">
          <span class="blueprint-date">DEC 2025</span>
          <span class="blueprint-drawing-no">DWG: CB-001</span>
        </div>
      </div>
    </div>
  </BlockContainer>
</template>

<style scoped>
.blueprint-container {
  @apply relative bg-gray-50 border border-gray-300 font-mono text-sm;
  background-image: 
    radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0);
  background-size: 20px 20px;
}

.blueprint-measure-top {
  @apply absolute -top-6 left-0 right-0 h-4 border-t border-gray-400;
}

.blueprint-measure-top::before,
.blueprint-measure-top::after {
  content: '';
  @apply absolute top-0 w-2 h-2 bg-gray-400;
}

.blueprint-measure-top::before {
  left: -1px;
}

.blueprint-measure-top::after {
  right: -1px;
}

.blueprint-label {
  @apply absolute top-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-gray-50 px-2;
}

.blueprint-content {
  @apply relative border-2 border-gray-700 bg-white p-8;
  min-height: 300px;
}

.blueprint-corner {
  @apply absolute w-4 h-4 border-gray-700;
}

.blueprint-corner-tl {
  @apply -top-2 -left-2 border-t-2 border-l-2;
}

.blueprint-corner-tr {
  @apply -top-2 -right-2 border-t-2 border-r-2;
}

.blueprint-corner-bl {
  @apply -bottom-2 -left-2 border-b-2 border-l-2;
}

.blueprint-corner-br {
  @apply -bottom-2 -right-2 border-b-2 border-r-2;
}

.blueprint-measure-left {
  @apply absolute -left-8 top-0 bottom-0 w-6 flex items-center justify-center border-l border-gray-400;
}

.blueprint-measure-right {
  @apply absolute -right-8 top-0 bottom-0 w-6 flex items-center justify-center border-r border-gray-400;
}

.blueprint-dimension {
  @apply transform -rotate-90 text-xs text-gray-600 bg-gray-50 px-1;
}

.blueprint-inner {
  @apply space-y-6;
}

.blueprint-header {
  @apply border-b border-gray-300 pb-4;
}

.blueprint-title {
  @apply text-2xl font-bold tracking-wider text-gray-900 mb-2;
  letter-spacing: 0.2em;
}

.blueprint-title-underline {
  @apply w-full h-px bg-gray-700;
  position: relative;
}

.blueprint-title-underline::after {
  content: '';
  @apply absolute right-0 top-0 w-2 h-2 bg-gray-700 transform rotate-45 -translate-y-1/2;
}

.blueprint-spec-block {
  @apply border border-gray-400 p-3 bg-gray-50;
}

.blueprint-spec-label {
  @apply text-xs text-gray-600 font-bold tracking-wider;
}

.blueprint-spec-value {
  @apply text-gray-900 font-medium;
}

.blueprint-notes {
  @apply space-y-2;
}

.blueprint-notes-header {
  @apply flex items-center space-x-3;
}

.blueprint-notes-header span {
  @apply text-xs font-bold text-gray-600 tracking-wider;
}

.blueprint-notes-line {
  @apply flex-1 h-px bg-gray-400;
}

.blueprint-notes-content {
  @apply text-gray-800 leading-relaxed pl-4 border-l-2 border-gray-300;
}

.blueprint-drawing {
  @apply mt-6 p-4 border border-dashed border-gray-400 bg-white;
}

.blueprint-svg {
  @apply w-full h-24;
}

.blueprint-footer {
  @apply flex justify-between items-center p-3 bg-gray-700 text-white text-xs;
}

.blueprint-footer-left,
.blueprint-footer-right {
  @apply flex space-x-4;
}

.blueprint-project,
.blueprint-scale,
.blueprint-date,
.blueprint-drawing-no {
  @apply tracking-wide;
}
</style>