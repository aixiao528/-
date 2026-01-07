<template>
  <div class="study-container">
    
    <!-- 阶段1: 选时间 (默认直接显示) -->
    <div v-if="stage === 'select'" class="card selection-box">
      <div class="card-header">
        <h2>🍅 开启专注</h2>
        <!-- 点击关闭回到主页 -->
        <button class="close-icon" @click="goHome">×</button>
      </div>
      <p>选择一个时长，进入心流状态吧！</p>
      
      <div class="buttons-grid">
        <button class="time-btn" @click="startFocus(25)">25 分钟</button>
        <button class="time-btn" @click="startFocus(40)">40 分钟</button>
        <button class="time-btn" @click="startFocus(60)">60 分钟</button>
      </div>

      <div class="custom-input">
        <input type="number" v-model="customTime" placeholder="输入分钟" />
        <button @click="startFocus(customTime)">开始</button>
      </div>
    </div>

    <!-- 阶段2: 专注进行中 (沉浸全屏) -->
    <div v-if="stage === 'running'" class="immersive-mode">
      <div class="circle-timer">{{ formatTime(timeLeft) }}</div>
      <div class="status-text">
        {{ isPaused ? '已暂停 (超过10分钟失败)' : '正在专注中...' }}
      </div>

      <div v-if="isPaused" class="pause-warning">
         自动放弃倒计时: {{ formatTime(pauseLimitLeft) }}
      </div>

      <div class="action-buttons">
        <button v-if="!isPaused" @click="pauseTimer" class="btn-pause">⏸ 暂停</button>
        <button v-else @click="resumeTimer" class="btn-resume">▶️ 继续</button>
        <button @click="giveUp" class="btn-giveup">🏳️ 放弃</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // 引入路由工具

const router = useRouter(); // 获取路由器实例

// === 模拟数据 ===
const myGold = ref(100);
const myExp = ref(0);

// === 状态 ===
const stage = ref('select');      // 默认为选择界面
const timeLeft = ref(0);
const isPaused = ref(false);
const pauseLimitLeft = ref(600);
const customTime = ref('');
let focusTimer = null;
let pauseTimerId = null;

// === 路由跳转 ===
const goHome = () => {
  resetAll();
  router.push('/'); // 返回主页
};

// === 逻辑方法 ===
const startFocus = (minutes) => {
  if (!minutes || minutes <= 0) {
    alert("请输入正确的时间！");
    return;
  }
  timeLeft.value = Math.floor(minutes * 60); 
  stage.value = 'running';
  isPaused.value = false;
  pauseLimitLeft.value = 600;
  startTicker();
};

const startTicker = () => {
  clearInterval(focusTimer);
  focusTimer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      success();
    }
  }, 1000);
};

const pauseTimer = () => {
  isPaused.value = true;
  clearInterval(focusTimer);
  clearInterval(pauseTimerId);
  pauseTimerId = setInterval(() => {
    if (pauseLimitLeft.value > 0) {
      pauseLimitLeft.value--;
    } else {
      giveUp();
      alert("暂停太久，专注失败！😭");
    }
  }, 1000);
};

const resumeTimer = () => {
  isPaused.value = false;
  clearInterval(pauseTimerId);
  startTicker();
};

const success = () => {
  resetAll();
  alert("🎉 专注完成！金币 +10，经验 +3");
  // 以后这里接 Store
  goHome(); // 成功后回主页
};

const giveUp = () => {
  if(confirm("确定要放弃吗？没有任何奖励哦。")) {
    resetAll();
    goHome(); // 放弃后回主页
  }
};

const resetAll = () => {
  clearInterval(focusTimer);
  clearInterval(pauseTimerId);
  stage.value = 'select';
  isPaused.value = false;
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

onUnmounted(() => {
  resetAll();
});
</script>

<style scoped>
/* 全屏容器背景，防止透出其他内容 */
.study-container {
  width: 100vw; height: 100vh;
   background-image: url('@/assets/images/study/study_1.png');
  
  /* 让图片铺满屏幕，裁切掉多余部分 */
  background-size: cover; 
  
  /* 让图片居中显示 */
  background-position: center; 
  
  /* 防止图片重复平铺 */
  background-repeat: no-repeat;
  /* === 背景图设置结束 === */

  display: flex; 
  justify-content: center; 
  align-items: center;


 /* background-color: #f0f2f5; /* 只有这个页面是浅灰色背景 */
/*  display: flex; justify-content: center; align-items: center;*/
}

/* 选项卡片 */
.card {
  background: white; padding: 25px; border-radius: 16px;
  width: 90%; max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  text-align: center;
}

.card-header { display: flex; justify-content: space-between; align-items: center; }
.close-icon { background: none; border: none; font-size: 24px; cursor: pointer; }

.buttons-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 20px 0;
}
.time-btn {
  background: #fff3e0; border: 2px solid #ff9800; color: #ff9800;
  padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;
}
.time-btn:hover { background: #ff9800; color: white; }

/* 沉浸模式 */
.immersive-mode {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
   background-image: url('@/assets/images/study/study_2.jpg');
  background-color: rgba(255, 255, 255, 0.5); /* 半透明白色叠加 */
  /* 让图片铺满屏幕，裁切掉多余部分 */
  background-size: cover; 
  
  /* 让图片居中显示 */
  background-position: center; 
  
  /* 防止图片重复平铺 */
  background-repeat: no-repeat;
  /* === 背景图设置结束 === */

  display: flex; 
  justify-content: center; 
  align-items: center;
  /*background: #222; color: white; z-index: 100; /* 确保盖住所有东西 */
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.circle-timer { font-size: 80px; font-weight: bold; margin-bottom: 20px; color: #ff9800; }
.status-text { font-size: 18px; color: #aaa; margin-bottom: 10px;}
.pause-warning { color: #ff5252; font-weight: bold; margin-bottom: 20px; }
.action-buttons button { margin: 0 10px; padding: 10px 25px; font-size: 16px; cursor: pointer; border-radius: 50px; border:none;}
.btn-pause { background: #ffeb3b; color: #333; }
.btn-resume { background: #4caf50; color: white; }
.btn-giveup { background: transparent; border: 1px solid #666; color: #888; }
</style>