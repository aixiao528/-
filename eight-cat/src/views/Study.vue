<template>
  <div class="study-container">
    <!-- 阶段1: 选时间 (默认显示) -->
    <div v-if="stage === 'select'" class="card selection-box">
      <div class="card-header">
        <h2>🍅 开启专注</h2>
        <button class="close-icon" @click="goHome" title="返回主页">×</button>
      </div>
      <p class="subtitle">选择一个时长，进入心流状态吧！</p>
      
      <div class="buttons-grid">
        <button class="time-btn" @click="startFocus(25)">
          <span class="btn-icon">☕</span> 25 分钟
        </button>
        <button class="time-btn" @click="startFocus(40)">
          <span class="btn-icon">📚</span> 40 分钟
        </button>
        <button class="time-btn" @click="startFocus(60)">
          <span class="btn-icon">🔥</span> 60 分钟
        </button>
      </div>

      <div class="custom-input-group">
        <input type="number" v-model="customTime" placeholder="自定义分钟..." />
        <button class="start-btn" @click="startFocus(customTime)">GO</button>
      </div>
    </div>

    <!-- 阶段2: 专注进行中 (沉浸全屏) -->
    <div v-if="stage === 'running'" class="immersive-mode">
      <!-- 计时器卡片 -->
      <div class="timer-card">
        <!-- 专注结算浮窗 -->
        <transition name="fade">
          <div v-if="coinPopupText" class="status-popup coin">
            {{ coinPopupText }}
          </div>
        </transition>
        <transition name="fade">
          <div v-if="hungerPopupText" class="status-popup hunger">
            {{ hungerPopupText }}
          </div>
        </transition>
        <transition name="fade">
          <div v-if="moodPopupText" class="status-popup mood">
            {{ moodPopupText }}
          </div>
        </transition>

        <div class="card-label">专注进行中...</div>
        
        <!-- 倒计时数字 -->
        <div class="circle-timer" :class="{ 'paused': isPaused }">
          {{ formatTime(timeLeft) }}
        </div>

        <!-- 状态提示文字 -->
        <div class="status-text">
          <span v-if="!isPaused">保持专注，八条在陪你哦~ 🐱</span>
          <span v-else class="text-danger">已暂停 (超过10分钟将失败)</span>
        </div>

        <!-- 暂停倒计时警告 -->
        <div v-if="isPaused" class="pause-countdown">
           休息剩余: {{ formatTime(pauseLimitLeft) }}
        </div>

        <!-- 按钮组 -->
        <div class="action-buttons">
          <button v-if="!isPaused" @click="pauseTimer" class="btn btn-pause">
            ⏸ 暂停一下
          </button>
          
          <template v-else>
            <button @click="resumeTimer" class="btn btn-resume">
              ▶️ 继续专注
            </button>
            <button @click="giveUp" class="btn btn-giveup">
              🏳️ 放弃
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { storeToRefs } from 'pinia'; 

const router = useRouter();
const game = useGameStore();

// 用storeToRefs解构，保留响应式
const { coins, hunger, mood } = storeToRefs(game);

// 状态
const stage = ref('select');
const timeLeft = ref(0);
const isPaused = ref(false);
const pauseLimitLeft = ref(600);
const customTime = ref('');
let focusTimer = null;
let pauseTimerId = null;

// 记录本次专注分钟数
const focusMinutes = ref(0);

// 状态浮窗文本
const coinPopupText = ref('');
const hungerPopupText = ref('');
const moodPopupText = ref('');

// 路由跳转
const goHome = () => {
  resetAll();
  router.push('/');
};

// 逻辑方法
const startFocus = (minutes) => {
  if (!minutes || minutes <= 0) {
    alert("请输入正确的时间！");
    return;
  }

  focusMinutes.value = Number(minutes);
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
      clearInterval(focusTimer);
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
  clearInterval(focusTimer);
  const minutes = focusMinutes.value;

// 调用 Store 封装的 finishStudy 方法
  game.finishStudy(minutes); 

  const coinAdd = minutes * 10;
  const hungerAdd = minutes * 2;
  const moodAdd = 3;

  // 显示浮窗
  coinPopupText.value = `🪙 金币 +${coinAdd}`;
  hungerPopupText.value = `🍗 饥饿 +${hungerAdd}`;
  moodPopupText.value = `😊 心情 +${moodAdd}`;

  // 延长浮窗显示时间（2500ms），确保动画完成
  setTimeout(() => {
    coinPopupText.value = '';
    hungerPopupText.value = '';
    moodPopupText.value = '';
    resetAll();
    goHome();
  }, 2500);
};

const giveUp = () => {
  if(confirm("确定要放弃吗？没有任何奖励哦。")) {
    resetAll();
    goHome();
  }
};

