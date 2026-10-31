import { Document } from "../domain/Document.js";
export abstract class Command {
  // Full-document mementos trade memory for exact rollback of multi-parent edits.
  // The live document is replaced only after apply succeeds on the draft.
  private before?: Document;
  private after?: Document;
  private message = "";
  execute(document: Document): { document: Document; message: string } {
    const draft = document.clone();
    this.message = this.apply(draft);
    this.before = document.clone();
    this.after = draft.clone();
    return { document: draft, message: this.message };
  }
  undo(): Document {
    if (!this.before) throw new Error("command not executed");
    return this.before.clone();
  }
  redo(): Document {
    if (!this.after) throw new Error("command not executed");
    return this.after.clone();
  }
  protected abstract apply(document: Document): string;
}
