import 'yfiles/yfiles.css'

import {
  License,
  Class,
  LayoutExecutor,
  ICommand,
  TimeSpan,
  PolylineEdgeStyle,
  IModelItem,
  HierarchicLayout,
  Size,
  GraphViewerInputMode,
  IGraph,
  GraphComponent
} from 'yfiles'
import { bindAction, bindCommand, bindChangeListener, showApp } from './resources/demo-app'

import { detectInternetExplorerVersion, webGlSupported } from './utils/Workarounds'

import { AnimationController } from './utils/AnimationController'
import { ProcessingStepNodeStyle } from './utils/ProcessingStepNodeStyle'

import { addHeatMap } from './utils/Heatmap'
import { constructGraph } from './utils/constructgraph'
import { installProcessItemVisual } from './utils/ProcessItemVisual'
import { initializeAnimation } from './utils/Animation'
import { loadData } from './cosmosDB'

import license from '../../license.json'

// Tell the library about the license contents
License.value = license

// We need to load the yfiles/view-layout-bridge module explicitly to prevent the webpack
// tree shaker from removing this dependency which is needed for 'morphLayout' in this demo.
Class.ensure(LayoutExecutor)

/**
 * Initializes the graph and wires up the UI
 */
async function initialize(): Promise<void> {
  if (!webGlSupported) {
    document.getElementById('no-webgl-support')!.removeAttribute('style')
    showApp(null)
    return
  }

  const internetExplorer = detectInternetExplorerVersion() !== -1
  if (internetExplorer) {
    alert(
      `This browser does not support all modern JavaScript constructs which are required for the process mining visualization demo. Hence, some visual features will be omitted.
Use a more recent browser like Chrome, Edge, Firefox or Safari to run this demo and explore the complete set of features.`
    )
  }

  // create a GraphComponent
  const graphComponent = new GraphComponent('#graphComponent')
  // create an input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // create and configure a default node and edge styles style
  const graph = graphComponent.graph
  initializeStyles(graph, getHeat)

  const { states, transitions } = await loadData()

  // load the sample graph
  constructGraph(graph, states, transitions)

  // apply an automatic layout - we need this to do before the animation
  // in order to fix the layout of the edges
  graph.applyLayout(new HierarchicLayout())
  graphComponent.fitGraphBounds()

  // add the item visualizer
  const processItemVisual = installProcessItemVisual(graphComponent)

  // add the heatmap visualization
  if (!internetExplorer) {
    addHeatMap(graphComponent, getHeat)
  }

  // initialize the animation that shows the process items for the given transitions
  // and the heatmap data
  const { animation, getCurrentHeat } = initializeAnimation(graph, processItemVisual, transitions)

  function getHeat(item: IModelItem): number {
    return getCurrentHeat(item)
  }

  // wire up the controls
  const input = document.querySelector("[data-command='MaximumDuration']") as HTMLInputElement
  function setProgress(progress: number): void {
    animation(progress)
    input.value = String(progress * 100)
  }

  // initialize the animation and controls
  const animationController = new AnimationController(
    graphComponent,
    TimeSpan.fromSeconds(10),
    setProgress
  )

  // initialize the demo
  showApp(graphComponent)

  // setup the remainder of the UI
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindChangeListener("input[data-command='MaximumDuration']", value => {
    if (!animationController.running) {
      setProgress(Number(value) / 100)
      graphComponent.invalidate()
    }
  })
  bindAction("button[data-command='start-animation']", () => animationController.restartAnimation())

  // and start the playback of the simulation
  await animationController.runAnimation()
}

function initializeStyles(graph: IGraph, getHeat: (item: IModelItem) => number) {
  /**
   * Helper function to quantize a value to multiples of 1/30th.
   */
  function quantize(value: number): number {
    return Math.floor(value * 30) / 30
  }

  graph.nodeDefaults.style = new ProcessingStepNodeStyle(
    node => quantize(getHeat(node)),
    node => node.tag.label
  )
  graph.nodeDefaults.size = new Size(150, 30)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px solid #33a',
    targetArrow: '#33a default',
    smoothingLength: 10
  })
}

initialize().catch(e => {
  debugger
})
