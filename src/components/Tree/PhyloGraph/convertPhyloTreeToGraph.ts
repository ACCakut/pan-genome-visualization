import { omit } from 'lodash'
import type { TreeMetadataOld, TreeNodeOld } from 'src/hooks/useDataIndexQuery'
import type { GraphEdge, GraphNodeRaw, GraphRaw } from './graph'

export interface TreeNodeOldWithIds extends TreeNodeOld {
  id: string
  children: TreeNodeOldWithIds[]
}

/** Convert old phyloTree data format (https://github.com/nextstrain/phyloTree) to the new graph data format */
export function convertPhyloTreeToGraph(tree: TreeNodeOld, meta: TreeMetadataOld): GraphRaw {
  const treeWithIds = addIdsToTreeRecursive(tree, 0)

  const nodes: GraphNodeRaw[] = []
  const edges: GraphEdge[] = []
  flattenTreeRecursive(treeWithIds, meta, nodes, edges)
  return { nodes, edges }
}

/** Index tree nodes with unique IDs */
function addIdsToTreeRecursive(node: TreeNodeOld, id: number): TreeNodeOldWithIds {
  const children = node.children ?? []
  const childrenWithIds = children.map((child, i) => addIdsToTreeRecursive(child, id + i))
  return { ...node, id: `${id}-${node.name}`, children: childrenWithIds }
}

/** Convert tree node hierarchy into flat lists of nodes and edges */
function flattenTreeRecursive(
  node: TreeNodeOldWithIds,
  meta: TreeMetadataOld,
  nodes: GraphNodeRaw[],
  edges: GraphEdge[],
) {
  nodes.push(omit(node, 'children'))

  const children = node.children ?? []
  children.forEach((child) => {
    edges.push({ id: edges.length.toString(), source: node.id, target: child.id })
    flattenTreeRecursive(child, meta, nodes, edges)
  })
}
