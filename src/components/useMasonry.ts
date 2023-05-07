import { nextTick, reactive, ref, toRef } from 'vue'
import { useDebounceFn } from '@vueuse/core'

interface IColumnPosition {
  x: number
  y: number
}
export function useMasonry(
  nextPage: () => void,
  scrollContainer: string | undefined,
  gap: number) {
  const masonryEl = ref<HTMLElement>()
  const columnWidth = ref(200)
  const rawItems = ref<IItem[]>([])
  let __minColumnWidth = 0
  let columnPositions: IColumnPosition[] = []
  let masonryElH = 0
  const SCREEN_HEIGHT = masonryElH * 2 + (window.innerHeight * 2 > 1000 ? window.innerHeight * 3 : 1080)
  const itemsCounter = reactive<IItemsCounter>({
    top: [],
    current: [],
    bottom: [],
  })

  /**
   * 加载下一个item
   */
  const loadNextItem = async (item?: IHistoryItem) => {
    // 从底部取出一个item
    if (itemsCounter.bottom.length > 0) {
      const historyItem = itemsCounter.bottom.shift()
      historyItem && updateItemsCounter(historyItem)
      return
    }
    // 新加入一个item
    item && updateItemsCounter(item)

    function updateItemsCounter(itemData: IHistoryItem) {
      itemsCounter.current.push(itemData)
      // 如果当前列的高度大于屏幕高度 则将当前列的第一个item放入top
      if (masonryElH > SCREEN_HEIGHT) {
        const oldItem = itemsCounter.current.shift()
        oldItem && itemsCounter.top.push(oldItem)
      }
      awaitCurrentColumnLoading(itemData.column, !!itemData.height)
    }

    async function awaitCurrentColumnLoading(column: number, hasWH = false) {
      await nextTick()
      // 等待图片加载完成
      const currentItem = document.querySelector('.lastItem')
      const img = currentItem?.getElementsByClassName('itemClass')[0] as HTMLImageElement
      if (!img)
        throw new Error('img is not defined')
      if (img.complete || hasWH)
        return done()
      img.onload = done

      function done() {
        const height = currentItem?.clientHeight
        if (!height)
          throw new Error('height is not defined')
        updateColumnPositions(height, column)
        observerItems()
      }
    }
  }

  /**
     * 加载上一个item
     */
  const loadPrevItem = () => {
    const item = itemsCounter.top.pop()
    if (!item)
      return
    updateItemsCounter(item)

    async function updateItemsCounter(item: any) {
      itemsCounter.current.unshift(item)
      const oldItem = itemsCounter.current.pop()
      oldItem && itemsCounter.bottom.unshift(oldItem)
      observerItems()
    }
  }

  const intersectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const { isIntersecting, target } = entry
      if (isIntersecting) {
        intersectionObserver.unobserve(target)
        loading()
      }
    }
  }, {
    rootMargin: `${masonryElH}px`,
  })

  const intersectionObserverFirst = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const { isIntersecting, target } = entry
      if (isIntersecting && itemsCounter.top.length > 0) {
        intersectionObserverFirst.unobserve(target)
        loadPrevItem()
      }
    }
  })

  async function loading() {
    if (!columnPositions.length)
      return
    if (itemsCounter.bottom.length > 0)
      return loadNextItem()
    if (!rawItems.value.length)
      return nextPage()
    const itemData = rawItems.value.shift()
    const { min, index } = getMinColumn(columnPositions)
    const item = {
      data: itemData,
      x: min.x,
      y: min.y,
      column: index,
      height: (itemData?.width && itemData.height) && itemData?.height * columnWidth.value / itemData?.width,
    }
    loadNextItem(item)
  }

  function updateColumnPositions(height: number, index: number) {
    columnPositions[index].y += height
    masonryElH = columnPositions[index].y
    // 没给masonryEl设置高度不能设置背景颜色
    // masonryEl.value!.style.height = `${masonryElH}px`
  }

  /**
   * 更新列的宽度
   * @param columnCount 列数
   */
  async function updateItemWidth(columnCount: number) {
    if (!masonryEl.value)
      return
    const clientWidth = masonryEl.value.clientWidth
    columnWidth.value = Number(((clientWidth - ((columnCount - 1) * gap)) / columnCount).toFixed(2))
  }

  /**
   * 监听第一个和最后一个item的位置用于加载更多
   */
  async function observerItems() {
    await nextTick()
    const newEl: HTMLElement | null = document.querySelector('.lastItem')
    const newElFirst: HTMLElement | null = document.querySelector('.firstItem')
    if (!newEl || !newElFirst)
      return
    intersectionObserver.observe(newEl)
    intersectionObserverFirst.observe(newElFirst)
  }

  /**
   * 获取最小高度的列
   * @param columnPositions 所有列的坐标
   */
  function getMinColumn(columnPositions: IColumnPosition[]) {
    let index = 0
    const min = columnPositions.reduce((pre, cur, __index) => {
      if (cur.y < pre.y) {
        index = __index
        return cur
      }
      else {
        return pre
      }
    })
    return { min, index }
  }

  /**
   * 每列的坐标 用于计算每列的最低高度
   * @param columnCount 列数
   */
  const setDefaultColumnPositions = (columnCount: number) => {
    const columns = []
    for (let i = 0; i < columnCount; i++) {
      columns.push({
        x: i * (columnWidth.value + gap),
        y: 0,
      })
    }
    columnPositions = columns
  }

  /**
   * 计算列数
   * @returns 列数
   */
  function getColumnCount(minColumnWidth: number) {
    if (!masonryEl.value?.offsetWidth)
      return 0
    const offsetWidth = masonryEl.value?.offsetWidth
    const columnCount = (offsetWidth + gap) / (minColumnWidth + gap)
    return Math.floor(columnCount)
  }

  /**
 * 初始化布局
 * @param entries 变化实例
 */
  function initLayout(minColumnWidth?: number) {
    rawItems.value = [
      ...itemsCounter.top.map(item => item.data),
      ...itemsCounter.current.map(item => item.data),
      ...itemsCounter.bottom.map(item => item.data),
      ...rawItems.value]
    clearMasonry()

    minColumnWidth && (__minColumnWidth = minColumnWidth)
    const columnCount = getColumnCount(minColumnWidth || __minColumnWidth)
    updateItemWidth(columnCount)
    setDefaultColumnPositions(columnCount)
    loading()
  }

  function clearMasonry() {
    masonryElH = 0
    itemsCounter.current = []
    itemsCounter.top = []
    itemsCounter.bottom = []
  }

  onResizeWidth(() => {
    initLayout()
  })

  onScrollToTop(scrollContainer, () => {
    initLayout()
  })

  return {
    currentList: toRef(itemsCounter, 'current'),
    masonryEl,
    columnWidth,
    rawItems,
    initLayout,
    loading,
    clearMasonry,
  }
}

async function onScrollToTop(scrollContainer: string | undefined, cb: () => void) {
  await nextTick()
  let scrollTop = 0
  const el: HTMLElement | Document = !scrollContainer
    ? document
    : document.getElementsByClassName(scrollContainer)[0] as HTMLElement

  el.addEventListener('scroll', () => {
    scrollTop = !scrollContainer
      ? document.body.scrollTop + document.documentElement.scrollTop
      : (el as HTMLElement).scrollTop
    if (scrollTop !== 0)
      return
    cb()
  })
}

function onResizeWidth(cb: () => void) {
  let width = document.body.offsetWidth

  window.addEventListener('resize', useDebounceFn(() => {
    if (document.body.offsetWidth === width)
      return
    width = document.body.offsetWidth
    cb()
  }, 300))
}
