import React, { useMemo } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { Card, CardBody, CardHeader } from 'reactstrap'

import type { SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { useSpeciesTreeJson } from 'src/hooks/useDataIndexQuery'
import { convertPhyloTreeToGraph } from 'src/components/Tree/PhyloGraph/convertPhyloTreeToGraph'
import { PhyloGraph } from 'src/components/Tree/PhyloGraph/PhyloGraph'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'

export interface SpeciesTreeProps {
  species: SpeciesDesc
}

export function SpeciesTree({ species }: SpeciesTreeProps) {
  const { t } = useTranslationSafe()
  const { tree, meta } = useSpeciesTreeJson(species.id)
  const graph = useMemo(() => convertPhyloTreeToGraph(tree, meta), [meta, tree])

  // const [showTooltip, setShowTooltip] = useState(false)

  const {
    width,
    height,
    ref: containerRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  // const id = getSafeId('species-tree', { speciesId: species.id })

  return (
    <Card className="w-100 h-100">
      <CardHeader>
        <h4>{t('Strain graph')}</h4>
        <p>{t('SNPs in all core genes')}</p>
      </CardHeader>
      <CardBody>
        <div className="w-100 h-100" ref={containerRef}>
          {width && height && <PhyloGraph width={width} height={height} graph={graph} />}
          {/*<Tooltip id={id} isOpen={showTooltip} target={id}>*/}
          {/*  <div>{'Hello!'}</div>*/}
          {/*</Tooltip>*/}
        </div>
      </CardBody>
    </Card>
  )
}
