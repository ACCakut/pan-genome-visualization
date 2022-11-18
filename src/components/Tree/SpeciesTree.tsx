import React, { useEffect, useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { Card, CardBody, CardHeader } from 'reactstrap'
import styled from 'styled-components'
import * as d3 from 'd3'

import { SpeciesDesc, useSpeciesTreeJson } from 'src/hooks/useDataIndexQuery'
import phyloTree from 'src/components/Tree/phyloTree/src/phyloTree'
import drawTree from 'src/components/Tree/phyloTree/src/drawTree'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import speciesTreeCallbacks from './speciesTreeCallbacks'

const Svg = styled.svg`
  font-family: sans-serif;
  font-size: 1.25rem;
  margin: 0;
  padding: 0;
  border: none;
  width: 100%;
  height: 100%;
`

export interface TreeProps {
  species: SpeciesDesc
}

export function SpeciesTree({ species }: TreeProps) {
  const { t } = useTranslationSafe()
  const svgRef = useRef<SVGSVGElement>(null)
  const treeJson = useSpeciesTreeJson(species.id)

  const {
    width,
    height,
    ref: containerRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  useEffect(() => {
    if (!width || !height) {
      return
    }

    drawTree(
      phyloTree(treeJson, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        svg: d3.select(svgRef.current),
        margins: { top: 10, bottom: 10, left: 10, right: 10 },
        scaleBar: true,
        autoTipSize: false,
        tipStrokeWidth: 0.5,
        callbacks: speciesTreeCallbacks,
        orientation: { x: 1, y: 1 },
      }),
    )
    // tipLabels(myTree, tipText, tipFontSize(myTree), 3, 8)
    // myTree.showTipLabels = true
  }, [treeJson, width, height])

  return (
    <Card className="w-100 h-100">
      <CardHeader>
        <h4>{t('Strain tree (SNPs in all core genes)')}</h4>
      </CardHeader>
      <CardBody>
        <div className="w-100 h-100" ref={containerRef}>
          <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} ref={svgRef} />
        </div>
      </CardBody>
    </Card>
  )
}
