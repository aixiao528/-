<template>
  <div class="home-container">
    <!-- 底部导航区域 -->
    <nav class="nav-bar">
      <div 
        v-for="item in menuItems" 
        :key="item.name" 
        class="nav-item"
        @click="$router.push(item.path)"
      >
        <img :src="getImageUrl(item.icon)" :alt="item.name" class="icon-img" />
      </div>
    </nav>
  </div>
</template>

<script setup>
const menuItems = [
  { name: 'Shop', path: '/shop', icon: 'shop.png' },
  { name: 'Study', path: '/study', icon: 'study.png' },
  { name: 'Visit', path: '/visit', icon: 'visit.png' },
  { name: 'Gallery', path: '/gallery', icon: 'gallery.png' },
  { name: 'Chat', path: '/chat', icon: 'chat.png' }
];

// Vite 动态处理图片路径的方法
const getImageUrl = (name) => {
  return new URL(`../assets/images/home/${name}`, import.meta.url).href;
};
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  /* 背景图设置 */
  background-image: url('@/assets/images/home/home.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 将导航栏推到底部 */
  overflow: hidden;
}

.nav-bar {
  /* 关键：占画面高度的七分之一 */
  height: calc(100vh / 7); 
  width: 100%;
  
  backdrop-filter: blur(5px); /* 毛玻璃效果，可选 */
  
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
  transform: scale(1.1); /* 悬停轻微放大 */
}

.icon-img {
  /* 限制图片高度，确保五个图标大小一致 */
  height: 110%; 
  max-width: 100%;
  object-fit: contain;
}
</style>