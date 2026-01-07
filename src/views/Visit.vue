<template>
  <div class="visit-container">
    
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="goHome">🏠 返回八条家</button>
      <div class="location-tag">📍 淑熊(ShuXiong)的家</div>
    </div>

    <!-- 这里的图片逻辑你可以之后再加，现在保持粉色背景 -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'; // 引入路由

const router = useRouter(); 

// 修改返回逻辑：使用路由跳转
const goHome = () => {
  router.push('/'); 
};
</script>

<style scoped>
.visit-container {
  width: 100vw; height: 100vh;
  background-color: #fce4ec; /* 粉色背景 */
  display: flex; flex-direction: column;
}

.top-bar {
  position: absolute; top: 20px; left: 20px; right: 20px;
  display: flex; justify-content: space-between; align-items: center;
  z-index: 10;
}

.back-btn {
  padding: 10px 20px; background: white; border: 2px solid #ec407a; 
  color: #ec407a; border-radius: 20px; cursor: pointer; font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.back-btn:hover { transform: translateY(-2px); }

.location-tag {
  background: rgba(255,255,255,0.8); padding: 8px 18px; border-radius: 15px;
  font-weight: bold; color: #880e4f;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>