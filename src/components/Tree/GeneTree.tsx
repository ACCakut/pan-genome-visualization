import React, { useEffect, useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { Card, CardBody, CardHeader } from 'reactstrap'
import styled from 'styled-components'
import * as d3 from 'd3'

import { GeneCluster, SpeciesDesc, useGeneClusterData, useGeneTreeJson } from 'src/hooks/useDataIndexQuery'
import phyloTree from 'src/components/Tree/phyloTree/src/phyloTree'
import drawTree from 'src/components/Tree/phyloTree/src/drawTree'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import geneTreeCallbacks from './geneTreeCallbacks'

const Svg = styled.svg`
  font-family: sans-serif;
  font-size: 1.25rem;
  margin: 0;
  padding: 0;
  border: none;
`

export interface GeneTreeProps {
  species: SpeciesDesc
  gene: GeneCluster
}

export function GeneTree({ species, gene }: GeneTreeProps) {
  const { t } = useTranslationSafe()
  const svgRef = useRef<SVGSVGElement>(null)
  const { tree_json } = useGeneClusterData(species, gene)

  const {
    width,
    height,
    ref: containerRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  useEffect(() => {
    if (!width || !height || !tree_json) {
      return
    }

    drawTree(
      phyloTree(tree_json, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        svg: d3.select(svgRef.current),
        margins: { top: 10, bottom: 10, left: 10, right: 10 },
        scaleBar: true,
        // layout: layout_choice ? layout_choice : 'rect',
        layout: 'rect',
        autoTipSize: false,
        tipStrokeWidth: 0.5,
        callbacks: geneTreeCallbacks,
        orientation: { x: -1, y: 1 },
      }),
    )
    // tipLabels(myTree, tipText, tipFontSize(myTree), 3, 8)
    // myTree.showTipLabels = true
  }, [tree_json, width, height])

  return (
    <Card className="w-100 h-100">
      <CardHeader>
        <h4>{t('Gene tree')}</h4>
      </CardHeader>
      <CardBody>
        <div className="w-100 h-100" ref={containerRef}>
          <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} ref={svgRef} />
        </div>
      </CardBody>
    </Card>
  )
}
