<template>
  <div class="home-container">
    <!-- SVG 全屏（逻辑保留，视觉隐藏） -->
    <svg class="polygon-editor" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon :points="polygonPoints" fill="transparent" />
      <circle
        v-for="(p, i) in polygon"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="1.2"
        fill="transparent"
      />
    </svg>

    <!-- 🐱 猫咪 -->
    <div
      class="cat-character"
      :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
      @click="handleClick"
    >
      <img :src="currentGif" class="cat-gif" />
    </div>

    <!-- 🌸 互动按钮 + 扇形工具栏 -->
    <div
      class="interaction-wrapper"
      :style="{
        left: interactionBtn.x + 'px',
        top: interactionBtn.y + 'px',
        width: interactionBtn.width + 'px',
        height: interactionBtn.height + 'px'
      }"
    >
      <!-- 主按钮 -->
      <div class="interaction-button" @click="toggleTools">
        <img :src="interactionBtn.img" draggable="false" />
      </div>

      <!-- 扇形工具 -->
      <div
        v-for="tool in tools"
        :key="tool.name"
        class="fan-tool"
        :class="{ open: toolsOpen }"
        :style="tool.style"
        @click.stop="onToolClick($event, tool)"
      >
        <img :src="tool.icon" />
        <div class="tool-tip">{{ tool.label }}</div>
      </div>
    </div>

    <!-- 底部导航 -->
    <nav class="nav-bar">
      <div
        v-for="item in menuItems"
        :key="item.name"
        class="nav-item"
        @click="$router.push(item.path)"
      >
        <img :src="getImageUrl(item.icon)" class="icon-img" />
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

/* ================= 常量 ================= */
const CAT_SIZE = 86
const MOVE_DURATION = 1200
const MAX_ATTEMPTS = 100

/* ================= 猫咪 ================= */
const pos = ref({ top: 0, left: 0 })
const isMoving = ref(false)

const idleGif = new URL('../assets/images/cat/jumping.gif.jpg', import.meta.url).href
const runGif  = new URL('../assets/images/cat/run.gif.jpg', import.meta.url).href
const currentGif = ref(idleGif)

/* ================= 导航 ================= */
const menuItems = [
  { name: 'Shop', path: '/shop', icon: 'shop.png' },
  { name: 'Study', path: '/study', icon: 'study.png' },
  { name: 'Visit', path: '/visit', icon: 'visit.png' },
  { name: 'Gallery', path: '/gallery', icon: 'gallery.png' },
  { name: 'Chat', path: '/chat', icon: 'chat.png' }
]
const getImageUrl = name =>
  new URL(`../assets/images/home/${name}`, import.meta.url).href

/* ================= 多边形区域 ================= */
const polygon = ref([
  { x: 14.722, y: 75.636 }, { x: 9.861, y: 67.03 },
  { x: 19.028, y: 49.333 }, { x: 19.097, y: 41.576 },
  { x: 25.069, y: 37.091 }, { x: 32.014, y: 38.182 },
  { x: 35.764, y: 40.848 }, { x: 35.764, y: 51.273 },
  { x: 40.417, y: 51.636 }, { x: 42.153, y: 42.545 },
  { x: 44.375, y: 39.03 },  { x: 48.611, y: 38.182 },
  { x: 47.778, y: 61.576 }, { x: 52.153, y: 61.455 },
  { x: 52.431, y: 77.455 }, { x: 32.917, y: 77.333 },
  { x: 33.958, y: 66.182 }, { x: 30.556, y: 63.636 },
  { x: 25.278, y: 63.636 }, { x: 22.778, y: 74.424 }
])

const polygonPoints = computed(() =>
  polygon.value.map(p => `${p.x},${p.y}`).join(' ')
)

/* ================= 工具函数 ================= */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

const pixelToPercent = (x, y) => ({
  x: (x / window.innerWidth) * 100,
  y: (y / window.innerHeight) * 100
})

const percentToPixel = (x, y) => ({
  x: (x / 100) * window.innerWidth,
  y: (y / 100) * window.innerHeight
})

function isPointInPolygon(p, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function generateSafeTargetPoint() {
  const half = CAT_SIZE / 2
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const px = Math.random() * 100
    const py = Math.random() * 100
    if (!isPointInPolygon({ x: px, y: py }, polygon.value)) continue
    const pixel = percentToPixel(px, py)
    return {
      left: pixel.x - half,
      top: pixel.y - half
    }
  }
  return { left: 0, top: 0 }
}

/* ================= 猫咪行为 ================= */
function handleClick() {
  if (isMoving.value) return
  isMoving.value = true
  currentGif.value = runGif

  pos.value = generateSafeTargetPoint()

  setTimeout(() => {
    currentGif.value = idleGif
    isMoving.value = false
  }, MOVE_DURATION)
}

