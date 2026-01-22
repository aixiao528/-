<template>
  <div class="home-container">
    <!-- 游戏场景容器 -->
    <div class="game-scene" :style="sceneStyle">
      <img src="@/assets/images/home/home.jpg" class="bg-img" draggable="false" />
      
      <!-- 多边形可视化编辑层 -->
      <svg class="polygon-editor" viewBox="0 0 100 100" preserveAspectRatio="none" @mousedown="addNewPoint">
        <polygon :points="polygonPoints" fill="rgba(255, 100, 100, 0.2)" stroke="red" stroke-width="2" />
        <circle
          v-for="(point, index) in polygon"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="1"
          fill="blue"
          stroke="white"
          stroke-width="0.5"
          class="anchor-point"
          @mousedown.stop="startDrag(index, $event)"
        />
      </svg>

      <!-- 猫咪 -->
      <div
        class="cat-character"
        :style="{ top: pos.top + '%', left: pos.left + '%' }"
        @click="handleClick"
      >
        <img :src="currentGif" class="cat-gif" />
      </div>

      <!-- 互动按钮 + 扇形工具 -->
      <div
        class="interaction-wrapper"
        :style="{ left: interactionBtn.x + '%', top: interactionBtn.y + '%', width: interactionBtn.width + '%' }"
      >
        <div class="interaction-button" @click="toggleTools">
          <img :src="interactionBtn.img" draggable="false" />
        </div>
        <div
          v-for="tool in tools"
          :key="tool.name"
          class="fan-tool"
          :class="{ open: toolsOpen }"
          :style="tool.style"
          @click.stop="onToolClick($event, tool)"
          @mousedown.prevent
          @dragstart.prevent
        >
          <img :src="tool.icon" draggable="false" />
          <div class="tool-tip">{{ tool.label }}</div>
        </div>
      </div>
      
    </div>

    <!-- 状态栏 -->
    <div class="status-wrapper">
      <div class="status-bar">
        <span>💰 {{ game.coins }}</span>
        <span>😊 {{ game.mood }}</span>
        <span>🍗 {{ 100 - game.hunger }}</span>
      </div>
    </div>

    <!-- 背包 -->
    <div class="vertical-backpack">
      <span class="backpack-title">🎒</span>
      <div class="backpack-list">
        <div v-if="backpackItems.length === 0" class="empty-tip">空空</div>
        <div
          v-else
          v-for="item in backpackItems"
          :key="item.key"
          class="backpack-item"
        >
          <img :src="item.img" :alt="item.name" class="backpack-icon" />
          <span class="item-count">×{{ item.count }}</span>
        </div>
      </div>
    </div>

    <!-- 黑色Toast提示 -->
    <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>

    <!-- 心情弹窗 -->
    <transition name="popup-fade">
      <div v-if="moodPopupText" key="mood-popup" class="status-popup mood">
        {{ moodPopupText }}
      </div>
    </transition>

    <!-- 导航栏 -->
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useRoute } from 'vue-router'

const game = useGameStore()
const router = useRouter()
const route = useRoute()

/* ================= 场景缩放逻辑 ================= */
const BG_WIDTH = 1920
const BG_HEIGHT = 1080
const BG_RATIO = BG_WIDTH / BG_HEIGHT
const windowSize = ref({ w: window.innerWidth, h: window.innerHeight })
const updateWindowSize = () => {
  windowSize.value = { w: window.innerWidth, h: window.innerHeight }
}
const sceneStyle = computed(() => {
  const winRatio = windowSize.value.w / windowSize.value.h
  if (winRatio > BG_RATIO) {
    return { width: '100vw', height: 'auto' }
  } else {
    return { width: 'auto', height: '100vh' }
  }
})

/* ================= 常量 ================= */
const CAT_SIZE_PERCENT = 8
const MOVE_DURATION = 1200
const MAX_ATTEMPTS = 100

/* ================= 猫咪 ================= */
const pos = ref({ top: 50, left: 50 })
const isMoving = ref(false)
const idleGif = new URL('../assets/images/cat/jumping.gif.jpg', import.meta.url).href
const runGif = new URL('../assets/images/cat/run.gif.jpg', import.meta.url).href
const cryingGif = new URL('../assets/images/cat/cryin.gif.jpg', import.meta.url).href

// 心情值切换GIF逻辑
const currentGif = computed(() => {
  if (isMoving.value) return runGif
  return game.mood >= 60 ? idleGif : cryingGif
})

/* ================= 弹窗逻辑 ================= */
const toastMsg = ref('')
const moodPopupText = ref('') 

watch(
  () => game.mood,
  async (newVal, oldVal) => {
    console.log('心情值变化：', oldVal, '→', newVal)
    if (oldVal < 60 && newVal >= 60) {
      await nextTick()
      showToast('八条开心起来啦～😊')
    }
  },
  { immediate: true }
)

