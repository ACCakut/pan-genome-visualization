import copy from 'fast-copy'

/** Reorder elemets of an array by index: src element is moved into slot before the dst element */
export function reorder<T>(arr: T[], srcIdx: number, dstIdx: number): T[] {
  arr.splice(dstIdx, 0, arr.splice(srcIdx, 1)[0])
  return copy(arr)
}

/** Reorder elemets of an array by value: src element is moved into slot before the dst element. Elements are assumed to be unique. */
export function reorderByValue<T>(arr: T[], srcVal: T, dstVal: T): T[] {
  return reorder(arr, arr.indexOf(srcVal), arr.indexOf(dstVal))
}
