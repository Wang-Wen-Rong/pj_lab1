import { test } from "node:test";
import assert from "node:assert/strict";
import { Cli } from "../src/cli/Cli.js";
test("prototype names cannot bypass the command and shape registries", () => {
  const cli = new Cli();
  cli.run("init");
  for (const name of ["constructor", "toString", "__proto__"]) {
    assert.equal(cli.run(name), "error: unknown command: " + name);
    assert.equal(
      cli.run("create " + name + " x"),
      "error: unknown shape type: " + name + " (is the plugin loaded?)",
    );
  }
});
test("overflow in a later child rolls back earlier children too", () => {
  const cli = new Cli();
  for (const line of [
    "init",
    "create g scene",
    "create rect r 1 1 2 2 in scene",
    "create circle c 1e308 0 1 in scene",
  ])
    assert.ok(!cli.run(line).startsWith("error:"));
  const before = cli.run("tree");
  assert.equal(cli.run("scale scene 10"), "error: geometry overflow");
  assert.equal(cli.run("tree"), before);
  cli.run("undo");
  assert.throws(() => cli.editor.document.find("c"));
  assert.equal(cli.editor.document.find("r").attributes.get("x"), "1");
});
test("failed canvas changes and unknown attributes leave history intact", () => {
  const cli = new Cli();
  cli.run("init");
  cli.run('create text t 0 0 "old"');
  cli.run('set t text "new"');
  assert.match(cli.run("canvas -1 20"), /^error:/);
  assert.match(cli.run("set t width 4"), /^error:/);
  cli.run("undo");
  assert.equal(cli.editor.document.find("t").text, "old");
  assert.equal(cli.editor.document.width, 800);
});
test("IDs are case sensitive and deleted IDs can be reused", () => {
  const cli = new Cli();
  cli.run("init");
  cli.run("create g A");
  cli.run("create g a");
  assert.equal(cli.editor.document.all().length, 2);
  cli.run("delete A");
  assert.equal(cli.run("create g A"), "g#A created");
});
