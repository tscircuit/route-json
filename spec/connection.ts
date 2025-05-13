import { z } from "zod"
import { expectTypesMatch } from "../lib/utils/expect-types-match"
import { PointToConnect, point_to_connect } from "./point_to_connect"

export interface SimpleRouteConnection {
  name: string
  netConnectionName?: string
  pointsToConnect: Array<PointToConnect>
}

export const simple_route_connection = z.object({
  name: z.string(),
  netConnectionName: z.string().optional(),
  pointsToConnect: z.array(point_to_connect),
})

expectTypesMatch<
  z.infer<typeof simple_route_connection>,
  SimpleRouteConnection
>(true)
