import React, { ReactElement, useMemo } from 'react'
import styled from 'styled-components'

import type { Graph, GraphNode } from './graph'
import { isLeafNode } from './graph'
import { PHYLO_GRAPH_NODE_LABEL_FONT_SIZE, PHYLO_GRAPH_NODE_RADIUS } from './constants'

const NodeCircle = styled.circle`
  fill: #555;
  r: ${PHYLO_GRAPH_NODE_RADIUS};
`

export interface CladeTreeNodeProps {
  node: GraphNode
  graph: Graph
}

export function Node({ node, graph }: CladeTreeNodeProps): ReactElement {
  const { x, y, name, id } = node
  const text = useMemo(() => {
    if (!isLeafNode(graph, id)) {
      return null
    }
    return (
      <text
        x={x + PHYLO_GRAPH_NODE_RADIUS * 2}
        y={y + PHYLO_GRAPH_NODE_LABEL_FONT_SIZE / 2 - 2}
        width={PHYLO_GRAPH_NODE_RADIUS * 2}
        height={PHYLO_GRAPH_NODE_RADIUS * 2}
        fill="#222"
        fontSize={PHYLO_GRAPH_NODE_LABEL_FONT_SIZE}
        textAnchor="left"
      >
        {name}
      </text>
    )
  }, [graph, id, x, y, name])

  return (
    <g>
      <NodeCircle cx={x} cy={y} />
      {text}
    </g>
  )
}
