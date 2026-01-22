<template>
  <div class="chat-page" :style="{ backgroundImage: `url(${bgImage})` }">
    
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goHome">
      <span class="btn-icon">🏠</span>
      <span class="btn-text">返回首页</span>
    </button>

    <div class="chat-window">
      <!-- 漂浮装饰 -->
      <div class="floating-paws">
         <span v-for="i in 6" :key="i"></span>
      </div>

      <!-- 消息列表 -->
      <div class="messages">
        <ChatMessage
          v-for="(msg, index) in messages"
          :key="index"
          :role="msg.role"
          :action="msg.action"
          :content="msg.content"
        />
        <TypingIndicator v-if="loading" />
        <div ref="bottomRef"></div>
      </div>

      <!-- 输入区 -->
      <div class="input-area">
        <input
          v-model="input"
          @keydown.enter="send"
          placeholder="今天想和八条分享什么呢..."
        />
        <button @click="send" class="send-btn">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { sendAiMessage } from '@/api/ai'
import ChatMessage from './ChatMessage.vue'
import TypingIndicator from './TypingIndicator.vue'

import bgImage from '@/assets/images/chat/chat-bg.png' 

const router = useRouter()
const goHome = () => {
  router.push('/')
}

const messages = ref([])
const input = ref('')
const loading = ref(false)
const bottomRef = ref(null)

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

function scrollToBottom() {
  nextTick(() => {
    bottomRef.value?.scrollIntoView({ behavior: 'auto' })
  })
}

function typeWriter(text, callback) {
  let index = 0
  const timer = setInterval(() => {
    callback(text.slice(0, index))
    index++
    if (index > text.length) {
      clearInterval(timer)
    }
  }, 30)
}

function parseBatiaoReply(text) {
  const actionMatch = text.match(/【动作】([\s\S]*?)(?=【对话】|$)/)
  const contentMatch = text.match(/【对话】([\s\S]*)/)
  return {
    action: actionMatch ? actionMatch[1].trim() : '',
    content: contentMatch ? contentMatch[1].trim() : text
  }
}

async function send() {
  if (!input.value.trim() || loading.value) return
  const text = input.value
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  loading.value = true

  try {
    const reply = await sendAiMessage(messages.value.slice(-6), text)
    const parsed = parseBatiaoReply(reply)
    messages.value.push({ role: 'assistant', action: parsed.action, content: '' })
    const index = messages.value.length - 1
    typeWriter(parsed.content, (current) => {
      messages.value[index].content = current
      scrollToBottom()
    })
  } catch (err) {
    console.error("❌ 错误详情：", err)
    messages.value.push({ role: 'assistant', content: '本喵好像卡住了喵…再试一次呀~' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 引入漫画风圆润字体 */
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap');

/* 最外层容器 */
.chat-page {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  /* 全局统一漫画字体 */
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
}

/* 聊天窗口主体 */
.chat-window {
  width: 90%;
  max-width: 900px;
  height: 90vh;
  background: rgba(255, 255, 255, 0.4); 
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  padding: 12px;
  position: relative;
}

/* 返回按钮：漫画字体+点击动效 */
.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #fff;
  border-radius: 30px;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  /* 漫画字体 */
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
  font-size: 16px;
  /* 点击动效过渡 */
  transition: all 0.2s ease;
}
/* 返回按钮点击动效 */
.back-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-icon {
  font-size: 18px;
}
.btn-text {
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: none;
  position: relative;
  /* 消息列表字体也统一漫画风 */
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
}

.messages::-webkit-scrollbar {
  width:0;
  height:0;
}

.input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  margin: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  position: relative;
}

/* 输入框本体 */
.input-area input {
  flex: 1;
  height: 40px;
  padding: 0 14px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  /* 输入框字体统一漫画风 */
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
}

/* placeholder 更温柔 */
.input-area input::placeholder {
  color: #999;
}

/* 发送按钮：漫画字体+点击动效 */
.send-btn {
  height: 40px;
  padding: 0 18px;
  border-radius: 20px;
  background: #ff9acb;
  color: white;
  font-weight: 500;
  border: none;
  cursor: pointer;
  /* 漫画字体 */
  font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', cursive;
  font-size: 14px;
  /* 点击动效过渡 */
  transition: all 0.2s ease;
}
/* 发送按钮点击动效 */
.send-btn:active {
  transform: scale(0.95);
  background: #ff85c0;
  box-shadow: 0 2px 6px rgba(255, 154, 203, 0.4);
}

/* 🌸 漂浮装饰容器 */
.floating-paws {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}

.messages,
.input-area {
  position: relative;
  z-index: 2;
  background: transparent;
}

.floating-paws span {
  position: absolute;
  bottom: -40px;
  display: block;
  width: 40px;
  height: 40px;
  background-image: url('/decor/paw.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.3;
  animation: floatUp 14s linear infinite;
}

/* 随机位置 & 速度 */
.floating-paws span:nth-child(1) { left: 10%; animation-duration: 20s; }
.floating-paws span:nth-child(2) { left: 30%; animation-duration: 16s; }
.floating-paws span:nth-child(3) { left: 50%; animation-duration: 22s; }
.floating-paws span:nth-child(4) { left: 70%; animation-duration: 18s; }
.floating-paws span:nth-child(5) { left: 85%; animation-duration: 25s; }
.floating-paws span:nth-child(6) { left: 95%; animation-duration: 19s; }

/* 上浮动画 */
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 0.15;
  }
  20% {
    opacity: 0.38;
  }
  100% {
    transform: translateY(-120%) scale(1.1);
    opacity: 0;
  }
}
</style>