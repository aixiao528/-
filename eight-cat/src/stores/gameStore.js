import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  /* ================= 基础状态 ================= */
  const coins = ref(100)

  const mood = ref(50)     // 0–100
  const hunger = ref(70)   // 0–100（越高越饿）

  /* ================= 道具库存 ================= */
  const items = ref({
    foodA: 2, // 小零食
    foodB: 1, // 正餐
    foodC: 0  // 高级料理
  })

  /* ================= 约束 ================= */
  const clamp = (v, min = 0, max = 100) =>
    Math.min(max, Math.max(min, v))

  /* ================= 统一修改接口 ================= */
  function addCoins(v) {
    coins.value = Math.max(0, coins.value + v)
  }

  function addMood(v) {
    mood.value = clamp(mood.value + v)
  }

  function addHunger(v) {
    hunger.value = clamp(hunger.value + v)
  }

  /* ================= 商城 ================= */
  function buyItem(name, price, count = 1) {
    if (coins.value < price) return false
    addCoins(-price)
    items.value[name] += count
    return true
  }

  /* ================= 使用道具（主页扇形） ================= */
  const itemEffectMap = {
    foodA: { mood: +5, hunger: -15 },
    foodB: { mood: +8, hunger: -30 },
    foodC: { mood: +15, hunger: -50 }
  }

  function useItem(name) {
    if (items.value[name] <= 0) return false
    items.value[name]--
    const effect = itemEffectMap[name]
    addMood(effect.mood)
    addHunger(effect.hunger)
    return true
  }

  /* ================= 邻居家 ================= */
  function interactWithNeighbor() {
    addMood(10)
  }

  /* ================= 番茄钟 ================= */
  function finishStudy(minutes) {
    addCoins(minutes * 10)
    addHunger(minutes * 2)
    addMood(3)
  }

  return {
    coins,
    mood,
    hunger,
    items,

    buyItem,
    useItem,
    interactWithNeighbor,
    finishStudy
  }
})
