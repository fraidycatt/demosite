<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

interface CustomHeroBlockData {
  title?: string;
  subtitle?: string;
  content?: string;
}

defineProps<{ data: CustomHeroBlockData }>();

import * as THREE from 'three';
const threeRef = ref<HTMLElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let material: THREE.ShaderMaterial | null = null;
let animationId: number;

const fgLight = 0xcccccc; // much lighter gray for light mode
const fgDark = 0x888888; // gray for dark mode

const snoise = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i); 
  vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
`;

const vs = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fs = `
uniform vec3 color;
uniform float time;

${snoise}

void main() {
  float levels = 12.0;
  float noise = snoise(vec3(gl_FragCoord.xy * 0.003 , time * 0.012));
  noise = (noise + 1.0) / 2.0;
  float lower = floor(noise * levels) / levels;
  float lowerDiff = noise - lower;
  if (lowerDiff > 0.005)
    discard;
  gl_FragColor = vec4(color, 1.0);
}`;

function getFgColor() {
  return document.documentElement.classList.contains('dark') ? fgDark : fgLight;
}

function setupThree() {
  if (!threeRef.value) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, width, 0, height, 1, 2);
  camera.position.z = 2;
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0, 0);
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.translate(width / 2, height / 2, 0);
  material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(getFgColor()) },
      time: { value: 0 },
    },
    vertexShader: vs,
    fragmentShader: fs, // use the color uniform again
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(geometry, material));
    threeRef.value.innerHTML = '';
  threeRef.value.appendChild(renderer.domElement);
  const clock = new THREE.Clock();
  function frame() {
    animationId = requestAnimationFrame(frame);
    if (material) material.uniforms.time.value = clock.startTime + clock.getElapsedTime();
    renderer.render(scene, camera);
  }
  frame();
}

function cleanupThree() {
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement && renderer.domElement.remove();
    renderer = null;
  }
  if (animationId) cancelAnimationFrame(animationId);
}


onMounted(() => {
  setupThree();
  window.addEventListener('resize', setupThree);
});

onBeforeUnmount(() => {
  cleanupThree();
  window.removeEventListener('resize', setupThree);
});

// Watch for theme changes
watch(
  () => document.documentElement.classList.contains('dark'),
  () => {
    if (material) material.uniforms.color.value = new THREE.Color(getFgColor());
  }
);
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden">
    <div ref="threeRef" class="absolute inset-0 w-full h-full z-0 transition-colors duration-300 pointer-events-none" style="top:0;left:0;right:0;bottom:0;" />
    <div v-if="data" class="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full h-full min-h-screen pt-24" style="min-height:100vh;justify-content:center;">
      <h1 v-if="data.title" class="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight font-customRegular">
        {{ data.title }}
      </h1>
      <h2 v-if="data.subtitle" class="text-xl md:text-2xl font-medium mb-6 opacity-80">
        {{ data.subtitle }}
      </h2>
      <div v-if="data.content" class="prose prose-lg max-w-2xl mx-auto opacity-90" v-html="data.content" />
    </div>
    <div v-else class="relative z-10 flex items-center justify-center text-center text-gray-400 min-h-screen" style="min-height:100vh;">No data for this block.</div>
  </div>
</template>

<style scoped>

div[ref="threeRef"] {
  pointer-events: none;
  background: transparent;
}

/* No background color for three.js, handled by shader */

h1, h2 {
  color: var(--tw-prose-headings, inherit);
}

.relative {
  width: 100vw !important;
  height: 100vh !important;
  min-height: 100vh !important;
  max-width: 100vw !important;
  overflow: hidden;
}
</style>
