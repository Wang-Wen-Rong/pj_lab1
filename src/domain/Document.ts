import { Group } from "./Group.js";
import { Shape } from "./Shape.js";
export class Document {
  private rootNode = new Group("");
  constructor(
    private w = 800,
    private h = 600,
  ) {
    this.resize(w, h);
  }
  get root(): Group {
    return this.rootNode;
  }
  get width(): number {
    return this.w;
  }
  get height(): number {
    return this.h;
  }
  resize(w: number, h: number): void {
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0)
      throw new Error("canvas dimensions must be positive");
    this.w = w;
    this.h = h;
  }
  all(): Shape[] {
    const out: Shape[] = [];
    const walk = (g: Shape) => {
      for (const c of g.children) {
        out.push(c);
        walk(c);
      }
    };
    walk(this.root);
    return out;
  }
  find(id: string): Shape {
    const s = this.all().find((s) => s.id === id);
    if (!s) throw new Error("no such shape: " + id);
    return s;
  }
  parent(s: Shape): Group {
    const p = [this.root, ...this.all()].find((n) => n.children.includes(s));
    if (!(p instanceof Group)) throw new Error("shape has no parent");
    return p;
  }
  container(id?: string): Group {
    if (id === undefined) return this.root;
    const s = this.all().find((s) => s.id === id);
    if (!s) throw new Error("no such container: " + id);
    if (!(s instanceof Group)) throw new Error("not a container: " + id);
    return s;
  }
  unique(id: string): void {
    if (!id || /\s/.test(id)) throw new Error("invalid id: " + id);
    if (this.all().some((s) => s.id === id))
      throw new Error("id already exists: " + id);
  }
  clone(): Document {
    const d = new Document(this.w, this.h);
    d.rootNode = this.root.clone();
    return d;
  }
}
