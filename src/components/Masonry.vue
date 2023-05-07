<script name="Masonry" lang="ts" setup>
import type { PropType } from 'vue'
import {
  onMounted,
  watch,
} from 'vue'
import { useMasonry } from './useMasonry'

const props = defineProps({
  list: {
    type: Array as PropType<any[]>,
    required: true,
  },
  minColumnWidth: {
    type: Number,
    default: 300,
  },
  gap: {
    type: Number,
    default: 20,
  },
  scrollContainer: {
    type: String,
  },
  widthPath: {
    type: String,
    required: false,
  },
  heightPath: {
    type: String,
    required: false,
  },
})

const emit = defineEmits<{ (event: 'loadNext'): void }>()

const {
  masonryEl,
  currentList,
  columnWidth,
  rawItems,
  initLayout,
  loading,
  clearMasonry,
} = useMasonry(nextPage, props.scrollContainer, props.gap)

defineExpose({
  clear: clearMasonry,
})
function nextPage() {
  emit('loadNext')
}

watch(() => props.list, (nVal) => {
  if (!nVal || !nVal.length)
    return
  rawItems.value = nVal.map((item) => {
    const width = props.widthPath ? getAttribute(props.widthPath, item) : item.width
    const height = props.heightPath ? getAttribute(props.heightPath, item) : item.height
    return {
      ...item,
      height,
      width,
    }
  })
  loading() // 加载第一个
})

function getAttribute(path: string, item: any) {
  const value = path.split('.').reduce((prev, cur) => {
    return prev ? prev[cur] : item[cur]
  }, null)
  if (!value)
    console.error(`getAttribute: ${path} is not exist`)
  return value
}
onMounted(() => {
  initLayout(props.minColumnWidth)
})
</script>

<template>
  <div ref="masonryEl" class="masonry">
    <section
      v-for="(item, index) in currentList" :key="item.x + item.y"
      class="item"
      :style="`left:${item.x}px;top:${item.y}px;width:${columnWidth}px;`"
      :class="{ lastItem: index === currentList.length - 1, firstItem: index === 0 }"
    >
      <slot :item="item" />
    </section>
  </div>
</template>

<style>
body::-webkit-scrollbar {
  display: none;
}

.masonry {
  background-color: #456;
  width: 100%;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
}

.item {
  overflow: hidden;
  background-color: #987;
  position: absolute;
  border: 1px solid #000;
  box-sizing: border-box;
  border-radius: 20px;
  animation-name: scale;
  animation-duration: 0.2s;
}
@keyframes scale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
