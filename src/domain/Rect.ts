import { Shape } from "./Shape.js";
export class Rect extends Shape {
  constructor(id: string, values: number[]) {
    super(id, "rect");
    this.initialize(["x", "y", "width", "height"], values);
  }
  move(dx: number, dy: number): void {
    this.translate(["x"], ["y"], dx, dy);
  }
  scale(f: number): void {
    this.multiply(f);
  }
  clone(): Rect {
    return this.copyTo(new Rect(this.id, [...this.values.values()]));
  }
  override summary(): string {
    return super
      .summary()
      .replace(/\bwidth=/g, "w=")
      .replace(/\bheight=/g, "h=");
  }
}
