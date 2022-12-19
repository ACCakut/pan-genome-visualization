import React, { memo, useMemo } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import type { SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { useSpeciesTreeJson } from 'src/hooks/useDataIndexQuery'
import { convertPhyloTreeToGraph } from 'src/components/Tree/PhyloGraph/convertPhyloTreeToGraph'
import { PhyloGraph } from 'src/components/Tree/PhyloGraph/PhyloGraph'

export interface SpeciesTreeProps {
  species: SpeciesDesc
}

function SpeciesTreeUnmemo({ species }: SpeciesTreeProps) {
  const { tree, meta } = useSpeciesTreeJson(species.id)
  const graph = useMemo(() => convertPhyloTreeToGraph(tree, meta), [meta, tree])

  const {
    width,
    height,
    ref: containerRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  return (
    <div className="w-100 h-100" ref={containerRef}>
      <PhyloGraph width={width} height={height} graph={graph} />
    </div>
  )
}

export const SpeciesTree = memo(SpeciesTreeUnmemo)
