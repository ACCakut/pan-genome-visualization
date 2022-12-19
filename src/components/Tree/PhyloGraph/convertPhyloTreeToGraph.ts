import { omit } from 'lodash'
import { colorHash } from 'src/helpers/colorHash'
import type { TreeMetadataOld, TreeNodeOld } from 'src/hooks/useDataIndexQuery'
import type { GraphEdge, GraphNodeRaw, GraphRaw } from './graph'

export interface TreeNodeOldWithIds extends TreeNodeOld {
  id: string
  children: TreeNodeOldWithIds[]
}

/** Convert old phyloTree data format (https://github.com/nextstrain/phyloTree) to the new graph data format */
export function convertPhyloTreeToGraph(tree: TreeNodeOld, meta: TreeMetadataOld): GraphRaw {
  const nodesRaw: GraphNodeRaw[] = []
  const treeWithIds = flattenPhyloTreeNodesRecursive(tree, nodesRaw)

  const edges: GraphEdge[] = []
  flattenPhyloTreeEdgesRecursive(treeWithIds, meta, nodesRaw, edges)

  const nodes = nodesRaw.map((node) => ({
    ...node,
    id: node.id,
    color: colorHash(node.name, { reverse: true }),
  }))

  return { nodes, edges }
}

/** Index tree nodes with unique IDs */
function flattenPhyloTreeNodesRecursive(node: TreeNodeOld, nodes: GraphNodeRaw[]): TreeNodeOldWithIds {
  const id = nodes.length.toString()
  nodes.push({ id, ...omit(node, 'children') })

  const children = node.children ?? []
  const childrenWithIds = children.map((child) => flattenPhyloTreeNodesRecursive(child, nodes))
  return { ...node, id, children: childrenWithIds }
}

/** Convert tree node hierarchy into flat lists of nodes and edges */
function flattenPhyloTreeEdgesRecursive(
  node: TreeNodeOldWithIds,
  meta: TreeMetadataOld,
  nodes: GraphNodeRaw[],
  edges: GraphEdge[],
) {
  const children = node.children ?? []
  children.forEach((child) => {
    edges.push({ id: edges.length.toString(), source: node.id, target: child.id })
    flattenPhyloTreeEdgesRecursive(child, meta, nodes, edges)
  })
}
