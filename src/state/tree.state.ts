import { atomFamily } from 'recoil'

export const highlightedNodeAtom = atomFamily<boolean, string>({
  key: 'highlightedNodeAtom',
  default: false,
})
