<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';

interface CustomHero2Data {
  title?: string;
  subtitle?: string;
  content?: string;
}

defineProps<{ data: CustomHero2Data }>();

const threeRef = ref<HTMLElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let particles: THREE.Points | null = null;
let animationId: number;

const particleCount = 150;
const velocities: THREE.Vector3[] = [];

function getThemeColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    bg: isDark ? 0x000000 : 0xffffff,
    dots: isDark ? 0xcccccc : 0x444444,
  };
}

function setupThree() {
  if (!threeRef.value) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const colors = getThemeColors();

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);

  // Camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 50;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  threeRef.value.appendChild(renderer.domElement);

  // Particle geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const alphas = new Float32Array(particleCount);

  // Create particles with random positions and velocities
  velocities.length = 0;
  for (let i = 0; i < particleCount; i++) {
    // Random position across the viewport
    positions[i * 3] = (Math.random() - 0.5) * 100; // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z

    alphas[i] = 1.0;

    // Random velocity (each dot moves in its own direction)
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.02;
    velocities.push(new THREE.Vector3(
      Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
      Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
      (Math.random() - 0.5) * speed * 0.2
    ));
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

  // Particle material with custom shader for fade effect
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(colors.dots) },
      pointSize: { value: 2.0 },
    },
    vertexShader: `
      attribute float alpha;
      varying float vAlpha;
      uniform float pointSize;
      
      void main() {
        vAlpha = alpha;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = pointSize;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vAlpha;
      
      void main() {
        // Circular dot shape
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;
        
        float alpha = (1.0 - dist * 2.0) * vAlpha;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  animate();
}

function animate() {
  if (!renderer || !scene || !camera || !particles) return;

  const positions = particles.geometry.attributes.position.array as Float32Array;
  const alphas = particles.geometry.attributes.alpha.array as Float32Array;
  const height = 50; // Half of the vertical span

  // Update particle positions and calculate fade
  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    
    // Update position based on velocity
    positions[idx] += velocities[i].x;
    positions[idx + 1] += velocities[i].y;
    positions[idx + 2] += velocities[i].z;

    // Wrap around horizontally
    if (positions[idx] > 50) positions[idx] = -50;
    if (positions[idx] < -50) positions[idx] = 50;

    // Wrap around depth
    if (positions[idx + 2] > 25) positions[idx + 2] = -25;
    if (positions[idx + 2] < -25) positions[idx + 2] = 25;

    // Wrap around vertically
    if (positions[idx + 1] > 50) positions[idx + 1] = -50;
    if (positions[idx + 1] < -50) positions[idx + 1] = 50;

    // Calculate fade based on Y position
    const y = positions[idx + 1];
    const normalizedY = (y + height) / (height * 2); // 0 to 1
    
    let alpha = 1.0;
    
    // Fade at top 10%
    if (normalizedY > 0.9) {
      alpha = (1.0 - normalizedY) / 0.1;
    }
    // Fade at bottom 50%
    else if (normalizedY < 0.5) {
      alpha = normalizedY / 0.5;
    }
    
    alphas[i] = Math.max(0, Math.min(1, alpha));
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.alpha.needsUpdate = true;

  renderer.render(scene, camera);
  animationId = requestAnimationFrame(animate);
}

function updateTheme() {
  if (!scene || !particles) return;
  const colors = getThemeColors();
  scene.background = new THREE.Color(colors.bg);
  (particles.material as THREE.ShaderMaterial).uniforms.color.value = new THREE.Color(colors.dots);
}

function handleResize() {
  if (!camera || !renderer) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function cleanup() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
    if (threeRef.value && renderer.domElement) {
      threeRef.value.removeChild(renderer.domElement);
    }
  }
  if (particles) {
    particles.geometry.dispose();
    (particles.material as THREE.Material).dispose();
  }
}

onMounted(() => {
  setupThree();
  window.addEventListener('resize', handleResize);
  
  // Watch for theme changes
  const observer = new MutationObserver(() => updateTheme());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  
  onBeforeUnmount(() => {
    observer.disconnect();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  cleanup();
});
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden">
    <div ref="threeRef" class="absolute inset-0 w-full h-full z-0 pointer-events-none" />
    <div v-if="data" class="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full h-full min-h-screen pt-24">
      <h1 v-if="data.title" class="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
        {{ data.title }}
      </h1>
      <h2 v-if="data.subtitle" class="text-xl md:text-2xl font-medium mb-6 opacity-80">
        {{ data.subtitle }}
      </h2>
      <div v-if="data.content" class="prose prose-lg max-w-2xl mx-auto opacity-90" v-html="data.content" />
    </div>
    <div v-else class="relative z-10 flex items-center justify-center text-center text-gray-400 min-h-screen">
      No data for this block.
    </div>
  </div>
</template>

<style scoped>
.relative {
  width: 100vw !important;
  height: 100vh !important;
  min-height: 100vh !important;
  max-width: 100vw !important;
  overflow: hidden;
}

h1, h2 {
  color: var(--tw-prose-headings, inherit);
}
</style>
