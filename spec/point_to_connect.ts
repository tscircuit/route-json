import { z } from "zod"
import { expectTypesMatch } from "../lib/utils/expectTypesMatch"

export interface PointToConnect {
  x: number
  y: number
  layer: string
  pcb_port_id?: string
}

export const point_to_connect = z.object({
  x: z.number(),
  y: z.number(),
  layer: z.string(),
  pcb_port_id: z.string().optional(),
})

expectTypesMatch<z.infer<typeof point_to_connect>, PointToConnect>(true)
