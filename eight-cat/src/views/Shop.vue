<template>
  <div class="page-container">
    
    <!-- 1. 顶部栏：金币与返回 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <!-- 金币信息 -->
        <div class="gold-info" :class="{ 'animate': isGoldAnimating }">
            【八条的小金库】 💰 <span>{{ game.coins}}</span> 
        </div>
        <!-- 返回按钮 -->
        <button class="nav-btn" @click="$router.push('/')">
            <span class="btn-icon">🏠</span>
            <span class="btn-text">返回首页</span>
        </button>
    </div>

    <!-- 2. 商城模块 -->
    <div class="MyCard">
        <div class="MyCard-title MyCard-title-shop">🐱 八条的超萌商城</div>
        <div class="MyCard-content">
            <div class="goods-grid">
                
                <!-- 使用 v-for 循环生成商品 -->
                <div 
                    class="goods-item" 
                    v-for="item in goodsList" 
                    :key="item.id"
                    @mouseenter="showTip($event, item.tip)"
                    @mouseleave="hideTip"
                >
                    <div class="goods-icon">
                        <!-- 动态加载图片 -->
                        <img :src="getImageUrl(item.imgName)" :alt="item.name">
                        <div v-if="item.isNew" class="new-tag">新品</div>
                    </div>
                    <div class="goods-name">{{ item.name }}</div>
                    <div class="goods-desc">{{ item.desc }}</div>
                    <div class="goods-price">¥{{ item.price }} 金币</div>
                    
                    <!-- 购买按钮 -->
                    <button 
                        class="MyButton"
                        :class="item.disabled ? 'MyButton-disabled' : 'MyButton-primary'"
                        :disabled="item.disabled"
                        @click="buyGoods(item)"
                    >
                        {{ item.btnText || '立即购买' }}
                    </button>
                </div>

            </div>
        </div>
    </div>

<!-- 背包模块 -->
<div class="MyCard">
  <div class="MyCard-title MyCard-title-backpack">🎒 八条的软萌背包</div>
  <div class="MyCard-content">
    <div class="backpack-list">

      <!-- 空背包提示 -->
      <div v-if="backpack.length === 0" class="empty-tip">
        <div class="eight-lazy"></div>
        😿 背包空空的！快买些好东西填满它吧~
      </div>

      <!-- 背包物品列表 -->
      <div v-else v-for="(item, index) in backpack" :key="index" class="backpack-item">
        <div class="backpack-icon">
          <img :src="getImageUrl(item.imgName)" :alt="item.name" />
        </div>
        <div class="backpack-desc">
          <div class="backpack-name">{{ item.name }}</div>
          <div class="backpack-info">
            <span>购买时间：{{ item.buyTime }}</span>
            <span class="status-tag active">可使用</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>


    <!-- 4. 弹窗组件 -->
    <div class="MyModal-mask" :class="{ show: modal.visible }" @click="closeModal"></div>
    <div class="MyModal-container" :class="{ show: modal.visible }">
        <div class="MyModal-header">
            <h3 class="MyModal-title">八条的小提示</h3>
            <button class="MyModal-close" @click="closeModal">×</button>
        </div>
        <div class="MyModal-body">
            {{ modal.content }}
        </div>
        <div class="MyModal-footer">
            <button class="MyButton MyButton-primary" @click="closeModal">确认</button>
        </div>
    </div>

    <!-- 5. 悬浮提示框  -->
    <div 
        class="goods-tip" 
        v-show="tooltip.visible" 
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
        {{ tooltip.content }}
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const game = useGameStore()
const router = useRouter()

const isGoldAnimating = ref(false)

//前端背包数组，用于显示购买时间
const backpack = ref([])

// 商品列表
const goodsList = [
    {
        id: 1,
        name: "八条专属进阶道具",
        price: 100,
        imgName: "道具.jpg",
        desc: "提升心情值+番茄奖励翻倍",
        tip: "用了之后八条心情值拉满哦~",
        itemKey: 'foodB'
    },
    {
        id: 2,
        name: "八条稀有小皮肤",
        price: 500,
        imgName: "皮肤.jpg",
        desc: "解锁皮肤+专属彩蛋",
        tip: "解锁后八条穿新衣服，超可爱！",
        isNew: true,
        disabled: true,
        btnText: "开发中...敬请期待"
    },
    {
        id: 3,
        name: "八条限定糖葫芦",
        price: 50,
        imgName: "金钱.jpg",
        desc: "酸甜开胃✨ 食用后降低 30 点饥饿值",
        tip: "小时候的味道~酸甜开胃！",
        itemKey: 'foodA'
    },
    {
        id: 4,
        name: "八条元气恢复药剂",
        price: 200,
        imgName: "药剂.jpg",
        desc: "恢复饥饿值",
        tip: "喝了之后八条充满元气，活力满满！",
        itemKey: 'foodC'
    }
]

