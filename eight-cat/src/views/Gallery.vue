<template>
  <div class="gallery-container">
    
    <!-- 头部 -->
    <header>
      <!-- 返回按钮：保持结构，适配蓝色界面 -->
      <button class="nav-btn" @click="$router.push('/')">
        <span class="btn-icon">🏠</span>
        <span class="btn-text">返回首页</span>
      </button>
      
      <h1 class="main-title">八条绘本馆</h1>
      <p class="sub-title">打开一本心爱的故事开始阅读吧</p>
    </header>

    <!-- 封面展示网格  -->
    <main class="gallery-grid">
      <div 
        v-for="(book, index) in books" 
        :key="index"
        class="book-card" 
        @click="openBook(index)"
      >
        <!-- 封面图 -->
        <img :src="getCoverUrl(book.coverName)" :alt="book.title" class="book-cover">
        <div class="book-title">{{ book.icon }} {{ book.title }}</div>
      </div>
    </main>

    <!-- 灯箱预览  -->
    <div v-if="lightbox.active" class="lightbox active" @click.self="closeLightbox">
      <span class="close-btn" @click="closeLightbox">&times;</span>
      
      <!-- 左箭头 -->
      <div class="nav-arrow left" @click="prevPage">&#10094;</div>
      
      <!-- 中间内容区 -->
      <div class="lightbox-stage">
        <!-- 动态计算当前页的图片路径，增加key触发每次切换的动画 -->
        <img 
          id="lightbox-img" 
          :src="getCurrentPageUrl()" 
          :key="`${lightbox.bookIdx}-${lightbox.pageIdx}`"
          alt="绘本内容"
        >
        <div class="page-info">
          <span id="book-name-display">{{ books[lightbox.bookIdx].title }}</span>
          <!-- 显示 1/3 -->
          (<span id="page-num-display">{{ lightbox.pageIdx }} / {{ books[lightbox.bookIdx].count }}</span>)
        </div>
      </div>

      <!-- 右箭头 -->
      <div class="nav-arrow right" @click="nextPage">&#10095;</div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// === 1. 数据配置 ===
const books = [
  { title: "沙糖桔", icon: "✨", coverName: "cover1.jpg", pathPrefix: "book1/1_", count: 3 },
  { title: "换毛",   icon: "🪶", coverName: "cover2.jpg", pathPrefix: "book2/2_", count: 3 },
  { title: "朋友",   icon: "🧑‍🤝‍🤝‍🧑", coverName: "cover3.jpg", pathPrefix: "book3/3_", count: 3 },
  { title: "样子",   icon: "🍀", coverName: "cover4.jpg", pathPrefix: "book4/4_", count: 3 },
  { title: "对视",   icon: "👀", coverName: "cover5.jpg", pathPrefix: "book5/5_", count: 3 },
  { title: "睡觉",   icon: "💤", coverName: "cover6.jpg", pathPrefix: "book6/6_", count: 4 }
];

// 灯箱状态
const lightbox = reactive({
  active: false,
  bookIdx: 0, 
  pageIdx: 1  
});

// === 2. 路径处理工具函数 ===
const getCoverUrl = (name) => {
  return new URL(`../assets/images/gallery/covers/${name}`, import.meta.url).href;
};

const getCurrentPageUrl = () => {
  const book = books[lightbox.bookIdx];
  const relativePath = `../assets/images/gallery/pages/${book.pathPrefix}${lightbox.pageIdx}.jpg`;
  return new URL(relativePath, import.meta.url).href;
};

// === 3. 交互逻辑 ===
const openBook = (index) => {
  lightbox.bookIdx = index;
  lightbox.pageIdx = 1; 
  lightbox.active = true;
  document.body.style.overflow = 'hidden'; 
};

const closeLightbox = () => {
  lightbox.active = false;
  document.body.style.overflow = 'auto'; 
};

const nextPage = () => {
  const currentBook = books[lightbox.bookIdx];
  lightbox.pageIdx++;
  if (lightbox.pageIdx > currentBook.count) {
    lightbox.pageIdx = 1; 
  }
};

const prevPage = () => {
  const currentBook = books[lightbox.bookIdx];
  lightbox.pageIdx--;
  if (lightbox.pageIdx < 1) {
    lightbox.pageIdx = currentBook.count; 
  }
};

// === 4. 键盘事件监听 ===
const handleKeydown = (e) => {
  if (!lightbox.active) return;
  if (e.key === "ArrowRight") nextPage();
  if (e.key === "ArrowLeft") prevPage();
  if (e.key === "Escape") closeLightbox();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* 引入快乐体 */
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap');

/* 全局容器：对应 body 的背景 */
.gallery-container {
  height: 80vh;              
  overflow-y: auto;           
  overflow-x: hidden;         

  background: url('@/assets/images/gallery/background.jpg') no-repeat center center fixed;
  background-size: cover;
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
  color: #4a90e2;

  background-color: rgba(255, 255, 255, 0.3);
  padding: 50px 20px 1000px;
  position: relative;
  
  /* 滚动条美化 - 容器基础设置 */
  scrollbar-width: thin; /* 火狐 */
  scrollbar-color: #a2d2ff rgba(255,255,255,0.2); /* 火狐 滑块/轨道 */
}

.gallery-container::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.4));
  pointer-events: none;
  z-index: 0;
}

/* ========== 核心优化：自定义滚动条样式  ========== */
.gallery-container::-webkit-scrollbar {
  width: 12px; 
}

.gallery-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px; 
  margin: 20px 0; 
}

.gallery-container::-webkit-scrollbar-thumb {
  background: #a2d2ff; 
  border-radius: 10px; 
  border: 3px solid rgba(255, 255, 255, 0.2); 
  transition: all 0.3s ease; 
}

