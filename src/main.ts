import { createInterface } from "node:readline";
import { Cli } from "./cli/Cli.js";
const cli = new Cli();
const interactive = Boolean(process.stdin.isTTY);
const input = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: interactive,
});
if (interactive) {
  console.log("svg-editor 0.1 — type 'help' for commands");
  input.setPrompt("svg> ");
  input.prompt();
}
input.on("line", (line) => {
  const output = cli.run(line);
  if (output) console.log(output);
  if (interactive) input.prompt();
});