/* ================= 多边形锚点数据 ================= */
const polygon = ref([
  { "x": 12.604, "y": 72.833 },
  { "x": 11.354, "y": 67.646 },
  { "x": 19.948, "y": 49.768 },
  { "x": 20.469, "y": 41.431 },
  { "x": 25.069, "y": 37.091 },
  { "x": 32.014, "y": 38.182 },
  { "x": 35.764, "y": 40.848 },
  { "x": 35.764, "y": 51.273 },
  { "x": 40.417, "y": 51.636 },
  { "x": 42.153, "y": 42.545 },
  { "x": 44.219, "y": 39.022 },
  { "x": 48.542, "y": 39.022 },
  { "x": 47.778, "y": 61.576 },
  { "x": 52.153, "y": 61.455 },
  { "x": 52.431, "y": 77.455 },
  { "x": 39.844, "y": 76.816 },
  { "x": 41.198, "y": 62.366 },
  { "x": 32.083, "y": 56.345 },
  { "x": 21.875, "y": 61.347 },
  { "x": 18.802, "y": 73.667 }
])

// 拖拽相关方法
const draggingIndex = ref(-1)
const polygonPoints = computed(() => polygon.value.map(p => `${p.x},${p.y}`).join(' '))
const logPolygonData = () => {
  const formatted = JSON.stringify(polygon.value, null, 2)
  console.log('当前多边形锚点数据：\n', formatted)
}
watch(polygon, logPolygonData, { deep: true, immediate: true })
const convertMouseToSvgPercent = (e) => {
  const svg = document.querySelector('.polygon-editor')
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  return { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) }
}
const startDrag = (index, e) => {
  draggingIndex.value = index
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}
const onDrag = (e) => {
  if (draggingIndex.value === -1) return
  const { x, y } = convertMouseToSvgPercent(e)
  polygon.value[draggingIndex.value] = { x, y }
}
const stopDrag = () => {
  draggingIndex.value = -1
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
const addNewPoint = (e) => {
  if (e.target.classList.contains('anchor-point')) return
  const { x, y } = convertMouseToSvgPercent(e)
  polygon.value.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) })
}

/* ================= 导航 ================= */
const menuItems = [
  { name: 'Shop', path: '/shop', icon: 'shop.png' },
  { name: 'Study', path: '/study', icon: 'study.png' },
  { name: 'Visit', path: '/visit', icon: 'visit.png' },
  { name: 'Gallery', path: '/gallery', icon: 'gallery.png' },
  { name: 'Chat', path: '/chat', icon: 'chat.png' }
]
const getImageUrl = name => new URL(`../assets/images/home/${name}`, import.meta.url).href

/* ================= 工具函数 ================= */
function isPointInPolygon(p, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}
function generateSafeTargetPoint() {
  const half = CAT_SIZE_PERCENT / 2
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const px = Math.random() * 100
    const py = Math.random() * 100
    if (!isPointInPolygon({ x: px, y: py }, polygon.value)) continue
    return { left: px - half, top: py - half }
  }
  return { left: 50, top: 50 }
}

/* ================= 猫咪行为 ================= */
function handleClick() {
  if (isMoving.value) return
  isMoving.value = true
  pos.value = generateSafeTargetPoint()
  setTimeout(() => {
    isMoving.value = false
  }, MOVE_DURATION)
}

/* ================= 互动按钮 + 扇形工具 ================= */
const interactionBtn = ref({ x: 29, y: 72, width: 15, img: new URL('../assets/images/feed/button.png', import.meta.url).href })
const toolsOpen = ref(false)
const toggleTools = () => (toolsOpen.value = !toolsOpen.value)
const FAN_RADIUS = 140
const tools = [
  { name: 'foodA', label: '限定糖葫芦', icon: 'foodA.jpg', angle: -60 },
  { name: 'foodB', label: '专属进阶道具', icon: 'foodB.jpg', angle: -20 },
  { name: 'foodC', label: '元气恢复药剂', icon: 'foodC.jpg', angle: 20 }
].map(t => {
  const rad = (t.angle * Math.PI) / 180
  return { ...t, icon: new URL(`../assets/images/feed/${t.icon}`, import.meta.url).href, style: { '--dx': `${Math.cos(rad) * FAN_RADIUS}px`, '--dy': `${Math.sin(rad) * FAN_RADIUS}px` } }
})

/* 背包计算属性 */
const backpackItems = computed(() =>
  Object.entries(game.items)
    .filter(([key, count]) => count > 0)
    .map(([key, count]) => ({ key, name: key, count, img: new URL(`../assets/images/feed/${key}.jpg`, import.meta.url).href }))
)

