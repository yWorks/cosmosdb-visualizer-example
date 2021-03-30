import { GraphBuilder, IEnumerable, IGraph } from 'yfiles'

type NodeData = { id: number; label: string; capacity: number }
type EdgeData = { id: number; from: number; to: number; time: number; endTime: number }

export function constructGraph(graph: IGraph, states: NodeData[], transitions: EdgeData[]): void {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: states,
    id: 'id'
  })
  builder.createEdgesSource({
    data: IEnumerable.from(transitions).distinct(arg => arg.from + '-' + arg.to),
    sourceId: 'from',
    targetId: 'to'
  })
  builder.buildGraph()
}
