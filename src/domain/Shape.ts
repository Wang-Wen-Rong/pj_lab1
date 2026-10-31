export abstract class Shape {
  private styles = new Map<string, string>();
  protected values = new Map<string, number>();
  protected content = "";
  constructor(
    private readonly identity: string,
    public readonly tag: string,
  ) {}
  get id(): string {
    return this.identity;
  }
  get children(): readonly Shape[] {
    return [];
  }
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  protected initialize(names: string[], values: number[]): void {
    if (names.length !== values.length)
      throw new Error("invalid shape parameters");
    names.forEach((name, i) =>
      this.values.set(name, Shape.number(values[i], name)),
    );
    this.validateGeometry();
  }
  static number(value: unknown, name = "number"): number {
    if (typeof value === "string" && value.trim() === "")
      throw new Error("invalid " + name);
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error("invalid " + name);
    return n;
  }
  protected validateGeometry(): void {
    for (const key of ["width", "height", "r", "rx", "ry"])
      if ((this.values.get(key) ?? 0) < 0)
        throw new Error(key + " must be non-negative");
  }
  set(attr: string, value: string): void {
    if (this.values.has(attr)) {
      const n = Shape.number(value, attr);
      if (["width", "height", "r", "rx", "ry"].includes(attr) && n < 0)
        throw new Error(attr + " must be non-negative");
      this.values.set(attr, n);
      return;
    }
    if (["fill", "stroke", "stroke-width"].includes(attr)) {
      if (attr === "stroke-width" && Shape.number(value, attr) < 0)
        throw new Error("stroke-width must be non-negative");
      this.styles.set(attr, value);
      return;
    }
    throw new Error("unknown attribute: " + attr);
  }
  preserve(attr: string, value: string): void {
    this.styles.set(attr, value);
  }
  get attributes(): ReadonlyMap<string, string> {
    return new Map([
      ...this.styles,
      ...[...this.values].map(([k, v]) => [k, String(v)] as [string, string]),
    ]);
  }
  get text(): string {
    return this.content;
  }
  protected translate(
    xs: string[],
    ys: string[],
    dx: number,
    dy: number,
  ): void {
    for (const k of xs) this.values.set(k, this.values.get(k)! + dx);
    for (const k of ys) this.values.set(k, this.values.get(k)! + dy);
    this.assertFinite();
  }
  protected multiply(f: number): void {
    for (const [k, v] of this.values) this.values.set(k, v * f);
    this.assertFinite();
  }
  private assertFinite(): void {
    for (const value of this.values.values())
      if (!Number.isFinite(value)) throw new Error("geometry overflow");
  }
  protected copyTo<T extends Shape>(other: T): T {
    for (const [k, v] of this.styles) other.preserve(k, v);
    return other;
  }
  summary(): string {
    return (
      this.tag +
      "#" +
      this.id +
      " " +
      [...this.attributes].map(([k, v]) => k + "=" + v).join(" ")
    );
  }
  details(): string[] {
    const geometry = [...this.values].map(([k, v]) => `${k}=${v}`).join(" ");
    return [geometry, ...[...this.styles].map(([k, v]) => `${k}=${v}`)].filter(
      Boolean,
    );
  }
}
