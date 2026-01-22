<!-- src/App.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // 新增：路由钩子控制加载状态
import StartModal from './components/StartModal.vue'
import loadingIconImg from '@/assets/images/cat/jumping.gif.jpg'

// 保留原有开局封面逻辑：sessionStorage 记录是否首次打开
const showModal = ref(!sessionStorage.getItem('gameStarted'))
// 新增：加载状态（极端情况替代白屏）
const isLoading = ref(false)

const router = useRouter()
const handleStartGame = () => {
  showModal.value = false
  sessionStorage.setItem('gameStarted', 'true')
}

// 新增：路由跳转时显示加载状态（避免白屏）
router.beforeEach(() => {
  // 只有开局封面关闭后，跳转才显示加载（避免封面和加载重叠）
  if (!showModal.value) {
    isLoading.value = true
  }
})
router.afterEach(() => {
  // 轻微延迟，避免加载状态闪屏
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})
</script>

<template>
  <!-- 👇 核心优化1：路由容器 + 加载状态（替代白屏） -->
  <div class="app-container">
    <!-- 路由视图：保留原有v-slot逻辑，优化过渡动画 -->
    <router-view v-slot="{ Component }">
      <transition name="router-fade" mode="out-in">
        <component :is="Component" v-if="!isLoading" />
      </transition>
    </router-view>
  </div>

  <!-- 加载提示：自定义图片图标 -->
  <div v-if="isLoading && !showModal" class="loading-mask">
    <!-- 替换为 img 标签，绑定自定义图片 -->
    <img class="loading-icon" :src="loadingIconImg" alt="加载中" />
    <div class="loading-text">八条正在加载中...</div>
  </div>

  <!-- 保留原有开局封面的过渡逻辑 -->
  <Transition name="fade">
    <StartModal 
      v-if="showModal" 
      @start-game="handleStartGame" 
    />
  </Transition>
</template>

<style>
/* 全局样式重置 + 兜底背景（核心：消除白屏） */
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  /* 核心优化：添加全局兜底背景，替代白屏 */
  background-color: #f8f8f8; 
  /* 保留：不设置overflow:hidden，避免滚动问题 */
}

/* 容器兜底：确保路由视图占满屏幕 */
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 优化路由过渡动画：淡入淡出 + 轻微位移，更丝滑，无白屏感 */
.router-fade-enter-active, 
.router-fade-leave-active {
  /* 缓动曲线：比ease更丝滑，掩盖切换间隙 */
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); 
}
.router-fade-enter-from {
  opacity: 0;
  transform: translateX(10px); /* 轻微右进，自然 */
}
.router-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px); /* 轻微左出，自然 */
}

/* 保留原有开局封面的过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 加载提示样式：替代跳转时的白屏（可爱风，匹配游戏风格） */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f8f8f8; /* 和全局背景统一，无反差 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 高于所有内容，避免被遮挡 */
  font-family: "ZCOOL KuaiLe", cursive; /* 匹配游戏字体 */
}
.loading-icon {
  font-size: 60px;
  animation: bounce 1.5s infinite alternate;
}
.loading-text {
  margin-top: 20px;
  font-size: 18px;
  color: #666;
}
@keyframes bounce {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
</style>