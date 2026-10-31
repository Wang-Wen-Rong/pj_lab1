import { readFileSync, writeFileSync } from "node:fs";
import { Cli } from "../dist/cli/Cli.js";

// Record actual execution output; this is a reproducible demo, not chat history.
const cli = new Cli();
const commands = readFileSync("examples/flowchart.txt", "utf8").trim().split(/\r?\n/);
commands.push("undo", "read examples/flowchart.svg", "tree", "show process-label");
const transcript = ["# CLI 演示实录", "", "由 scripts/demo.mjs 执行真实命令生成；save 后的 undo 错误是预期行为。", "", "```text"];
for (const command of commands) {
  const output = cli.run(command);
  transcript.push(`svg> ${command}`, output);
  if (output.startsWith("error:") && command !== "undo") throw new Error(output);
}
transcript.push("```", "");
writeFileSync("doc/demo-transcript.md", transcript.join("\n"));
console.log("Recorded doc/demo-transcript.md and examples/flowchart.svg");
