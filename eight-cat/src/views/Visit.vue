<template>
  <div class="visit-container" :style="{ backgroundImage: `url(${bgImg})` }">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <button class="nav-btn back-btn" @click="goHome">
        <span class="btn-icon">←</span>
        <span class="btn-text">返回八条家</span>
      </button>
      <button class="nav-btn home-btn" disabled>
        <span class="btn-icon">📍</span>
        <span class="btn-text">淑熊的家</span>
      </button>
    </div>

    <!-- 游戏主体区域 -->
    <div class="game-stage">
      <!-- 🌟 新增：心情增加弹窗（和study一致的毛玻璃弹窗） -->
      <transition name="fade">
        <div v-if="moodPopupText" class="status-popup mood">
          {{ moodPopupText }}
        </div>
      </transition>

      <!-- 角色容器：通过样式绑定随机位置 -->
      <div 
        class="character-wrapper" 
        :class="{ 
          'is-interacting': activeAction !== 'idle',
          'action-out': activeAction === 'out'
        }"
        :style="activeAction === 'out' ? {} : characterPositionStyle"
      >
        
        <!-- 1. 互动菜单：改为绝对定位，防止推挤角色 -->
        <transition name="pop">
          <div v-if="showMenu && activeAction === 'idle'" class="interaction-menu">
            <div class="comic-btn-wrap" @click="playAction('kiss')">
              <div class="comic-btn btn-kiss"><div class="btn-text">大亲一口</div></div>
            </div>
            <div class="comic-btn-wrap" @click="playAction('massage')">
              <div class="comic-btn btn-massage"><div class="btn-text">捶背</div></div>
            </div>
            <div class="comic-btn-wrap" @click="playAction('out')">
              <div class="comic-btn btn-out"><div class="btn-text">一起出去玩</div></div>
            </div>
          </div>
        </transition>

        <!-- 2. 反馈气泡：同样绝对定位 -->
        <transition name="fade">
          <div v-if="feedbackText" class="feedback-bubble">
            {{ feedbackText }}
          </div>
        </transition>

        <!-- 3. 角色本体 -->
        <div class="character-img" @click="toggleMenu" :class="{ 'character-clicked': showMenu }">
          <img :src="currentGif" alt="角色" />
          <div v-if="activeAction === 'idle'" class="click-hint">Click!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore'; // ⭐ 新增：引入游戏状态

import bgImg from '@/assets/images/visit/bg.jpg';
import idleGif from '@/assets/images/visit/淑熊.gif';
import kissGif from '@/assets/images/visit/大亲一口.gif';
import massageGif from '@/assets/images/visit/捶背.gif';
import outGif from '@/assets/images/visit/一起出去玩.gif';

const router = useRouter();
const game = useGameStore(); // ⭐ 新增：使用 gameStore

const activeAction = ref('idle');
const showMenu = ref(false);
const feedbackText = ref('');
const characterPositionStyle = ref({ bottom: '22%', left: '20%' }); // 默认沙发
// 🌟 新增：心情弹窗文本（和study一致）
const moodPopupText = ref('');

// 统计互动次数
const actionCount = ref({ kiss: 0, massage: 0, out: 0 });

const currentGif = computed(() => {
  const map = { kiss: kissGif, massage: massageGif, out: outGif };
  return map[activeAction.value] || idleGif;
});

// 随机位置逻辑
onMounted(() => {
  const positions = [
    { bottom: '22%', left: '22%' }, // 沙发
    { bottom: '28%', left: '68%' }  // 床铺
  ];
  characterPositionStyle.value = positions[Math.floor(Math.random() * positions.length)];
});

const toggleMenu = () => {
  if (activeAction.value === 'idle') showMenu.value = !showMenu.value;
};

const playAction = (action) => {
  activeAction.value = action;
  showMenu.value = false;
  actionCount.value[action]++;

  // ⭐ 核心：调用邻居互动方法 + 显示心情增加弹窗
  const moodAdd = 10; // 和store里interactWithNeighbor的加值保持一致
  game.interactWithNeighbor(); // 触发心情增加
  // 显示心情弹窗（和study样式/文案一致）
  moodPopupText.value = `😊 心情 +${moodAdd}`;

  const baseTexts = {
    kiss: 'Mua~ 好开心呀！❤️',
    massage: '🎶 舒服~ 给你一颗糖',
    out: '出发去冒险咯！✨'
  };

  const eggTexts = {
    kiss: ['（已经亲了3次啦～）', '（再亲就要粘在一起咯～）'],
    massage: ['（已经去过好多地方啦～）', '（要不要试试专业按摩师？）'],
    out: ['（已经出去玩过好多次啦～）', '（下次想去月球冒险吗？）']
  };

  let text = baseTexts[action];
  const count = actionCount.value[action];

  if (count >= 5) text += eggTexts[action][1];
  else if (count >= 3) text += eggTexts[action][0];

  feedbackText.value = text;

  // 🌟 新增：定时清空弹窗（和study保持2500ms一致）
  setTimeout(() => {
    moodPopupText.value = '';
  }, 2500);

  setTimeout(() => {
    activeAction.value = 'idle';
    feedbackText.value = '';
  }, action === 'out' ? 5000 : 3500);
};