/* 🌟 核心：道具点击逻辑  */
function onToolClick(e, tool) {
  e.stopPropagation()
  e.preventDefault()
  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  e.currentTarget.appendChild(ripple)
  setTimeout(() => ripple.remove(), 500)
  if (tool.name.startsWith('food')) {
    const ok = game.useItem(tool.name)
    
    moodPopupText.value = `😊 心情 +10`;
    setTimeout(() => moodPopupText.value = '', 2500);
    toolsOpen.value = false;
    
    if (!ok) {
      showToast(`${tool.label} 数量不足😥`)
    }
  }
}


const showToast = msg => {
  toastMsg.value = msg
  setTimeout(() => (toastMsg.value = ''), 2000)
}

/* ================= 生命周期 ================= */
onMounted(() => {
  window.addEventListener('resize', updateWindowSize)
  pos.value = generateSafeTargetPoint()
  
  // 初始不开心提示 → 黑色Toast
  if (game.mood < 60) {
    showToast('八条有点不开心😢，快喂点零食哄哄它吧！')
  }
  
  // 邻居家返回 → 黑色Toast
  if (route.query.from === 'neighbor') {
    showToast('从邻居家回来啦，心情+10！')
    game.interactWithNeighbor()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap');


.status-popup {
  position: fixed; 
  top: 20%; 
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  z-index: 9999; 
  /* 毛玻璃核心属性 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.7);
}
/* 心情弹窗专属柔粉系样式 */
.status-popup.mood {
  background: rgba(255, 228, 236, 0.6);
  color: #e91e63;
}
/* 弹窗灵动进出动画  */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.popup-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, 15px) scale(0.9);
}
.popup-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}


</style>


<style scoped>
.home-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "ZCOOL KuaiLe", cursive, sans-serif;
}

.game-scene {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.bg-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
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
.polygon-editor polygon {
  fill: transparent;
  stroke: transparent;
}
.polygon-editor .anchor-point {
  display: none;
}

.cat-character {
  position: absolute;
  z-index: 990;
  cursor: pointer;
  transition: top 1200ms linear, left 1200ms linear;
  transform: translate(-50%, -50%);
}

.cat-gif {
  width: 86px; 
  height: 86px;
  image-rendering: auto;
  user-select: none;
}

.interaction-wrapper {
  position: absolute;
  z-index: 8;
  transform: translate(-50%, -50%);
}

.interaction-button img {
  width: 100%;
  height: auto;
  display: block;
}

.nav-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: calc(100vh / 7);
  width: 100%;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  z-index: 100;
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

.fan-tool {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 64px;
  height: 64px;
  transform: translate(-50%, -50%);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
  z-index: 991;
}

.fan-tool.open {
  opacity: 1;
  pointer-events: auto;
  transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)));
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
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.75));
  padding: 6px; 
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25), 0 0 0 3px rgba(255, 240, 220, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  background-clip: padding-box;
  user-select: none;
}

.fan-tool:hover img {
  transform: scale(1.12);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(255, 220, 180, 0.75), inset 0 1px 3px rgba(255, 255, 255, 1);
  filter: brightness(1.05) saturate(1.1);
}

.tool-tip {
  position: absolute;
  left: 72px;
  top: 50%;
  transform: translateY(-50%) scale(0.95);
  padding: 6px 12px;
  font-size: 13px;
  color: #5b4a3c;
  white-space: nowrap;
  background: linear-gradient(180deg, #fffaf5, #fbeee2);
  border-radius: 14px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
  filter: blur(0.2px);
}

.fan-tool:hover .tool-tip {
  opacity: 1;
  transform: translateY(-50%) scale(1);
  animation: jp-breathe 1.6s ease-in-out infinite;
}

@keyframes jp-breathe {
  0% { transform: translateY(-50%) scale(1) rotate(0deg); }
  30% { transform: translateY(-52%) scale(1.03) rotate(-0.6deg); }
  60% { transform: translateY(-50%) scale(1.01) rotate(0.6deg); }
  100% { transform: translateY(-50%) scale(1) rotate(0deg); }
}

.status-wrapper {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.status-bar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 6px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  gap: 16px;
  pointer-events: none;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.vertical-backpack {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 12px 16px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.backpack-title {
  font-size: 24px;
  font-weight: bold;
  color: #5d4037;
}

.backpack-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: visible;
}

.empty-tip {
  font-size: 16px;
  color: #8d6e63;
  font-weight: 500;
  padding: 10px 0;
}

.backpack-item {
  position: relative;
  display: flex;
  align-items: center;
}

.backpack-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.75));
  padding: 6px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background-clip: padding-box;
  user-select: none;
  object-fit: contain;
}

.backpack-icon:hover {
  transform: scale(1.12);
  filter: brightness(1.05) saturate(1.1);
  transition: all 0.2s ease;
}

.item-count {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #e9c3e2;
  color: white;
  font-size: 14px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 12px;
  border: 2px solid white;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  z-index: 1;
}


.toast {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 16px;
  z-index: 200;
  animation: toast-fade 2s ease-in-out forwards;
}

@keyframes toast-fade {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  90% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}
</style>