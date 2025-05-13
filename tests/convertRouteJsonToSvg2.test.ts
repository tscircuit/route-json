import { expect, test } from "bun:test"
import { convertRouteJsonToSvg } from "lib/convertRouteJsonToSvg"
import type { SimpleRouteJson } from "spec/simple_route_json"

const srj: SimpleRouteJson = {
  bounds: {
    maxX: 5,
    maxY: 5,
    minX: -5,
    minY: -5,
  },
  obstacles: [
    {
      type: "rect",
      width: 0.6000000000000001,
      center: {
        x: 2.5,
        y: 0,
      },
      height: 0.6000000000000001,
      layers: ["top"],
      connectedTo: [
        "pcb_smtpad_0",
        "connectivity_net0",
        "source_trace_0",
        "source_port_0",
        "source_port_2",
        "pcb_smtpad_0",
        "pcb_port_0",
        "pcb_smtpad_2",
        "pcb_port_2",
      ],
    },
    {
      type: "rect",
      width: 0.6000000000000001,
      center: {
        x: 3.5,
        y: 0,
      },
      height: 0.6000000000000001,
      layers: ["top"],
      connectedTo: [
        "pcb_smtpad_1",
        "connectivity_net11",
        "source_port_1",
        "pcb_smtpad_1",
        "pcb_port_1",
      ],
    },
    {
      type: "rect",
      width: 0.6000000000000001,
      center: {
        x: -3.5,
        y: 0,
      },
      height: 0.6000000000000001,
      layers: ["top"],
      connectedTo: [
        "pcb_smtpad_2",
        "connectivity_net0",
        "source_trace_0",
        "source_port_0",
        "source_port_2",
        "pcb_smtpad_0",
        "pcb_port_0",
        "pcb_smtpad_2",
        "pcb_port_2",
      ],
    },
    {
      type: "rect",
      width: 0.6000000000000001,
      center: {
        x: -2.5,
        y: 0,
      },
      height: 0.6000000000000001,
      layers: ["top"],
      connectedTo: [
        "pcb_smtpad_3",
        "connectivity_net12",
        "source_port_3",
        "pcb_smtpad_3",
        "pcb_port_3",
      ],
    },
  ],
  layerCount: 2,
  connections: [
    {
      name: "source_trace_0",
      pointsToConnect: [
        {
          x: 2.5,
          y: 0,
          layer: "top",
        },
        {
          x: -3.5,
          y: 0,
          layer: "top",
        },
      ],
      source_trace_id: "source_trace_0",
    },
  ],
  minTraceWidth: 0.15,
}

test("convertRouteJsonToSvg", () => {
  const svg = convertRouteJsonToSvg(srj)
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