const goHome = () => router.push('/');
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap');

* { font-family: 'ZCOOL KuaiLe', cursive; user-select: none; margin: 0; padding: 0; box-sizing: border-box; }

.visit-container {
  width: 100vw; height: 100vh;
  background-size: cover; background-position: center;
  position: relative; overflow: hidden;
  box-shadow: inset 0 0 150px rgba(0,0,0,0.15);
}

/* 顶部导航 */
.top-bar {
  position: absolute; top: 20px; left: 20px; right: 20px;
  display: flex; justify-content: space-between; z-index: 100;
}
.nav-btn {
  display: flex; align-items: center; gap: 8px; padding: 10px 25px;
  background: rgba(255, 255, 255, 0.85); border: 2px solid #333;
  border-radius: 50px; font-size: 18px; font-weight: bold;
  cursor: pointer; transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

/* 游戏主体区域 */
.game-stage {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 角色容器 */
.character-wrapper {
  position: absolute;
  /* 移除 flex 布局，防止子元素互相推挤 */
  transition: left 0.6s ease-in-out, bottom 0.6s ease-in-out;
  z-index: 50;
}

/* “一起出去玩”时的特写 */
.character-wrapper.action-out {
  left: 50% !important; bottom: 35% !important;
  transform: translateX(-50%) scale(1.4);
}

.character-img {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
}
.character-img img {
  width: 220px; cursor: pointer;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 呼吸动画：仅在非菜单状态 */
.character-img:not(.character-clicked) img {
  animation: breathe 3s ease-in-out infinite alternate;
}
@keyframes breathe { from { transform: scale(1); } to { transform: scale(1.04); } }

/* 点击淑熊后的状态：保持稍微放大 */
.character-clicked img { transform: scale(1.1); }

/* 互动菜单：关键修复——使用绝对定位浮动在角色上方 */
.interaction-menu {
  position: absolute;
  bottom: 100%; /* 放在图片顶部 */
  left: 50%;
  transform: translateX(-50%); /* 水平居中 */
  display: flex;
  gap: 15px;
  padding-bottom: 25px; /* 与角色的间距 */
  white-space: nowrap;
  z-index: 60;
}

/* 漫画按钮 */
.comic-btn-wrap { cursor: pointer; transition: transform 0.1s; }
.comic-btn-wrap:active { transform: scale(0.95); }
.comic-btn {
  padding: 12px 25px; border-radius: 50px; border: 3px solid #333;
  box-shadow: 0 4px 0 #333; background: #fff;
}
.btn-kiss { background-color: #FFDDE2; }
.btn-massage { background-color: #FFF2CC; }
.btn-out { background-color: #DDEFFF; }
.btn-text { font-size: 18px; font-weight: bold; color: #333; }

/* 反馈气泡：同样绝对定位 */
.feedback-bubble {
  position: absolute;
  bottom: 110%; /* 比菜单稍微高一点 */
  left: 50%;
  transform: translateX(-50%);
  background: white; border: 3px solid #333;
  padding: 8px 20px; border-radius: 20px;
  font-size: 18px; font-weight: bold;
  box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
  white-space: nowrap;
  z-index: 70;
}

.click-hint { font-size: 14px; color: #999; margin-top: 5px; animation: bounce 1s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }

/* 动画效果 */
.pop-enter-active { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop-in { 0% { opacity: 0; transform: translate(-50%, 20px) scale(0.5); } 100% { opacity: 1; transform: translate(-50%, 0) scale(1); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 🌟 新增：和study一致的心情弹窗样式（毛玻璃+灵动动画） */
.status-popup {
  position: fixed; /* 全局固定定位，不随角色移动 */
  top: 20%; /* 页面偏上位置，显眼不遮挡内容 */
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  z-index: 200; /* 最高层级，确保不被遮挡 */
  /* 毛玻璃核心属性 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

/* 心情弹窗专属样式（和study一致的柔粉系） */
.status-popup.mood {
  background: rgba(255, 228, 236, 0.6);
  color: #e91e63;
}

/* 🌟 新增：和study一致的fade动画（灵动的进出效果） */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-enter-from {
  opacity: 0;
  transform: translate(-50%, 15px) scale(0.9);
}
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}
</style>