import { Command } from "./Command.js";
import { Document } from "../domain/Document.js";
export class DeleteCommand extends Command {
  constructor(private id: string) {
    super();
  }
  protected apply(d: Document): string {
    const s = d.find(this.id);
    d.parent(s).remove(s);
    return s.tag + "#" + s.id + " deleted";
  }
}
