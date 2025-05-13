import { z } from "zod"
import { expectTypesMatch } from "../lib/utils/expect-types-match"
import { Obstacle, obstacle } from "./obstacle"
import {
  SimpleRouteConnection,
  simple_route_connection,
} from "./connection"
import { TraceId, trace_id } from "./trace_id"

export interface SimplifiedPcbTraceRouteWire {
  route_type: "wire"
  x: number
  y: number
  width: number
  layer: string
}

export const simplified_pcb_trace_route_wire = z.object({
  route_type: z.literal("wire"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  layer: z.string(),
})

expectTypesMatch<
  z.infer<typeof simplified_pcb_trace_route_wire>,
  SimplifiedPcbTraceRouteWire
>(true)

export interface SimplifiedPcbTraceRouteVia {
  route_type: "via"
  x: number
  y: number
  to_layer: string
  from_layer: string
}

export const simplified_pcb_trace_route_via = z.object({
  route_type: z.literal("via"),
  x: z.number(),
  y: z.number(),
  to_layer: z.string(),
  from_layer: z.string(),
})

expectTypesMatch<
  z.infer<typeof simplified_pcb_trace_route_via>,
  SimplifiedPcbTraceRouteVia
>(true)

export interface SimplifiedPcbTrace {
  type: "pcb_trace"
  pcb_trace_id: TraceId
  connection_name: string
  route: Array<SimplifiedPcbTraceRouteWire | SimplifiedPcbTraceRouteVia>
}

export const simplified_pcb_trace = z.object({
  type: z.literal("pcb_trace"),
  pcb_trace_id: trace_id,
  connection_name: z.string(),
  route: z.array(
    z.union([
      simplified_pcb_trace_route_wire,
      simplified_pcb_trace_route_via,
    ])
  ),
})

expectTypesMatch<
  z.infer<typeof simplified_pcb_trace>,
  SimplifiedPcbTrace
>(true)

export type SimplifiedPcbTraces = Array<SimplifiedPcbTrace>

export const simplified_pcb_traces = z.array(simplified_pcb_trace)

expectTypesMatch<
  z.infer<typeof simplified_pcb_traces>,
  SimplifiedPcbTraces
>(true)

export interface SimpleRouteJson {
  layerCount: number
  minTraceWidth: number
  obstacles: Obstacle[]
  connections: Array<SimpleRouteConnection>
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  traces?: SimplifiedPcbTraces
}

export const simple_route_json = z.object({
  layerCount: z.number(),
  minTraceWidth: z.number(),
  obstacles: z.array(obstacle),
  connections: z.array(simple_route_connection),
  bounds: z.object({
    minX: z.number(),
    maxX: z.number(),
    minY: z.number(),
    maxY: z.number(),
  }),
  traces: simplified_pcb_traces.optional(),
})

expectTypesMatch<z.infer<typeof simple_route_json>, SimpleRouteJson>(true)
