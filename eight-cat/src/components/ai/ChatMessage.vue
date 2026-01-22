<template>
  <div :class="['message', role]">
    <img
      v-if="role === 'assistant'"
      class="avatar"
      src="/avatars/batiao.png"
    />

<div class="bubble">
  <div v-if="action" class="action">
    {{ action }}
  </div>
  <div class="content">
    {{ content }}
  </div>
</div>


    <img
      v-if="role === 'user'"
      class="avatar"
      src="/avatars/user.png"
    />
  </div>
</template>

<script setup>
defineProps({
  role: String,
  content: String,
  action: String
})
</script>

<style scoped>

.action {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 600;
  margin-bottom: 4px;
}

.content {
  font-size: 14px;
}

.message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin: 0 6px;
}

.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  line-height: 1.5;
  text-align: left;
}

.message.assistant .bubble {
  background: #fff0f6;
  color: #880e4f;
}

.message.user .bubble {
  background: #f8bbd0;
  color: #fff;
}

.user .bubble {
  background: #ffd36e;
}

.message.assistant .bubble {
  animation: floatIn 0.25s ease-out;
}

@keyframes floatIn {
  from {
    transform: translateY(4px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

</style>
