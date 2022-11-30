import React, { useMemo } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { useGeneClusterData } from 'src/hooks/useDataIndexQuery'

import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { convertPhyloTreeToGraph } from 'src/components/Tree/PhyloGraph/convertPhyloTreeToGraph'
import { PhyloGraph } from 'src/components/Tree/PhyloGraph/PhyloGraph'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'

export interface GeneTreeProps {
  species: SpeciesDesc
  gene: GeneCluster
}

export function GeneTree({ species, gene }: GeneTreeProps) {
  const { t } = useTranslationSafe()
  const { tree, meta } = useGeneClusterData(species, gene)
  const graph = useMemo(() => {
    if (!tree || !meta) {
      return null
    }
    return convertPhyloTreeToGraph(tree, meta)
  }, [meta, tree])

  const {
    width,
    height,
    ref: containerRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  return (
    <Card className="w-100 h-100">
      <CardHeader>
        <h4>{t('Gene tree')}</h4>
      </CardHeader>
      <CardBody>
        <div className="w-100 h-100" ref={containerRef}>
          {graph && width && height && <PhyloGraph width={width} height={height} graph={graph} />}
        </div>
      </CardBody>
    </Card>
  )
}
