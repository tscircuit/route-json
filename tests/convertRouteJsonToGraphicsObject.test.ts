import { expect, test } from "bun:test"
import { convertRouteJsonToGraphicsObject } from "lib/convertRouteJsonToGraphicsObject"
import type { SimpleRouteJson } from "spec/simple_route_json"

const createRouteJson = (layerCount: number): SimpleRouteJson => ({
  layerCount,
  minTraceWidth: 0.15,
  bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
  connections: [],
  obstacles: [],
})

const obstacleCases: [string, number, string[], string][] = [
  ["top-only two-layer control", 2, ["top"], "z0"],
  ["bottom-only two-layer obstacle", 2, ["bottom"], "z1"],
  ["two-layer through-hole obstacle", 2, ["top", "bottom"], "z0,1"],
  ["reordered through-hole layers", 2, ["bottom", "top"], "z1,0"],
  ["four-layer bottom obstacle", 4, ["bottom"], "z3"],
  ["nonadjacent layers on a four-layer board", 4, ["inner2", "bottom"], "z2,3"],
  ["six-layer bottom obstacle", 6, ["bottom"], "z5"],
]

for (const [name, layerCount, layers, expectedLayer] of obstacleCases) {
  test(name, () => {
    const srj = createRouteJson(layerCount)
    srj.obstacles = [
      {
        type: "rect",
        layers,
        center: { x: 2, y: 3 },
        width: 4,
        height: 5,
        connectedTo: [],
      },
    ]

    const graphics = convertRouteJsonToGraphicsObject(srj)

    expect(graphics.rects).toEqual([
      {
        center: { x: 2, y: 3 },
        width: 4,
        height: 5,
        fill: "rgba(255,0,0,0.5)",
        layer: expectedLayer,
      },
    ])
  })
}

const wireCases: [string, number, string, string][] = [
  ["top wire control", 4, "top", "z0"],
  ["two-layer bottom wire control", 2, "bottom", "z1"],
  ["four-layer bottom wire", 4, "bottom", "z3"],
  ["inner wire control", 4, "inner2", "z2"],
  ["six-layer bottom wire", 6, "bottom", "z5"],
]

for (const [name, layerCount, layer, expectedLayer] of wireCases) {
  test(name, () => {
    const srj = createRouteJson(layerCount)
    srj.traces = [
      {
        type: "pcb_trace",
        pcb_trace_id: "pcb_trace_0",
        connection_name: "connection_0",
        route: [
          { route_type: "wire", x: 1, y: 2, width: 0.15, layer },
          { route_type: "wire", x: 3, y: 4, width: 0.15, layer },
        ],
      },
    ]

    const graphics = convertRouteJsonToGraphicsObject(srj)

    expect(graphics.lines).toHaveLength(1)
    expect(graphics.lines[0]?.layer).toBe(expectedLayer)
    expect(graphics.lines[0]?.points).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ])
  })
}

test("empty obstacle collection control", () => {
  expect(convertRouteJsonToGraphicsObject(createRouteJson(4)).rects).toEqual([])
})
