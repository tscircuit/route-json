import { z } from "zod"
import { expectTypesMatch } from "../lib/utils/expectTypesMatch"
import { PointToConnect, point_to_connect } from "./point_to_connect"
import { type TraceId, trace_id } from "./trace_id"

export interface SimpleRouteConnection {
  name: string
  netConnectionName?: string
  pointsToConnect: Array<PointToConnect>
  source_trace_id?: TraceId
}

export const simple_route_connection = z.object({
  name: z.string(),
  netConnectionName: z.string().optional(),
  pointsToConnect: z.array(point_to_connect),
  source_trace_id: trace_id.optional(),
})

expectTypesMatch<
  z.infer<typeof simple_route_connection>,
  SimpleRouteConnection
>(true)
