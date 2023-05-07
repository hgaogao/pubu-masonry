interface IHistoryItem {
  data: any
  x: number
  y: number
  column: number
  height?: number
  width?: number
}
interface IItemsCounter {
  top: IHistoryItem[]
  current: IHistoryItem[]
  bottom: IHistoryItem[]
}
interface IItem {
  data: any
  height?: number
  width?: number
}