onMounted(() => {
  pos.value = generateSafeTargetPoint()
})

/* ================= 🌸 互动按钮 ================= */
const interactionBtn = ref({
  x: 310,
  y: 499,
  width: 203,
  height: 182,
  img: new URL('../assets/images/feed/button.png', import.meta.url).href
})

const toolsOpen = ref(false)
const toggleTools = () => (toolsOpen.value = !toolsOpen.value)

/* ================= 扇形工具 ================= */
const FAN_RADIUS = 140

const tools = [
  { name: 'foodA', label: '限定糖葫芦', icon: 'foodA.jpg', angle: -60 },
  { name: 'foodB', label: '专属进阶道具', icon: 'foodB.jpg', angle: -20 },
  { name: 'foodC', label: '元气恢复药剂', icon: 'foodC.jpg', angle: 20 }
].map(t => {
  const rad = (t.angle * Math.PI) / 180
  return {
    ...t,
    icon: new URL(`../assets/images/feed/${t.icon}`, import.meta.url).href,
    style: {
      '--dx': `${Math.cos(rad) * FAN_RADIUS}px`,
      '--dy': `${Math.sin(rad) * FAN_RADIUS}px`
    }
  }
})

function onToolClick(e, tool) {
  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  e.currentTarget.appendChild(ripple)
  setTimeout(() => ripple.remove(), 500)

  if (tool.name.startsWith('food')) {
    handleClick()
    toolsOpen.value = false
  }
}
</script>

<style scoped>
.home-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/images/home/home.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.cat-character {
  position: absolute;
  pointer-events: auto;
  z-index: 6;
  cursor: pointer;
  transition: top 1200ms linear, left 1200ms linear;
}

.cat-gif {
  width: 86px;
  height: 86px;
  image-rendering: auto;
  user-select: none;
}

.polygon-editor {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.nav-bar {
  height: calc(100vh / 7);
  width: 100%;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
}

.nav-item {
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.nav-item:hover {
  transform: scale(1.1);
}

.icon-img {
  height: 110%;
  max-width: 100%;
  object-fit: contain;
}

/* 🌸 互动按钮 */
.interaction-wrapper {
  position: absolute;
  z-index: 8;
}

.interaction-button img {
  width: 100%;
  height: 100%;
}

/* 扇形按钮 */
.fan-tool {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
  overflow: visible;
}

.fan-tool.open {
  opacity: 1;
  pointer-events: auto;
  transform:
    translate(
      calc(-50% + var(--dx)),
      calc(-50% + var(--dy))
    );
}

.fan-tool .ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 220, 180, 0.45);

  transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand 0.5s ease-out forwards;

  pointer-events: none;
}

@keyframes ripple-expand {
  to {
    transform: translate(-50%, -50%) scale(3.2);
    opacity: 0;
  }
}

.fan-tool img {
  width: 64px;
  height: 64px;
  border-radius: 50%;

  /* 🌸 日系可见性核心 */
  background: radial-gradient(
    circle at top,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.75)
  );

  padding: 6px; /* 让图片“嵌”在底里 */

  border: 2px solid rgba(255, 255, 255, 0.9);

  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.25),     /* 主阴影 */
    0 0 0 3px rgba(255, 240, 220, 0.6), /* 外发光 */
    inset 0 1px 2px rgba(255, 255, 255, 0.9);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;

  background-clip: padding-box;
}
.fan-tool:hover img {
  transform: scale(1.12);

  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.3),
    0 0 0 4px rgba(255, 220, 180, 0.75),
    inset 0 1px 3px rgba(255, 255, 255, 1);

  filter: brightness(1.05) saturate(1.1);
}



/* 日系 hover 提示 */
.tool-tip {
  position: absolute;
  left: 72px;          /* 👉 横向在按钮右侧 */
  top: 50%;
  transform: translateY(-50%) scale(0.95);
  padding: 6px 12px;

  font-size: 13px;
  color: #5b4a3c;
  white-space: nowrap;

  background: linear-gradient(
    180deg,
    #fffaf5,
    #fbeee2
  );

  border-radius: 14px;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);

  opacity: 0;
  pointer-events: none;

  transition:
    opacity 0.25s ease,
    transform 0.25s ease;

  filter: blur(0.2px);
}
.fan-tool:hover .tool-tip {
  opacity: 1;
  transform: translateY(-50%) scale(1);
  animation: jp-breathe 1.6s ease-in-out infinite;
}
@keyframes jp-breathe {
  0% {
    transform: translateY(-50%) scale(1) rotate(0deg);
  }
  30% {
    transform: translateY(-52%) scale(1.03) rotate(-0.6deg);
  }
  60% {
    transform: translateY(-50%) scale(1.01) rotate(0.6deg);
  }
  100% {
    transform: translateY(-50%) scale(1) rotate(0deg);
  }
}




</style>