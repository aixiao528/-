<template>
  <div class="sub-page">
    <button @click="$router.push('/')" class="back-btn">返回主页</button>
    <h1>Shop - 商店</h1>
    <div class="content">这里是内容区域</div>
  </div>
</template>

<style scoped>
.sub-page {
  padding: 20px;
  height: 100vh;
  background: #f5f5f5;
  text-align: center;
}
.back-btn {
  padding: 10px 20px;
  margin-bottom: 20px;
  cursor: pointer;
}
</style>