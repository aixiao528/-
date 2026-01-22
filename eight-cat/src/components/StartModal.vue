<!-- src/components/StartModal.vue -->
<script setup>
import { ref } from 'vue'
import startImg from '../assets/start.png'

// 1. 引入背景视频
// 请确保 src/assets/ 目录下有一个名为 bg.mp4 的文件
import bgVideo from '../assets/images/introduce/bg.mp4'

// 引入介绍图片
import intro1 from '../assets/images/introduce/intro1.jpg'
import intro2 from '../assets/images/introduce/intro2.jpg'
import intro3 from '../assets/images/introduce/intro3.jpg'


const emit = defineEmits(['start-game'])

// --- 状态管理 ---
const isBookMode = ref(false)
const currentBookPage = ref(0)
const bookPages = [intro1, intro2, intro3]

// --- 事件处理 ---
const handleStartBtn = () => {
  emit('start-game')
}

const openBook = () => {
  isBookMode.value = true
  currentBookPage.value = 0
}

const closeBook = () => {
  isBookMode.value = false
}

const nextBookPage = () => {
  if (currentBookPage.value < bookPages.length - 1) {
    currentBookPage.value++
  } else {
    currentBookPage.value = 0
  }
}
</script>

<template>
  <div class="modal-overlay">
    
    <!-- 2. 全屏循环视频背景 -->
    <!-- muted 是必须的，否则浏览器通常会阻止自动播放 -->
    <video class="fullscreen-video" autoplay loop muted playsinline>
      <source :src="bgVideo" type="video/mp4">
      您的浏览器不支持视频播放。
    </video>

    <!-- 3. 内容区域 (需要相对定位，确保浮在视频上面) -->
    
    <!-- 场景A: 正常开始界面 -->
    <div class="modal-content" v-if="!isBookMode">
      <img :src="startImg" alt="Start" class="start-image" />
      
      <div class="btn-group">
        <div class="btn-container" @click="handleStartBtn">
          <div class="comic-shadow"></div>
          <button class="comic-btn">开始</button>
        </div>
        <span class="about-text" @click="openBook">关于我们</span>
      </div>
    </div>

    <!-- 场景B: 绘本画框界面 -->
    <div class="book-overlay" v-else>
      <div class="picture-book-container" @click="nextBookPage">
        <div class="book-shadow"></div>
        <div class="book-frame">
          <div class="image-wrapper">
            <transition name="page-fade" mode="out-in">
              <img :key="currentBookPage" :src="bookPages[currentBookPage]" alt="Intro Page" />
            </transition>
          </div>
          <div class="page-indicator">
            <span v-for="(page, index) in bookPages" :key="index" class="dot" :class="{ active: index === currentBookPage }"></span>
          </div>
        </div>
      </div>
      <p class="hint-text">点击图片翻页</p>
      <button class="close-book-btn" @click="closeBook">返回</button>
    </div>

  </div>
</template>

<style scoped>
/* --- 布局容器 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 去掉了之前的背景色和模糊滤镜 */
}

/* --- 视频背景样式 --- */
.fullscreen-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：保持比例填满屏幕，不拉伸 */
  z-index: -1; /* 放在最底层 */
}

/* --- 内容公共样式 --- */
/* 确保内容在视频之上 */
.modal-content, .book-overlay {
  position: relative; 
  z-index: 10;
}

/* --- 下面保持你之前的样式不变 --- */

.modal-content {
  display: flex; flex-direction: column; align-items: center; gap: 30px;
  animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.start-image { max-width: 85vw; max-height: 55vh; object-fit: contain; }
.btn-group { display: flex; flex-direction: column; align-items: center; gap: 15px; }

/* 按钮样式 */
.btn-container { position: relative; width: 220px; height: 80px; cursor: pointer; }
.comic-shadow {
  position: absolute; top: 8px; left: 8px; width: 100%; height: 100%;
  border-radius: 60px; border: 3px solid #000; background-color: #fff; z-index: 1;
  background-image: repeating-linear-gradient(135deg, #000, #000 1px, transparent 1px, transparent 5px);
  transition: all 0.2s ease;
}
.comic-btn {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 60px; background: #D4EEFF; border: 3px solid #000; z-index: 2;
  font-family: 'ZCOOL KuaiLe', cursive, sans-serif; font-size: 2.8rem; color: #000; letter-spacing: 5px;
  display: flex; justify-content: center; align-items: center; pointer-events: none;
  transition: all 0.2s ease;
}
.btn-container:hover .comic-btn { transform: translate(-4px, -4px); background: #E6F7FF; }
.btn-container:active .comic-btn { transform: translate(0, 0); }

/* 关于我们文字 */
.about-text {
  font-family: 'ZCOOL KuaiLe', cursive, sans-serif; font-size: 1.2rem; color: #333; /* 颜色加深一点防止背景太花看不清 */
  cursor: pointer; position: relative; 
  text-shadow: 1px 1px 0 #fff; /* 加个白边防止视频背景太黑看不清 */
}
.about-text:hover { color: #000; }
.about-text::after {
  content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 2px;
  background-color: #000; transition: width 0.3s ease;
}
.about-text:hover::after { width: 100%; }

/* --- 绘本画框样式 --- */
.book-overlay {
  display: flex; flex-direction: column; align-items: center; gap: 15px;
  animation: fadeIn 0.4s ease;
}
.picture-book-container { position: relative; cursor: pointer; max-width: 90vw; }
.book-shadow {
  position: absolute; top: 12px; left: 12px; width: 100%; height: 100%;
  background-color: #fff; border: 3px solid #000; border-radius: 15px; z-index: 1;
  background-image: repeating-linear-gradient(135deg, #000, #000 1px, transparent 1px, transparent 6px);
}
.book-frame {
  position: relative; z-index: 2; background: #D4EEFF; border: 3px solid #000;
  border-radius: 15px; padding: 15px; display: flex; flex-direction: column;
  align-items: center; gap: 10px; transition: transform 0.2s ease;
}
.picture-book-container:hover .book-frame { transform: translate(-2px, -2px); }
.picture-book-container:active .book-frame { transform: translate(2px, 2px); }
.image-wrapper {
  background: #fff; border: 2px solid #000; border-radius: 8px; overflow: hidden;
  display: flex; justify-content: center; align-items: center; max-height: 60vh;
}
.image-wrapper img { display: block; max-width: 100%; max-height: 60vh; object-fit: contain; }
.page-indicator { display: flex; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #000; background: #fff; transition: all 0.3s; }
.dot.active { background: #000; transform: scale(1.2); }
.hint-text {
  font-family: 'ZCOOL KuaiLe', cursive, sans-serif; color: #333; margin: 0; font-size: 1rem;
  text-shadow: 1px 1px 0 #fff; /* 增加文字描边 */
}
.close-book-btn {
  font-family: 'ZCOOL KuaiLe', cursive, sans-serif; font-size: 1.4rem; background: #fff;
  border: 3px solid #000; padding: 6px 30px; border-radius: 30px; cursor: pointer;
  box-shadow: 4px 4px 0px #000; transition: transform 0.1s;
}
.close-book-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000; }

@keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s ease; }
.page-fade-enter-from, .page-fade-leave-to { opacity: 0; }
</style>