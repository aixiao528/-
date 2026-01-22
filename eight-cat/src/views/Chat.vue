<template>
  <div class="chat-container">
    <!-- 引入 ChatWindow 里 -->
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