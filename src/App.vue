<script setup lang="ts">
import { ref } from 'vue'
import Masonry from './components/Masonry.vue'
import data from './data.json'
import MasonryImage from './components/MasonryImage.vue'

function shuffle(arr: any[]) {
  let len = arr.length
  let random
  while (len !== 0) {
    random = (Math.random() * len--) | 0; // 无符号右移位运算符向下取整(注意这里必须加分号，否则报错)
    [arr[len], arr[random]] = [arr[random], arr[len]] // ES6的结构赋值实现变量互换
  }
  return arr
}
const list = ref<any>([])
const MasonryInstance = ref()

function handleLoadNext() {
  // eslint-disable-next-line no-console
  console.log('加载下一页啦▶️')
  list.value = shuffle(data).map(i => i)
}
</script>

<template>
  <!-- <div class="container">
    <div class="scroll"> -->
  <Masonry
    ref="MasonryInstance"
    v-slot="{ item }"
    :list="list"
    :min-column-width="300"
    @load-next="handleLoadNext"
  >
    <MasonryImage :src="`${item.data.imgUrl}/750`" />
    {{ item }}
  </Masonry>
  <!-- </div>
  </div> -->
</template>

<style>
.container{
  width: 80%;
  height: 80vh;
  overflow: hidden;
}
.scroll{
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}
html,
body {
  margin: 0;
  padding: 0;
}
</style>
