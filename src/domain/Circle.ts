import { Shape } from "./Shape.js";
export class Circle extends Shape {
  constructor(id: string, values: number[]) {
    super(id, "circle");
    this.initialize(["cx", "cy", "r"], values);
  }
  move(dx: number, dy: number): void {
    this.translate(["cx"], ["cy"], dx, dy);
  }
  scale(f: number): void {
    this.multiply(f);
  }
  clone(): Circle {
    return this.copyTo(new Circle(this.id, [...this.values.values()]));
  }
}
