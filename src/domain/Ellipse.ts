import { Shape } from "./Shape.js";
export class Ellipse extends Shape {
  constructor(id: string, values: number[]) {
    super(id, "ellipse");
    this.initialize(["cx", "cy", "rx", "ry"], values);
  }
  move(dx: number, dy: number): void {
    this.translate(["cx"], ["cy"], dx, dy);
  }
  scale(f: number): void {
    this.multiply(f);
  }
  clone(): Ellipse {
    return this.copyTo(new Ellipse(this.id, [...this.values.values()]));
  }
}
