import { atom, atomFamily } from 'recoil'
import { GraphLayoutOptions } from 'src/components/Tree/PhyloGraph/graph'

export const highlightedNodeAtom = atomFamily<boolean, string>({
  key: 'highlightedNodeAtom',
  default: false,
})

export const geneTreeOptionsAtom = atom<GraphLayoutOptions>({
  key: 'geneTreeOptionsAtom',
  default: {
    mirrored: true,
  },
})