// 弹窗状态
const modal = reactive({ visible: false, content: '' })

// 悬浮提示状态
const tooltip = reactive({ visible: false, content: '', x: 0, y: 0 })

// 图片路径工具
const getImageUrl = (name) => new URL(`../assets/images/shop/${name}`, import.meta.url).href

// 购买商品逻辑，buyTime
const buyGoods = (item) => {
    if (item.disabled) return

    const ok = game.buyItem(item.itemKey, item.price)
    if (!ok) {
        openModal("金币不足啦~快去做任务赚金币吧！😿")
        return
    }

    triggerGoldAnimate()

    // 添加到前端背包显示
    backpack.value.push({
        itemKey: item.itemKey,
        name: item.name,
        imgName: item.imgName,
        buyTime: new Date().toLocaleTimeString()
    })

    openModal(`🎉 成功购买 ${item.name}！`)
}

// 金币动画
const triggerGoldAnimate = () => {
    isGoldAnimating.value = true
    setTimeout(() => isGoldAnimating.value = false, 500)
}

// 弹窗控制
const openModal = (msg) => { modal.content = msg; modal.visible = true }
const closeModal = () => { modal.visible = false }

// 悬浮提示控制
const showTip = (event, tipText) => {
    tooltip.content = tipText
    tooltip.visible = true
    tooltip.x = event.clientX + 15
    tooltip.y = event.clientY + 15
}
const hideTip = () => { tooltip.visible = false }

</script>


<style scoped>


@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap');
:root {
    --cat-pink: #ffd6e0; 
    --cat-pink-deep: #ff9eb5; 
    --cream: #fff8e6; 
    --light-orange: #ffe0b8; 
    --cat-yellow: #fff3b0;
    --cat-green: #d6f5e2;
    --text-primary: #55423d;
    --text-secondary: #8c7a75;
    --border-color: #f0e6e6;
    --bg-light: #fff9fb;
    --bg-white: #ffffff;
    --radius-lg: 24px;
    --radius-md: 18px;
    --radius-sm: 12px;
    --shadow-light: 0 3px 12px rgba(255, 194, 209, 0.2);
    --shadow-medium: 0 5px 15px rgba(255, 194, 209, 0.3);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: inherit;
}


.page-container {
    min-height: 100vh; /* 确保占满全屏 */
    background-color: #fff9fb;
    background-image: url("@/assets/images/shop/背景.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
    background-attachment: fixed;
    padding: 20px;
    font-family: "ZCOOL KuaiLe", cursive, "Microsoft YaHei", sans-serif;
    position: relative;
    max-width: 100vw; /* 防止横向滚动条 */
}

/* --- 返回按钮：棕色边框+和谐配色版 --- */
.nav-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 50px;
    
    background: rgba(255, 226, 234, 0.8); 
   
    border: 2px solid #55423d; 
    
    box-shadow: inset 0 0 0 1px rgba(255, 214, 224, 0.5);
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}
.nav-btn:hover {
    
    background: rgba(255, 226, 234, 0.95); 
    
    box-shadow: inset 0 0 0 1px rgba(255, 214, 224, 0.8),
                0 6px 12px rgba(255, 194, 209, 0.3); 
    transform: translateY(-2px);
}
.btn-icon {
    font-size: 20px;
    
    color: #ff9eb5; 
}
.btn-text {
    
    color: #55423d; 
}

/* --- 金币样式 --- */
.gold-info {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: linear-gradient(120deg, #ffe6f2 20%, #fff9fb 80%);
    border-radius: 20px;
    box-shadow: 0 3px 6px rgba(255, 194, 209, 0.2);
    font-size: 18px;
    font-weight: 600;
    color: #6d5a53;
    transition: transform 0.2s;
}
.gold-info span {
    font-size: 20px;
    font-weight: 800;
    color: #cd84a5;
    text-shadow: 0 1px 2px rgba(255, 122, 182, 0.15);
}
/* 动画类 */
.gold-info.animate {
    animation: goldBounce 0.5s ease;
}
@keyframes goldBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

/* --- 卡片通用 --- */
.MyCard {
    background: #ffffff;
    background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 5C12 5 10 7 10 10C10 13 15 18 15 18C15 18 20 13 20 10C20 7 18 5 15 5Z' fill='%23ffd6e0' fill-opacity='0.1'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 30px 30px;
    border-radius: 24px;
    border: 2px solid #ffd6e0;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(255, 194, 209, 0.3);
}

.MyCard-title {
    font-size: 38px;
    font-weight: 700;
    color: #55423d;
    text-shadow: 0 2px 4px rgba(140, 122, 117, 0.15);
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px dashed #ffd6e0;
    text-align: center;
    letter-spacing: 4px;
}

/* --- 商品网格 --- */
.goods-grid {
    display: flex;
    flex-wrap:wrap;
    justify-content: center;
    gap: 20px;
}

.goods-item {
    width: 240px; 
    flex-shrink: 0;
    
    background: #ffffff;
    border-radius: 18px;
    border: 2px solid transparent;
    background-image: linear-gradient(to bottom, #fff, #fff), linear-gradient(to right, #ffd6e0, #fff8e6, #ffe0b8, #ffd6e0);
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;
    box-shadow: 0 3px 12px rgba(255, 194, 209, 0.2);
    padding: 16px;
    text-align: center;
    
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
}

.goods-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 194, 209, 0.3);
}

