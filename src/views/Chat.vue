<template>
  <div>
    <h2>🛒 商城</h2>
    <button @click="back">返回</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const back = () => router.push('/')
</script>
