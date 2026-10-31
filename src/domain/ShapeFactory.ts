import { Shape } from "./Shape.js";
import { Rect } from "./Rect.js";
import { Circle } from "./Circle.js";
import { Ellipse } from "./Ellipse.js";
import { Line } from "./Line.js";
import { Text } from "./Text.js";
import { Group } from "./Group.js";
export class ShapeFactory {
  private readonly providers: Record<
    string,
    {
      keys: string[];
      make: (id: string, n: number[], text: string) => Shape;
      style?: string;
    }
  > = {
    rect: {
      keys: ["x", "y", "width", "height"],
      make: (id, n) => new Rect(id, n),
      style: "fill",
    },
    circle: {
      keys: ["cx", "cy", "r"],
      make: (id, n) => new Circle(id, n),
      style: "fill",
    },
    ellipse: {
      keys: ["cx", "cy", "rx", "ry"],
      make: (id, n) => new Ellipse(id, n),
      style: "fill",
    },
    line: {
      keys: ["x1", "y1", "x2", "y2"],
      make: (id, n) => new Line(id, n),
      style: "stroke",
    },
    text: { keys: ["x", "y"], make: (id, n, t) => new Text(id, n, t) },
    g: { keys: [], make: (id) => new Group(id) },
  };
  private provider(type: string) {
    const p = this.providers[type];
    if (!Object.hasOwn(this.providers, type))
      throw new Error(
        "unknown shape type: " + type + " (is the plugin loaded?)",
      );
    return p;
  }
  create(type: string, id: string, args: string[]): Shape {
    const p = this.provider(type);
    const min = p.keys.length + (type === "text" ? 1 : 0);
    if (args.length < min || args.length > min + (p.style ? 1 : 0))
      throw new Error("invalid parameters for " + type);
    const s = p.make(
      id,
      args.slice(0, p.keys.length).map((v) => Shape.number(v)),
      args[p.keys.length] ?? "",
    );
    if (p.style && args[min] !== undefined) s.set(p.style, args[min]);
    return s;
  }
  fromAttributes(
    type: string,
    id: string,
    attrs: Map<string, string>,
    text: string,
  ): Shape {
    const p = this.provider(type);
    const s = p.make(
      id,
      p.keys.map((k) => Shape.number(attrs.get(k) ?? "0", k)),
      text,
    );
    for (const [k, v] of attrs)
      if (k !== "id" && !p.keys.includes(k)) {
        if (["fill", "stroke", "stroke-width"].includes(k)) s.set(k, v);
        else s.preserve(k, v);
      }
    return s;
  }
}
