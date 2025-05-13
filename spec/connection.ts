import { PointToConnect } from "./point_to_connect"

export interface SimpleRouteConnection {
  name: string
  netConnectionName?: string
  pointsToConnect: Array<PointToConnect>
}