.goods-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 10px;
    border-radius: 12px;
    border: 3px solid #fff8e6;
    overflow: hidden;
    position: relative;
}

.goods-icon img { width: 100%; height: 100%; object-fit: cover; }

.new-tag {
    position: absolute; top: 0; left: 0;
    background-color: #ffe0b8; color: #55423d;
    font-size: 10px; padding: 2px 6px;
    border-radius: 0 0 12px 0;
}

.goods-name { font-weight: bold; color: #55423d; margin-bottom: 6px; }
.goods-desc { font-size: 12px; color: #8c7a75; margin-bottom: 10px; line-height: 1.4; min-height: 34px;} /* 增加最小高度防止对齐问题 */
.goods-price { font-weight: bold; color: #ff9eb5; margin-bottom: 12px; }

/* --- 按钮 --- */
.MyButton {
    padding: 8px 16px; border-radius: 20px;
    font-weight: bold; font-size: 12px;
    cursor: pointer; transition: all 0.2s ease;
    border: 2px solid #ffffff;
}
.MyButton-primary { background-color: #ff9eb5; color: white; }
.MyButton-disabled { background-color: #f0e6e6; color: #aaa; border-color: #f0e6e6; cursor: not-allowed; }
.MyButton:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 3px 6px rgba(255, 194, 209, 0.4); }

/* --- 背包 --- */
.backpack-list { display: flex; flex-direction: column; gap: 12px; }
.backpack-item {
    display: flex; align-items: center; padding: 12px;
    background: #ffffff; border-radius: 18px;
    border: 2px solid #d6f5e2; box-shadow: 0 3px 12px rgba(255, 194, 209, 0.2);
}
.backpack-icon { width: 50px; height: 50px; border-radius: 12px; border: 2px solid #fff8e6; margin-right: 12px; overflow: hidden; }
.backpack-icon img { width: 100%; height: 100%; object-fit: cover; }
.backpack-desc { flex: 1; text-align: left; }
.backpack-name { font-weight: bold; color: #55423d; margin-bottom: 4px; }
.backpack-info { font-size: 12px; color: #8c7a75; display: flex; justify-content: space-between; width: 100%; }
.status-tag.active { background: #ffe0b8; color: #55423d; padding: 2px 6px; border-radius: 4px; font-size: 10px; }

/* 空背包 */
.empty-tip {
    text-align: center; color: #8c7a75; padding: 30px 0;
    font-size: 14px;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10C20 10 10 20 10 30C10 40 20 50 30 50C40 50 50 40 50 30C50 20 40 10 30 10ZM30 40C25.6 40 22 36.4 22 32C22 27.6 25.6 24 30 24C34.4 24 38 27.6 38 32C38 36.4 34.4 40 30 40ZM30 18C26.7 18 24 20.7 24 24C24 27.3 26.7 30 30 30C33.3 30 36 27.3 36 24C36 20.7 33.3 18 30 18Z' fill='%23ffd6e0'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: 60px 60px;
    background-position: top center;
    padding-top: 80px;
}

/* --- 弹窗 --- */
.MyModal-mask {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.3); z-index: 1000;
    display: none;
}
.MyModal-container {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff; border-radius: 24px;
    width: 90%; max-width: 400px;
    z-index: 1001; display: none;
    box-shadow: 0 5px 15px rgba(255, 194, 209, 0.3);
    border: 2px solid #ffd6e0;
}
.MyModal-mask.show, .MyModal-container.show { display: block; }
.MyModal-header {
    padding: 16px 24px; background: #ff9eb5; color: white;
    display: flex; justify-content: space-between; align-items: center;
    border-radius: 24px 24px 0 0;
}
.MyModal-title { font-size: 18px; font-weight: bold; }
.MyModal-close { background: transparent; border: none; color: white; font-size: 20px; cursor: pointer; }
.MyModal-body { padding: 24px; text-align: center; color: #55423d; background-color: rgba(255, 248, 230, 0.1); }
.MyModal-footer { padding: 8px 24px 16px; display: flex; justify-content: center; }

/* --- 悬浮提示 (Tooltip) --- */
.goods-tip {
    position: fixed;
    background: #ffd6e0;
    color: #55423d;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    z-index: 2000; 
    pointer-events: none; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-weight: bold;
    border: 1px solid #fff;
}
</style>