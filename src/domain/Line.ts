import { Shape } from "./Shape.js";
export class Line extends Shape {
  constructor(id: string, values: number[]) {
    super(id, "line");
    this.initialize(["x1", "y1", "x2", "y2"], values);
  }
  move(dx: number, dy: number): void {
    this.translate(["x1", "x2"], ["y1", "y2"], dx, dy);
  }
  scale(f: number): void {
    this.multiply(f);
  }
  clone(): Line {
    return this.copyTo(new Line(this.id, [...this.values.values()]));
  }
  override summary(): string {
    return `line#${this.id} (${this.values.get("x1")},${this.values.get("y1")}) -> (${this.values.get("x2")},${this.values.get("y2")})`;
  }
}
