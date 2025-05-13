import { TraceId } from "./trace_id"

export interface Obstacle {
  type: "rect"
  layers: string[]
  zLayers?: number[]
  center: { x: number; y: number }
  width: number
  height: number
  connectedTo: TraceId[]
}
