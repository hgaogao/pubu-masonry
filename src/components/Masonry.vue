<script name="Masonry" lang="ts" setup>
import { nextTick, onDeactivated, onMounted, reactive, ref, watch } from "vue";
import {
  useDebounceFn,
  useResizeObserver,
  useScroll,
  useThrottleFn,
} from "@vueuse/core";
const items = ref<{ data: any; column: number; x: number; y: number }[]>([]);
const rawArr = ref([
  {
    width: 300,
    height: 435,
  },
  {
    width: 300,
    height: 355,
  },
  {
    width: 300,
    height: 467,
  },
  {
    width: 300,
    height: 449,
  },
  {
    width: 300,
    height: 305,
  },
  {
    width: 300,
    height: 238,
  },
  {
    width: 300,
    height: 372,
  },
  {
    width: 300,
    height: 319,
  },
  {
    width: 300,
    height: 370,
  },
  {
    width: 300,
    height: 339,
  },
]);

//逐个添加
const addOne = () => {
  const item = {
    width: 300,
    height: Math.round(Math.random() * 200 + 400),
  };
  loadNextItem(item);
};

const addOneFirst = () => {
  const item = {
    width: 300,
    height: Math.round(Math.random() * 200 + 400),
  };
  loadPrevItem(item);
};

//单列的最小宽度
const columnWidth = ref(200);
const minColumnWidth = 300;
const masonryEl = ref<HTMLElement>();
let columns: { x: number; y: number }[] = [];
const masonrySize = reactive({ width: 0, height: 0 });

const { arrivedState, directions } = useScroll(window);
watch(arrivedState, (value) => {
  if (value.bottom) {
    console.log("123");
    addOne();
  }
  if (value.top) {
    addOneFirst();
  }
});

//计算列数
function columnCount() {
  if (!masonryEl.value?.offsetWidth) return 0;
  return Math.floor(masonryEl.value?.offsetWidth / minColumnWidth);
}

// 每列的坐标 用于计算每列的最低高度
const getDefaultColumns = () => {
  const columns = [];
  for (let i = 0; i < columnCount(); i++) {
    columns.push({
      x: i * columnWidth.value,
      y: 0,
    });
  }
  return columns;
};
// TODO: 处理上滑加载
function loadPrevItem(item: any) {
  const { min, index } = getMinColumn(columns);
  const itemData = {
    data: item,
    x: min.x,
    y: min.y,
    column: index,
  };
  items.value[index].splice(0, 0, itemData);
  debugger;
}
function loadNextItem(item: any) {
  const { min, index } = getMinColumn(columns);
  const itemData = {
    data: item,
    x: min.x,
    y: min.y,
    column: index,
    height: item.height,
  };
  masonrySize.height = columns[index].y;
  columns[index].y += item.height;
  items.value.push(itemData);
  items.value.splice(0, 1);
}

function updateItemWidth() {
  // TODO: 加上gutter
  // FIXME: 不需要每次都计算，只需要在窗口变化时计算
  const clientWidth = masonryEl.value!.clientWidth;
  columnWidth.value = Number((clientWidth / columnCount()).toFixed(2));
}

// 找到最低高度的列并返回下标
function getMinColumn(columns: { x: number; y: number }[]) {
  let index = 0;
  const min = columns.reduce((pre, cur, __index) => {
    if (cur.y < pre.y) {
      index = __index;
      return cur;
    } else {
      return pre;
    }
  });
  return { min, index };
}

// 初始化及宽度变化时重新布局
async function initLayout(val: any) {
  if (masonrySize.width === val[0].contentRect.width) return;
  masonrySize.width = val[0].contentRect.width;
  await nextTick();
  updateItemWidth();
  columns = getDefaultColumns();
  items.value = rawArr.value.map((item) => {
    const { min, index } = getMinColumn(columns);
    const itemData = {
      data: item,
      x: min.x,
      y: min.y,
      column: index,
      height: item.height,
    };
    columns[index].y += item.height;
    return itemData;
  });
}
// 监听窗口变化
const debounceFn = useDebounceFn(initLayout, 400);
useResizeObserver(masonryEl, debounceFn);
onMounted(() => {
  // initLayout()
});
onDeactivated(() => {
  console.log("dead");
});
</script>

<template>
  <div
    class="div"
    style="
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
      background-color: #fff;
    "
  >
    {{ arrivedState.bottom }}{{ directions.bottom }}{{ arrivedState.top
    }}{{ directions.top }}
  </div>
  <div ref="masonryEl" class="masonry">
    <section
      class="item"
      v-for="(item, index) in items"
      :key="index"
      :style="`transform: translate(${item.x}px, ${item.y}px);width:${columnWidth}px;height:${item.height}px`"
    >
      {{ columnWidth }}
      {{ item }}
    </section>
  </div>
</template>
<style>
body::-webkit-scrollbar {
  display: none;
  /* TODO: 滚动条条的出现会影响到宽度的计算 */
}

.masonry {
  background-color: #456;
  width: 100%;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
}
.item {
  background-color: #987;
  height: 200px;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid #000;
  box-sizing: border-box;
  transition: all 0.3s;
  border-radius: 20px;
}
</style>
