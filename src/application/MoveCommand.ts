import { Command } from "./Command.js";
import { Document } from "../domain/Document.js";
export class MoveCommand extends Command {
  constructor(
    private id: string,
    private dx: number,
    private dy: number,
  ) {
    super();
  }
  protected apply(d: Document): string {
    const s = d.find(this.id);
    s.move(this.dx, this.dy);
    return s.tag + "#" + s.id + " moved by (" + this.dx + "," + this.dy + ")";
  }
}
