import React, { ReactElement, useMemo } from 'react'
import { Circle, Text } from 'react-konva'
import { useEnable } from 'src/hooks/useEnable'
import { PHYLO_GRAPH_NODE_LABEL_FONT_SIZE, PHYLO_GRAPH_NODE_RADIUS } from 'src/components/Tree/PhyloGraph/constants'
import { CanvasTooltip, CanvasTooltipPre } from 'src/components/Tree/PhyloGraph/CanvasTooltip'
import { isLeafNode, getLeaves, Graph, GraphNode } from 'src/components/Tree/PhyloGraph/graph'

export interface CladeTreeNodeProps {
  node: GraphNode
  graph: Graph
}

export function Node({ node, graph }: CladeTreeNodeProps): ReactElement {
  const { x, y, id, color } = node
  const [isTooltipOpen, openTooltip, closeTooltip] = useEnable(false)

  const text = useMemo(() => {
    if (!isLeafNode(graph, id) || getLeaves(graph).length > 50) {
      return null
    }
    return (
      <Text
        x={x + PHYLO_GRAPH_NODE_RADIUS * 2}
        y={y + PHYLO_GRAPH_NODE_LABEL_FONT_SIZE / 2 - 2}
        width={PHYLO_GRAPH_NODE_RADIUS * 2}
        height={PHYLO_GRAPH_NODE_RADIUS * 2}
        fill="#222"
        fontSize={PHYLO_GRAPH_NODE_LABEL_FONT_SIZE}
        textAnchor="left"
        text={id}
      />
    )
  }, [graph, id, x, y])

  const circle = useMemo(() => {
    return (
      <>
        <Circle
          x={x}
          y={y}
          radius={PHYLO_GRAPH_NODE_RADIUS}
          fill={color}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
        />
        <CanvasTooltip isOpen={isTooltipOpen}>
          <CanvasTooltipPre>{JSON.stringify(node, null, 2)}</CanvasTooltipPre>
        </CanvasTooltip>
      </>
    )
  }, [closeTooltip, color, isTooltipOpen, node, openTooltip, x, y])

  const elements = useMemo(() => {
    return (
      <>
        {circle}
        {text}
      </>
    )
  }, [circle, text])

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{elements}</>
}