const resetAll = () => {
  clearInterval(focusTimer);
  clearInterval(pauseTimerId);
  stage.value = 'select';
  isPaused.value = false;
  // 清空浮窗文本
  coinPopupText.value = '';
  hungerPopupText.value = '';
  moodPopupText.value = '';
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
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap');

/* 全局字体与重置 */
.study-container {
  width: 100vw; 
  height: 100vh;
  background-image: url('@/assets/images/study/study_1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  display: flex; 
  justify-content: center; 
  align-items: center;
  font-family: "ZCOOL KuaiLe", cursive, sans-serif;
  position: relative;
}

.study-container::before {
  content: '';
  position: absolute; inset: 0;
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none;
}

/* === 通用卡片样式 === */
.card, .timer-card {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 2px solid rgba(255, 255, 255, 0.8);
  text-align: center;
  width: 90%;
  max-width: 420px;
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* === 阶段1: 选择界面 === */
.card-header { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 10px;
}
.card-header h2 { color: #5d4037; margin: 0; font-size: 24px; }
.close-icon { 
  background: none; border: none; font-size: 28px; cursor: pointer; color: #888;
  transition: transform 0.2s;
}
.close-icon:hover { transform: rotate(90deg); color: #ff5252; }
.subtitle { color: #8d6e63; font-size: 14px; margin-bottom: 25px; }

.buttons-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;
}
.time-btn {
  background: #fff8e1; border: 2px solid #ffe0b2; color: #ff6f00;
  padding: 15px 10px; border-radius: 16px; cursor: pointer; 
  font-weight: bold; font-family: inherit; font-size: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  transition: all 0.2s;
}
.btn-icon { font-size: 20px; }
.time-btn:hover { 
  background: #ffecb3; transform: translateY(-3px); 
  box-shadow: 0 4px 10px rgba(255, 160, 0, 0.2);
}

.custom-input-group {
  display: flex; gap: 10px;
}
.custom-input-group input {
  flex: 1; padding: 12px; border-radius: 12px; border: 2px solid #eee;
  font-family: inherit; outline: none; text-align: center;
}
.custom-input-group input:focus { border-color: #ffca28; }
.start-btn {
  background: #ffca28; border: none; padding: 0 20px; border-radius: 12px;
  font-weight: bold; cursor: pointer; color: #5d4037;
  transition: transform 0.1s;
}
.start-btn:active { transform: scale(0.95); }

/* === 阶段2: 沉浸模式 === */
.immersive-mode {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background-image: url('@/assets/images/chat/1.png');
  background-size: cover; background-position: center;
  z-index: 999;
  display: flex; justify-content: center; align-items: center;
}

/* 计时器专用卡片 */
.timer-card {
  max-width: 380px;
  border: 4px solid #fff;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  padding-top: 30px;
}

.card-label {
  font-size: 14px; color: #8d6e63; margin-bottom: 10px; 
  letter-spacing: 2px; text-transform: uppercase;
}

.circle-timer { 
  font-size: 80px; font-weight: bold; 
  color: #ff7043; 
  text-shadow: 2px 2px 0px #fff;
  margin: 10px 0;
  font-variant-numeric: tabular-nums;
}
.circle-timer.paused { color: #bdbdbd; }

.status-text { font-size: 16px; color: #5d4037; margin-bottom: 25px; min-height: 24px;}
.text-danger { color: #e53935; font-weight: bold; animation: blink 1s infinite; }
.pause-countdown { 
  background: #ffebee; color: #c62828; padding: 5px 15px; 
  border-radius: 20px; display: inline-block; margin-bottom: 20px; 
  font-weight: bold; font-size: 14px;
}

/* 底部大按钮 */
.action-buttons {
  display: flex; justify-content: center; gap: 15px;
}
.btn {
  padding: 12px 30px; font-size: 16px; border-radius: 50px; 
  border: none; cursor: pointer; font-family: inherit; font-weight: bold;
  transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.btn-pause { background: #fff176; color: #5d4037; }
.btn-pause:hover { background: #ffee58; transform: scale(1.05); }

.btn-resume { background: #66bb6a; color: white; }
.btn-resume:hover { background: #4caf50; transform: scale(1.05); }

.btn-giveup { background: white; border: 2px solid #ef5350; color: #ef5350; }
.btn-giveup:hover { background: #ef5350; color: white; }

/* 动画 */
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes blink {
  50% { opacity: 0.5; }
}

/* === fade 过渡动画 === */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1); 
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(15px) scale(0.9); 
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.95); 
}

/* === 毛玻璃浮窗样式 === */
.status-popup {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 18px; 
  border-radius: 16px; 
  font-size: 15px; 
  font-weight: bold;
  white-space: nowrap;
  z-index: 200;
 
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.7); 
}

/* 金币浮窗 */
.status-popup.coin {
  top: -60px;
  background: rgba(255, 248, 225, 0.6);
  color: #ff8f00;
}

/* 饥饿浮窗  */
.status-popup.hunger {
  top: -100px;
  background: rgba(255, 224, 178, 0.6);
  color: #e65100;
}

/* 心情浮窗  */
.status-popup.mood {
  top: -140px;
  background: rgba(255, 228, 236, 0.6);
  color: #e91e63;
}
</style>