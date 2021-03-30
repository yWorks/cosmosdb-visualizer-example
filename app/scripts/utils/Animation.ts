import { HeatData } from './HeatData'
import { IEdge, IGraph, IModelItem, INode } from 'yfiles'
import { ProcessItemVisual } from './ProcessItemVisual'

type HeatOwner = { tag: { heat: HeatData } }
type EdgeData = { id: number; from: number; to: number; time: number; endTime: number }

function determineTimeRange(transitions: EdgeData[]) {
  const range = { min: Number.POSITIVE_INFINITY, max: 0 }
  transitions.reduce((minMax, cur) => {
    minMax.min = Math.min(cur.time, minMax.min)
    minMax.max = Math.max(cur.endTime, minMax.max)
    return minMax
  }, range)
  return range
}

function addHeat(item: INode | IEdge, time: number, value: number) {
  ;(item as HeatOwner).tag.heat.addValue(time, value)
}

export function initializeAnimation(
  graph: IGraph,
  processItemVisual: ProcessItemVisual,
  transitions: EdgeData[]
): { animation: (time: number) => void; getCurrentHeat: (item: IModelItem) => number } {
  const RESOLUTION = 64

  const timeRange = determineTimeRange(transitions)

  function normalizeTime(time: number) {
    return (time - timeRange.min) / (timeRange.max - timeRange.min)
  }

  graph.nodes
    .concat(graph.edges)
    .map(item => item.tag)
    .forEach(tag => (tag.heat = new HeatData(RESOLUTION, 0, 1)))

  const id2Node = new Map<number, INode>()
  graph.nodes.forEach(n => id2Node.set(n.tag.id, n))

  function storeHeatData(e: EdgeData) {
    const sourceNode = id2Node.get(e.from)!
    const targetNode = id2Node.get(e.to)!
    const transition = graph.getEdge(sourceNode, targetNode)!

    addHeat(sourceNode, normalizeTime(e.time), 1)
    addHeat(targetNode, normalizeTime(e.endTime), 1)
    addHeat(transition, normalizeTime((e.time + e.endTime) / 2), 1)

    processItemVisual.addItem(transition, false, normalizeTime(e.time), normalizeTime(e.endTime))
  }

  transitions.forEach(storeHeatData)

  const getCurrentHeat = (item: IModelItem): number => {
    // we define the heat as the ratio of the current heat value to the items capacity, but not more than 1
    return Math.min(
      1,
      (item as HeatOwner).tag.heat.getValue(processItemVisual.time) /
        (typeof item.tag.capacity === 'number' ? item.tag.capacity : 10)
    )
  }

  return {
    animation: time => {
      processItemVisual.time = time
    },
    getCurrentHeat
  }
}
