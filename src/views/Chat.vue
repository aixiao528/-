<template>
  <div class="chat-container">
    <!-- 所有的逻辑、背景、按钮都在 ChatWindow 里，这里只负责引入 -->
    <ChatWindow />
  </div>
</template>

<script setup>
import ChatWindow from '@/components/ai/ChatWindow.vue';
</script>

<style scoped>
.chat-container {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  
}
</style>