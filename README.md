# route-json

[![npm version](https://badge.fury.io/js/route-json.svg)](https://badge.fury.io/js/route-json)

This package defines the **Simple Route JSON (SRJ)** format. SRJ is a lightweight, straightforward format designed to describe a Printed Circuit Board (PCB) routing problem. It serves as a common intermediary representation used by [`tscircuit` autorouters](https://github.com/tscircuit/unravel-autorouter), simplifying the complex details often found in full PCB design files. For a detailed specification, please refer to the [tscircuit docs for Simple Route JSON](https://docs.tscircuit.com/advanced/simple-route-json).

The primary goal of SRJ is to provide only the essential information required for a routing algorithm:

1.  Where routing is allowed (layers, board boundaries).
2.  Where routing is forbidden (obstacles, keep-out areas).
3.  What needs to be connected (nets and their associated pins/pads).
4.  Basic routing constraints (minimum trace width).

SRJ can be directly generated from more comprehensive formats like [Circuit JSON](https://circuitjson.com), stripping away details irrelevant to the core routing task (e.g., specific component models, schematic information beyond connectivity). It shares conceptual similarities with the industry-standard [Specctra DSN (Design)](https://github.com/tscircuit/dsn-converter) format, but aims for greater simplicity and modern JSON representation.

> **Info:** A formal specification with versioning is planned for the future. To stay updated on its release and other tscircuit developments, please subscribe to [the tscircuit newsletter](https://blog.tscircuit.com/).

This package is part of the broader [tscircuit](https://github.com/tscircuit/tscircuit) ecosystem, a suite of tools for designing electronics using TypeScript and React.

## Format Structure

A Simple Route JSON file is a single JSON object containing the definition of the board layout, obstacles, and connections needed for routing.

```typescript
export interface SimpleRouteJson {
  /** The total number of conductive layers on the PCB. */
  layerCount: number;

  /** The default or minimum width for traces. Specific trace segments might override this if the format evolves, but currently used as a general guideline. Units are implicit (e.g., mm, inches) and must be consistent throughout the file. */
  minTraceWidth: number;

  /** An array of obstacles on the board, such as component pads, mounting holes, or keep-out areas. */
  obstacles: Obstacle[];

  /** An array defining the electrical connections (nets) that need to be routed. */
  connections: Array<SimpleRouteConnection>;

  /** The bounding box defining the extents of the routing area. */
  bounds: { minX: number; maxX: number; minY: number; maxY: number };

  /** [Optional] The routing solution provided by an autorouter. This array contains the actual paths of the traces. It is typically absent in the input file given to a router and present in the output file. */
  traces?: SimplifiedPcbTrace[];
}
```

## Top-Level Properties

### `layerCount`

- **Type:** `number`
- **Description:** An integer specifying the total number of conductive layers available for routing on the PCB. Layers are typically identified by string names (e.g., `"top"`, `"inner1"`, `"bottom"`) within other parts of the format (like `obstacles` and `connections`). While `layerCount` provides the total number, the specific layer names used must be consistent throughout the file.

### `minTraceWidth`

- **Type:** `number`
- **Description:** Specifies the default or minimum trace width to be used by the autorouter. This acts as a global constraint. Future versions or specific router implementations might allow per-net or per-segment width rules, but this provides a baseline.
- **Units:** Units (e.g., millimeters, inches) are not explicitly defined by the format. It is crucial that the same unit system is used consistently for all dimensional values (`minTraceWidth`, `obstacles`, `bounds`, coordinates) within a single SRJ file. Millimeters (mm) are commonly used. (See also [Units and Coordinate System](#units-and-coordinate-system)).

### `obstacles`

- **Type:** `Array<Obstacle>`
- **Description:** An array containing objects that represent areas on the PCB where routing is either restricted or represents a connection point. Obstacles can be physical component pads, mounting holes, board edges defined as keep-outs, or explicit keep-out zones.

```typescript
export type Obstacle = {
  /** The shape of the obstacle. Currently, only "rect" is standard. Oval shapes might be included in future revisions. */
  type: "rect"; // NOTE: most datasets do not contain ovals

  /** An array of layer names (strings) on which this obstacle exists. An obstacle can span multiple layers (e.g., a plated through-hole pad). */
  layers: string[];

  /** The center coordinates of the obstacle. */
  center: { x: number; y: number };

  /** The width of the rectangular obstacle. */
  width: number;

  /** The height of the rectangular obstacle. */
  height: number;

  /** An array of connection names (strings) that this obstacle is part of. If this obstacle is a pad for a net (e.g., "GND", "VCC"), the net name(s) will be listed here. If the array is empty, the obstacle is typically a keep-out area or an unconnected feature. */
  connectedTo: string[]; // Corresponds to TraceId[] in the package's spec
};
```
- **`type`**: Defines the geometry. Currently `"rect"` is the standard.
- **`layers`**: Specifies which layer(s) the obstacle occupies. Important for multi-layer routing.
- **`center`, `width`, `height`**: Define the geometry and position of the rectangle. Units must be consistent with `minTraceWidth` and `bounds`.
- **`connectedTo`**: This critical field links obstacles (like pads) to the electrical nets defined in the `connections` array. If an obstacle represents a pin for the "VCC" net, `connectedTo` would contain `["VCC"]`.

### `connections`

- **Type:** `Array<SimpleRouteConnection>`
- **Description:** Defines the sets of points that need to be electrically connected. Each object in the array represents a single net (e.g., power, ground, signal).

```typescript
export interface SimpleRouteConnection {
  /** The unique name of the connection or net (e.g., "GND", "VCC", "DATA0"). This name is referenced by Obstacle.connectedTo. */
  name: string;

  /** An array of points that must be connected together to form this net. Each point typically corresponds to the center of an obstacle (pad) belonging to this net. */
  pointsToConnect: Array<{
    /** The x-coordinate of the connection point. */
    x: number;
    /** The y-coordinate of the connection point. */
    y: number;
    /** The layer name (string) on which this connection point resides. */
    layer: string;
    /** The pcb_port_id this point corresponds to (optional, from package spec). */
    pcb_port_id?: string;
  }>;
}
```
- **`name`**: A unique string identifier for the net. This is used to link `Obstacle` objects (pads) to their respective nets.
- **`pointsToConnect`**: An array listing the specific locations (`x`, `y`, `layer`) that the router must connect. These points usually align with the `center` coordinates and `layers` of the corresponding `Obstacle` objects linked via the `name`.

### `bounds`

- **Type:** `object`
- **Description:** Defines the rectangular boundary of the area where routing is permitted. Traces should generally not extend beyond these limits.
- **Structure:**
  - `minX`: The minimum x-coordinate of the routing area.
  - `maxX`: The maximum x-coordinate of the routing area.
  - `minY`: The minimum y-coordinate of the routing area.
  - `maxY`: The maximum y-coordinate of the routing area.
- **Units:** Must be consistent with other dimensional values in the file.

### `traces` (Optional)

- **Type:** `Array<SimplifiedPcbTrace>`
- **Description:** This array represents the output of an autorouter -- the actual geometric paths (traces and vias) that implement the required connections. It is typically **not present** in the input SRJ file given to the router.
- **Presence:** Included in the SRJ file *after* routing has been successfully completed.

```typescript
export type SimplifiedPcbTrace = {
  /** Identifier indicating the object type. Always "pcb_trace". */
  type: "pcb_trace";

  /** A unique identifier for this specific trace path. */
  pcb_trace_id: string; // Corresponds to TraceId in the package's spec

  /** [Optional] The name of the connection/net this trace belongs to. Links the solved route back to the SimpleRouteConnection definition. */
  connection_name?: string;

  /** An array defining the geometry of the trace path, composed of wire segments and vias. */
  route: Array<
    | {
        /** Indicates a straight wire segment on a single layer. */
        route_type: "wire";
        /** The x-coordinate of the *end* point of the wire segment. */
        x: number;
        /** The y-coordinate of the *end* point of the wire segment. */
        y: number;
        /** The width of this wire segment. */
        width: number;
        /** The layer name (string) this wire segment is on. */
        layer: string;
      }
    | {
        /** Indicates a via connecting two layers. */
        route_type: "via";
        /** The x-coordinate of the via's center. */
        x: number;
        /** The y-coordinate of the via's center. */
        y: number;
        /** The layer name (string) the via transitions *to*. */
        to_layer: string;
        /** The layer name (string) the via transitions *from*. */
        from_layer: string;
      }
  >;
};
```
- **`type`**: Always `"pcb_trace"`.
- **`pcb_trace_id`**: Unique ID for the trace.
- **`connection_name`**: Links trace to the net name from `connections`.
- **`route`**: An ordered array describing the path:
  - **`wire`**: Represents a straight segment of copper trace. The segment runs from the end point of the previous element in the `route` array (or an initial connection point) to the specified `(x, y)` coordinate on the given `layer` with the specified `width`.
  - **`via`**: Represents a vertical connection between layers at `(x, y)`, transitioning from `from_layer` to `to_layer`. Note that physical via characteristics (drill size, annular ring) are not detailed in this simplified format.

Zod schemas are provided in the `/spec` directory for validation and type inference.

## Example

```json
{
  "layerCount": 2,
  "minTraceWidth": 0.15,
  "obstacles": [
    {
      "type": "rect",
      "layers": ["top"],
      "center": { "x": 10, "y": 10 },
      "width": 1.2,
      "height": 1.2,
      "connectedTo": ["VCC"]
    },
    {
      "type": "rect",
      "layers": ["top"],
      "center": { "x": 30, "y": 10 },
      "width": 1.2,
      "height": 1.2,
      "connectedTo": ["VCC"]
    },
    {
      "type": "rect",
      "layers": ["bottom"],
      "center": { "x": 20, "y": 25 },
      "width": 1.2,
      "height": 1.2,
      "connectedTo": ["GND"]
    },
    {
      "type": "rect",
      "layers": ["bottom"],
      "center": { "x": 40, "y": 25 },
      "width": 1.2,
      "height": 1.2,
      "connectedTo": ["GND"]
    },
    {
      "type": "rect",
      "layers": ["top", "bottom"],
      "center": { "x": 25, "y": 15 },
      "width": 5,
      "height": 3,
      "connectedTo": []
    }
  ],
  "connections": [
    {
      "name": "VCC",
      "pointsToConnect": [
        { "x": 10, "y": 10, "layer": "top" },
        { "x": 30, "y": 10, "layer": "top" }
      ]
    },
    {
      "name": "GND",
      "pointsToConnect": [
        { "x": 20, "y": 25, "layer": "bottom" },
        { "x": 40, "y": 25, "layer": "bottom" }
      ]
    }
  ],
  "bounds": {
    "minX": 0,
    "maxX": 50,
    "minY": 0,
    "maxY": 40
  },
  "traces": [
    {
      "type": "pcb_trace",
      "pcb_trace_id": "trace_vcc_1",
      "connection_name": "VCC",
      "route": [
        { "route_type": "wire", "x": 10, "y": 10, "width": 0.15, "layer": "top" },
        { "route_type": "wire", "x": 20, "y": 5, "width": 0.15, "layer": "top" },
        { "route_type": "wire", "x": 30, "y": 10, "width": 0.15, "layer": "top" }
      ]
    },
    {
      "type": "pcb_trace",
      "pcb_trace_id": "trace_gnd_1",
      "connection_name": "GND",
      "route": [
        { "route_type": "wire", "x": 20, "y": 25, "width": 0.15, "layer": "bottom" },
        { "route_type": "wire", "x": 30, "y": 25, "width": 0.15, "layer": "bottom" },
        { "route_type": "via", "x": 30, "y": 25, "from_layer": "bottom", "to_layer": "top" },
        { "route_type": "wire", "x": 30, "y": 20, "width": 0.15, "layer": "top" },
        { "route_type": "via", "x": 30, "y": 20, "from_layer": "top", "to_layer": "bottom" },
        { "route_type": "wire", "x": 40, "y": 25, "width": 0.15, "layer": "bottom" }
      ]
    }
  ]
}
```

## Units and Coordinate System

The Simple Route JSON format does **not** enforce specific units (e.g., mm, mil, inches) or a coordinate system origin (e.g., top-left, bottom-left).

- **Consistency is Key:** All dimensional values (`minTraceWidth`, obstacle `width`/`height`, `bounds`, all `x`/`y` coordinates in `obstacles`, `connections`, and `traces`) within a single SRJ file **must** use the same units.
- **Common Practice:** Millimeters (mm) are frequently used.
- **Origin:** The coordinate system origin is typically assumed to be top-left or bottom-left, with X increasing to the right and Y increasing downwards (top-left) or upwards (bottom-left). Consistency within the file and between the SRJ generator and consumer (the autorouter) is essential.

## Relationship to Other tscircuit Projects

- **[tscircuit](https://github.com/tscircuit/tscircuit):**
  The main "React for Circuits" project. `route-json` provides a data format that can be used by autorouting tools integrated or utilized within the tscircuit ecosystem.

- `layerCount: number`: The number of copper layers available on the PCB (e.g., 2 for a typical two-layer board).
- `minTraceWidth: number`: The minimum allowable width for copper traces.
- `obstacles: Obstacle[]`: An array defining areas where traces cannot be routed. These can represent physical components, keep-out zones, or pre-existing copper.
  - Each `Obstacle` typically includes its `type` (e.g., "rect"), `layers` it applies to, `center` coordinates, `width`, and `height`.
- `connections: SimpleRouteConnection[]`: An array describing the sets of points (nets) that need to be electrically connected by traces.
  - Each `SimpleRouteConnection` has a `name` and an array of `pointsToConnect`.
  - Each `PointToConnect` specifies `x`, `y` coordinates and the `layer` it resides on.
- `bounds: { minX: number; maxX: number; minY: number; maxY: number }`: Defines the overall rectangular boundary of the routing area.
- `traces?: SimplifiedPcbTraces`: (Optional in input, primary output from an autorouter) An array describing the paths of copper traces and vias that form the electrical connections.
  - Each trace consists of `route` segments, which can be `wire` (a path on a single layer) or `via` (a connection between layers).

Zod schemas are provided in the `/spec` directory for validation and type inference.

## Relationship to Other tscircuit Projects

- **[tscircuit](https://github.com/tscircuit/tscircuit):**
  The main "React for Circuits" project. `route-json` provides a data format that can be used by autorouting tools integrated or utilized within the tscircuit ecosystem.

- **Circuit JSON:** Simple Route JSON is a simplified derivative of [Circuit JSON](https://circuitjson.com). Tools can convert Circuit JSON to SRJ by extracting layer stackup information, component pad locations and net assignments, board outlines, and any defined keep-out areas. Information not relevant to routing (e.g., schematic IDs, component values, 3D models) is omitted.
- **Specctra DSN:** SRJ serves a similar purpose to DSN files – describing a routing problem. However, SRJ uses a modern JSON structure, which is often easier to parse and generate in web-based and JavaScript/TypeScript environments compared to the text-based, keyword-driven DSN format. The [`dsn-converter` tool](https://github.com/tscircuit/dsn-converter) can facilitate conversion between DSN and SRJ or similar formats.
- **[tscircuit-autorouter](https://github.com/tscircuit/tscircuit-autorouter):** This is a key consumer of the `SimpleRouteJson` format. The `tscircuit-autorouter` (such as [unravel-autorouter](https://github.com/tscircuit/unravel-autorouter)) takes a `SimpleRouteJson` object as input, performs the PCB routing, and outputs a `SimpleRouteJson` object with the `traces` field populated with the routing solution.

## Installation

To use `route-json` in your project, install it using bun (or your preferred package manager):

```bash
bun add route-json
# or
npm install route-json
# or
yarn add route-json
```

_(Note: Replace `route-json` with the actual published package name if different.)_

## Usage

The primary use case for Simple Route JSON is as the input and output format for `tscircuit` autorouting tools.

1.  **Input:** A PCB design tool or conversion script generates an SRJ file describing the board, obstacles, and connections. This file is fed into an autorouter.
2.  **Output:** The autorouter processes the input SRJ, computes the trace paths, and outputs a new SRJ file that includes the original data plus the `traces` array detailing the solution.
3.  **Post-processing:** The output SRJ (with traces) can then be converted back into a format compatible with PCB design software (like Circuit JSON, KiCad, Eagle, etc.) to integrate the routing solution into the full PCB design.

### Using with TypeScript

You can import the types and Zod schemas from this package:

```typescript
import { z } from "zod"
import type {
  SimpleRouteJson,
  Obstacle,
  SimpleRouteConnection,
} from "route-json" // Typically "route-json" when installed as a dependency
import {
  simple_route_json, // Zod schema for SimpleRouteJson
  // obstacle, // Zod schema for Obstacle, if needed
  // simple_route_connection, // Zod schema for SimpleRouteConnection, if needed
} from "route-json" // Assuming Zod schemas are exported from the main package entry

// Example of creating a simple routing problem
const myRoutingProblem: SimpleRouteJson = {
  layerCount: 2,
  minTraceWidth: 0.15, // e.g., in mm
  bounds: { minX: 0, maxX: 50, minY: 0, maxY: 30 },
  obstacles: [
    {
      type: "rect",
      layers: ["top", "bottom"], // Applies to both layers
      center: { x: 10, y: 10 },
      width: 5,
      height: 5,
      connectedTo: [], // Assuming this obstacle isn't part of a net initially
    },
  ],
  connections: [
    {
      name: "NET1",
      pointsToConnect: [
        { x: 5, y: 5, layer: "top", pcb_port_id: "U1-1" },
        { x: 20, y: 20, layer: "top", pcb_port_id: "R1-1" },
      ],
    },
  ],
  // 'traces' would be undefined or empty for an unsolved problem
}

// Validate the problem (optional, but good practice)
try {
  simple_route_json.parse(myRoutingProblem)
  console.log("Routing problem is valid!")
} catch (error) {
  console.error("Invalid routing problem:", error)
}
```

## Package Structure

- `/spec`: Contains all Zod schema definitions (`*.ts` files like `simple_route_json.ts`, `obstacle.ts`) which also serve as the source for the TypeScript type interfaces.
- `/lib`: Contains utility functions built around the `SimpleRouteJson` type.
  - `convertRouteJsonToSvg.ts`: Converts a `SimpleRouteJson` object (potentially with traces) into an SVG representation for visualization.
  - `convertRouteJsonToGraphicsObject.ts`: Converts `SimpleRouteJson` to a generic graphics object, which is then used by the SVG converter.
  - `/utils`: Helper functions for the library.

## Development

To work on this project locally:

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd route-json
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Run tests:**

    ```bash
    bun test
    ```

4.  **Build the package:**
    ```bash
    bun run build
    ```

## Contributing

Contributions are welcome! Please feel free to submit issues for bugs or feature requests, or open pull requests with improvements.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
