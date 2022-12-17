import React, { useMemo } from 'react'
import { Line } from 'react-konva'
import { useEnable } from 'src/hooks/useEnable'
import { CanvasTooltip, CanvasTooltipPre } from './CanvasTooltip'
import { getNodesForEdge, Graph, GraphEdge } from './graph'

export interface EdgeProps {
  edge: GraphEdge
  graph: Graph
}

export function Edge({ edge, graph }: EdgeProps) {
  const [isTooltipOpen, openTooltip, closeTooltip] = useEnable(false)

  const line = useMemo(() => {
    const { source, target } = getNodesForEdge(graph, edge)

    // prettier-ignore
    const points = [ // eslint-disable-line react-perf/jsx-no-new-array-as-prop
      // Vertical line
      source.layout.xTBarStart, source.layout.yTBarStart,
      source.layout.xTBarEnd, source.layout.yTBarEnd,

      // Horizontal line
      source.layout.xTBarStart, target.y,
      target.x, target.y
    ];

    return (
      <>
        <Line points={points} stroke="#aaa" strokeWidth={5} onMouseEnter={openTooltip} onMouseOut={closeTooltip} />
        <CanvasTooltip isOpen={isTooltipOpen}>
          <CanvasTooltipPre>{JSON.stringify(edge, null, 2)}</CanvasTooltipPre>
        </CanvasTooltip>
      </>
    )
  }, [closeTooltip, edge, graph, isTooltipOpen, openTooltip])

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{line}</>
}