.gallery-container::-webkit-scrollbar-thumb:hover {
  background: #7cb7f5; 
  transform: scale(1.05); 
  box-shadow: 0 0 8px rgba(162, 210, 255, 0.8); 
}

/* ========== UI优化：头部样式增强 ========== */
header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
 
  animation: headerFadeIn 1s ease-out;
}


.main-title {
  font-size: 3rem;
  color: #4a90e2; 
  text-shadow: 3px 3px 0px white; 
  margin-bottom: 10px;
}


.sub-title {
  background: rgba(255, 255, 255, 0.9);
  display: inline-block;
  padding: 8px 25px;
  border-radius: 25px;
  font-size: 1.1rem;
  color: #4a90e2;
  box-shadow: 0 4px 12px rgba(162, 210, 255, 0.3);
  transition: all 0.3s ease;
}

.sub-title:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(162, 210, 255, 0.5);
}


.nav-btn {
  position: absolute;
  top: 0;
  left: 0;
  padding: 12px 24px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 0 0 1px rgba(74, 144, 226, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
  color: #4a90e2;
  border: none;
  outline: none;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: inset 0 0 0 1px rgba(74, 144, 226, 0.4),
              0 6px 12px rgba(74, 144, 226, 0.3);
  transform: translateY(-2px);
  color: #3a80d2;
}

/* 按钮点击反馈 */
.nav-btn:active {
  transform: translateY(0);
  box-shadow: inset 0 0 0 1px rgba(74, 144, 226, 0.4),
              0 2px 6px rgba(74, 144, 226, 0.3);
}

.btn-icon {
  font-size: 20px;
  color: #4a90e2;
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
}

.btn-text {
  color: #4a90e2;
  font-weight: bold;
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
}

.nav-btn:hover .btn-icon,
.nav-btn:hover .btn-text {
  color: #3a80d2;
}

/* ========== 网格布局 & 卡片优化 ========== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

/* 绘本卡片：果冻弹跳，加载淡入动画 */
.book-card {
  background: white;
  border: 5px solid #a2d2ff;
  border-radius: 25px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
              box-shadow 0.5s ease;
   box-shadow: 
    0 8px 15px rgba(0,0,0,0.1),
    0 0 30px rgba(162, 210, 255, 0.2) inset;
  transition: all 0.5s ease;
  /* 卡片加载淡入动画 */
  animation: cardFadeIn 0.8s ease-out;
}



.book-card:hover {
  transform: translateY(-20px) scale(1.08) rotate(2deg);
    box-shadow:
    0 25px 50px rgba(162, 210, 255, 0.5),
    0 0 40px rgba(162, 210, 255, 0.3) inset;
  z-index: 10;
}

/* 封面图片增加轻微缩放动画 */
.book-cover {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover {
  transform: scale(1.03); /* 封面轻微放大 */
    transform: scale(1.05) rotate(1.5deg);
  box-shadow: 0 0 20px rgba(162, 210, 255, 0.4);
}

.book-title {
  padding: 15px;
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  background: #fdfdfd;
  border-top: 2px solid #f0f8ff;
}

/* ========== 灯箱样式优化 ========== */
.lightbox {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999;
  display: flex; 
  justify-content: space-around;
  align-items: center;
  animation: fadeIn 0.3s;
}

/* 灯箱中间区域居中显示图片和页码 */
.lightbox-stage {
  display: flex;
  flex-direction: column;      /* 垂直排列：图片在上，页码在下 */
  align-items: center;         /* 水平居中 */
  justify-content: center;     /* 垂直居中 */
  position: relative;
  max-width: 80%;
  text-align: center;          /* 确保页码文本居中 */
  gap: 15px;                   /* 图片与页码间距 */
}

/* 灯箱图片 */
#lightbox-img {
  max-width: 100%;
  max-height: 80vh;
  border: 8px solid white;
  border-radius: 10px;
  box-shadow: 0 0 40px rgba(255,255,255,0.2),
              0 0 80px rgba(162, 210, 255, 0.1);
  animation: popUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: block;               
}

/* 页码信息居中显示在图片下方 */
.page-info {
  color: white;
  font-size: 1.2rem;
  padding: 8px 20px;
  border-radius: 20px;
  background: rgba(0,0,0,0.5);
  display: block;              
  text-align: center;          
}

#book-name-display { 
  color: #a2d2ff; 
  margin-right: 10px; 
  font-size: 1.3rem;
}

/* 导航箭头优化 */
.nav-arrow {
  color: white;
  font-size: 60px;
  cursor: pointer;
  user-select: none;
  padding: 20px;
  transition: all 0.3s ease;
  opacity: 0.8;
  text-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.nav-arrow:hover { 
  color: #a2d2ff; 
  opacity: 1;
  transform: scale(1.1);
  text-shadow: 0 0 20px rgba(162, 210, 255, 0.8);
}

/* 关闭按钮优化 */
.close-btn {
  position: absolute;
  top: 30px;
  right: 40px;
  color: white;
  font-size: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.close-btn:hover {
  color: #ff6b6b;
  transform: scale(1.1) rotate(90deg);
  opacity: 1;
  text-shadow: 0 0 15px rgba(255, 107, 107, 0.8);
}

/* ========== 动画定义 ========== */

@keyframes fadeIn { 
  from { opacity: 0; transform: scale(0.9); } 
  to { opacity: 1; transform: scale(1); } 
}

@keyframes popUp { 
  from { transform: scale(0.8); } 
  to { transform: scale(1); } 
}

/* 头部淡入 */
@keyframes headerFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 卡片淡入 */
@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}



/* 移动端适配 */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  .book-card img { height: auto; }
  .main-title { font-size: 2.2rem; }
  .nav-arrow { font-size: 40px; }
  .close-btn { font-size: 40px; }
}
</style>