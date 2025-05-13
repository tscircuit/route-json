# route-json

[![npm version](https://badge.fury.io/js/route-json.svg)](https://badge.fury.io/js/route-json)

`route-json` is a TypeScript package that defines the `SimpleRouteJson` data type. This format provides a simplified data structure specifically designed for describing PCB (Printed Circuit Board) autorouting problems. It is intended to be a simpler, more direct interface for autorouting algorithms compared to more comprehensive formats like the full [Circuit JSON](https://github.com/tscircuit/circuit-json) specification. Read more on the [tscircuit docs for Simple Route JSON](https://docs.tscircuit.com/advanced/simple-route-json)

This package is part of the broader [tscircuit](https://github.com/tscircuit/tscircuit) ecosystem, a suite of tools for designing electronics using TypeScript and React.

## Purpose

The primary goal of `route-json` is to offer a well-defined, minimal, and easy-to-use data interchange format for PCB autorouters. By focusing solely on the elements essential for routing, it simplifies the input and output requirements for autorouting tools.

Key aspects:

- **Simplicity:** Defines only what's necessary for routing (obstacles, connections, board parameters).
- **Interoperability:** Acts as a clear contract for tools that generate routing problems or consume them to produce routed boards.
- **Extensibility:** While minimal, the TypeScript and Zod definitions allow for clear extensions if needed in the future.

## `SimpleRouteJson` Data Structure

The core of this package is the `SimpleRouteJson` interface, which includes the following key properties:

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

- **[circuit-json](https://github.com/tscircuit/circuit-json):**
  `circuit-json` is a comprehensive, low-level representation for all aspects of an electronic circuit (schematic, PCB, metadata, etc.). `SimpleRouteJson` can be considered a specialized and simplified format, potentially derived from `circuit-json` data, focusing exclusively on the information needed for PCB autorouting. It is not a replacement for `circuit-json` but rather a targeted data structure for a specific task.

- **[tscircuit-autorouter](https://github.com/tscircuit/tscircuit-autorouter):**
  This is a key consumer of the `SimpleRouteJson` format. The `tscircuit-autorouter` takes a `SimpleRouteJson` object as input, performs the PCB routing, and outputs a `SimpleRouteJson` object with the `traces` field populated with the routing solution.

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

You can import the types and Zod schemas from the package:

```typescript
import { z } from "zod"
import type {
  SimpleRouteJson,
  Obstacle,
  SimpleRouteConnection,
} from "route-json" // Adjust path if needed
import {
  simple_route_json,
  obstacle,
  simple_route_connection,
} from "route-json" // For Zod schemas

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
