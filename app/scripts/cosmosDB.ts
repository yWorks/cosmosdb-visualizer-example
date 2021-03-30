type NodeData = { id: number; label: string; capacity: number }
type EdgeData = { id: number; from: number; to: number; time: number; endTime: number }

export async function loadData(): Promise<{ states: NodeData[]; transitions: EdgeData[] }> {
  const transitions = await (await fetch('/cosmos/transitions')).json()
  const states = await (await fetch('/cosmos/states')).json()
  return { states, transitions }
}
