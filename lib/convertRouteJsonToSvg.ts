import { getSvgFromGraphicsObject } from "graphics-debug"
import type { SimpleRouteJson } from "spec/simple_route_json"
import { convertRouteJsonToGraphicsObject } from "./convertRouteJsonToGraphicsObject"

export const convertRouteJsonToSvg = (srj: SimpleRouteJson) => {
  const graphicsObject = convertRouteJsonToGraphicsObject(srj)
  return getSvgFromGraphicsObject(graphicsObject)
}
