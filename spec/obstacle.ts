import { z } from "zod"
import { expectTypesMatch } from "../lib/utils/expectTypesMatch"
import { type TraceId, trace_id } from "./trace_id"

export interface Obstacle {
  type: "rect"
  layers: string[]
  zLayers?: number[]
  center: { x: number; y: number }
  width: number
  height: number
  connectedTo: TraceId[]
}

export const obstacle = z.object({
  type: z.literal("rect"),
  layers: z.array(z.string()),
  zLayers: z.array(z.number()).optional(),
  center: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number(),
  height: z.number(),
  connectedTo: z.array(trace_id),
})

expectTypesMatch<z.infer<typeof obstacle>, Obstacle>(true)
