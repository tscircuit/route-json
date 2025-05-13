import { Obstacle } from "./obstacle"
import { SimpleRouteConnection } from "./connection"
import { TraceId } from "./trace_id"

export interface SimplifiedPcbTraceRouteWire {
  route_type: "wire"
  x: number
  y: number
  width: number
  layer: string
}

export interface SimplifiedPcbTraceRouteVia {
  route_type: "via"
  x: number
  y: number
  to_layer: string
  from_layer: string
}

export interface SimplifiedPcbTrace {
  type: "pcb_trace"
  pcb_trace_id: TraceId
  connection_name: string
  route: Array<SimplifiedPcbTraceRouteWire | SimplifiedPcbTraceRouteVia>
}

export type SimplifiedPcbTraces = Array<SimplifiedPcbTrace>

export interface SimpleRouteJson {
  layerCount: number
  minTraceWidth: number
  obstacles: Obstacle[]
  connections: Array<SimpleRouteConnection>
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  traces?: SimplifiedPcbTraces
}
