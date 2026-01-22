<template>
  <div class="typing">
    <img class="avatar" src="/avatars/batiao.png" />

    <div class="bubble">
      <span class="text">八条正在思考中</span>
      <span class="dots">
        <i></i><i></i><i></i>
      </span>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.typing {
  display: flex;
  align-items: flex-end;
  margin: 10px 0;
  animation: breathe 2.5s ease-in-out infinite;
}

/* 八条头像 */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 8px;
}

/* 气泡 */
.bubble {
  background: rgba(255, 182, 214, 0.9);
  color: #5a2a3a;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

/* 文字 */
.text {
  margin-right: 6px;
  font-weight: 500;
}

/* 小点容器 */
.dots i {
  display: inline-block;
  width: 4px;
  height: 4px;
  margin: 0 2px;
  background: #5a2a3a;
  border-radius: 50%;
  animation: jump 1.4s infinite both;
}

/* 三个点错峰 */
.dots i:nth-child(1) { animation-delay: 0s; }
.dots i:nth-child(2) { animation-delay: .2s; }
.dots i:nth-child(3) { animation-delay: .4s; }

/* 跳动动画 */
@keyframes jump {
  0% { transform: translateY(0); opacity: .4; }
  30% { transform: translateY(-6px); opacity: 1; }
  60% { transform: translateY(0); opacity: .6; }
}

/* 呼吸动画（整体） */
@keyframes breathe {
  0%, 100% { opacity: .85; }
  50% { opacity: 1; }
}
</style>
