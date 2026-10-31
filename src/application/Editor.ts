import { Document } from "../domain/Document.js";
import { Command } from "./Command.js";
export class Editor {
  private current?: Document;
  private past: Command[] = [];
  private future: Command[] = [];
  private locked = false;
  private file?: string;
  get document(): Document {
    if (!this.current)
      throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  get path(): string | undefined {
    return this.file;
  }
  replace(document: Document, path?: string): void {
    this.current = document;
    this.file = path;
    this.boundary();
  }
  saved(path: string): void {
    this.file = path;
    this.boundary();
  }
  resize(w: number, h: number): void {
    const draft = this.document.clone();
    draft.resize(w, h);
    this.current = draft;
    this.boundary();
  }
  private boundary(): void {
    this.past = [];
    this.future = [];
    this.locked = true;
  }
  execute(command: Command): string {
    const result = command.execute(this.document);
    this.current = result.document;
    this.past.push(command);
    this.future = [];
    this.locked = false;
    return result.message;
  }
  undo(): string {
    this.document;
    if (this.locked) throw new Error("undo not allowed after io command");
    const c = this.past.at(-1);
    if (!c) throw new Error("nothing to undo");
    this.current = c.undo();
    this.past.pop();
    this.future.push(c);
    return "edit undone: " + c.description;
  }
  redo(): string {
    this.document;
    if (this.locked) throw new Error("undo not allowed after io command");
    const c = this.future.at(-1);
    if (!c) throw new Error("nothing to redo");
    this.current = c.redo();
    this.future.pop();
    this.past.push(c);
    return "edit redone: " + c.description;
  }
}
