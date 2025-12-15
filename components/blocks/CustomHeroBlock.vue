<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

interface CustomHeroBlockData {
  title?: string;
  subtitle?: string;
  content?: string;
}

defineProps<{ data: CustomHeroBlockData }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number;

const drawTopo = (ctx: CanvasRenderingContext2D, width: number, height: number, dark: boolean, t: number) => {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.strokeStyle = dark ? '#fff' : '#111';
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.8;
  const lines = 18;
  const points = 80;
  for (let i = 0; i < lines; i++) {
    ctx.beginPath();
    for (let j = 0; j < points; j++) {
      const x = (width / (points - 1)) * j;
      const y =
        height / 2 +
        (i - lines / 2) * 18 +
        Math.sin(j * 0.25 + i * 0.5 + t * 0.8) * 16 +
        Math.cos(j * 0.13 + i * 0.7 + t * 0.6) * 8;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
};

const animate = (ctx: CanvasRenderingContext2D, width: number, height: number, dark: boolean, t: number) => {
  drawTopo(ctx, width, height, dark, t);
  animationId = requestAnimationFrame((newT) => animate(ctx, width, height, dark, newT / 1000));
};

const startAnimation = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.offsetWidth * dpr;
  const height = canvas.offsetHeight * dpr;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dark = document.documentElement.classList.contains('dark');
  animate(ctx, width, height, dark, performance.now() / 1000);
};

const stopAnimation = () => {
  cancelAnimationFrame(animationId);
};

onMounted(() => {
  startAnimation();
  window.addEventListener('resize', startAnimation);
});

onBeforeUnmount(() => {
  stopAnimation();
  window.removeEventListener('resize', startAnimation);
});

// Watch for theme changes
watch(
  () => document.documentElement.classList.contains('dark'),
  () => {
    stopAnimation();
    startAnimation();
  }
);
</script>

<template>
  <BlockContainer class="relative overflow-hidden min-h-[420px] flex items-center justify-center">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full z-0 transition-colors duration-300" />
    <div class="relative z-10 flex flex-col items-center justify-center text-center py-24 px-6">
      <h1 v-if="data.title" class="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
        {{ data.title }}
      </h1>
      <h2 v-if="data.subtitle" class="text-xl md:text-2xl font-medium mb-6 opacity-80">
        {{ data.subtitle }}
      </h2>
      <div v-if="data.content" class="prose prose-lg max-w-2xl mx-auto opacity-90">
        {{ data.content }}
      </div>
    </div>
  </BlockContainer>
</template>

<style scoped>
canvas {
  pointer-events: none;
  background: transparent;
}

:deep(.dark) canvas {
  background: #111;
}

:deep(:not(.dark)) canvas {
  background: #fff;
}

h1, h2 {
  color: var(--tw-prose-headings, inherit);
}
</style>
