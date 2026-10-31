import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Cli } from "../src/cli/Cli.js";
import { SvgCodec } from "../src/infrastructure/SvgCodec.js";

test("A01: help describes all six create schemas and show lists attributes", () => {
  const cli = new Cli();
  const help = cli.run("help");
  for (const type of ["rect", "circle", "ellipse", "line", "text", "g"])
    assert.ok(help.includes(`create ${type} <id>`));
  cli.run("init");
  cli.run("create g markers");
  cli.run("create circle c1 100 100 20 red in markers");
  assert.equal(
    cli.run("show c1"),
    "circle#c1  parent=g#markers\n  cx=100 cy=100 r=20\n  fill=red",
  );
});

test("A02: each editing command is one reversible unit", () => {
  const cli = new Cli();
  for (const line of [
    "init",
    "create g outer",
    "create g inner in outer",
    "create rect r 1 2 3 4 in inner",
    "create circle c 1 2 3 in inner",
  ])
    cli.run(line);
  for (const line of [
    'create text t 0 0 "text" in outer',
    "move r 4 5",
    "scale inner 2",
    "set c fill blue",
    "front r",
    "back c",
    "addto outer r",
    "group pair r c",
    "ungroup inner",
    "delete inner",
  ]) {
    const before = cli.run("tree");
    assert.ok(!cli.run(line).startsWith("error:"), line);
    const after = cli.run("tree");
    assert.match(cli.run("undo"), /^edit undone:/);
    assert.equal(cli.run("tree"), before, line);
    assert.match(cli.run("redo"), /^edit redone:/);
    assert.equal(cli.run("tree"), after, line);
    cli.run("undo");
  }
});

test("A03: specified errors preserve exact document state", () => {
  const cli = new Cli();
  cli.run("init");
  cli.run("create rect r1 0 0 2 2");
  const cases = [
    ["create rect r1 0 0 1 1", "id already exists: r1"],
    ["delete r9", "no such shape: r9"],
    ["create g g1 in node9", "no such container: node9"],
    ["create g g1 in r1", "not a container: r1"],
    ["create hexagon x", "unknown shape type: hexagon (is the plugin loaded?)"],
    ["set r1 label x", "unknown attribute: label"],
    ["scale r1 -2", "scale factor must be positive"],
  ];
  const before = cli.run("tree");
  for (const [line, error] of cases) {
    assert.equal(cli.run(line), "error: " + error);
    assert.equal(cli.run("tree"), before);
  }
});

test("A04: failed save/read preserve document, path, and redo", () => {
  const dir = mkdtempSync(join(tmpdir(), "svg-acceptance-"));
  try {
    const cli = new Cli();
    cli.run("init");
    assert.equal(cli.run("save"), "error: no file path. use save <file.svg>");
    cli.run("create rect r 0 0 1 1");
    const path = join(dir, "good.svg");
    cli.run(`save "${path}"`);
    cli.run("move r 10 20");
    cli.run("undo");
    const before = cli.run("tree");
    const bad = join(dir, "bad.svg");
    writeFileSync(bad, '<svg><g id="x"/><g id="x"/></svg>');
    assert.equal(cli.run(`read "${bad}"`), "error: id already exists: x");
    const blocked = join(dir, "directory.svg");
    mkdirSync(blocked);
    assert.equal(
      cli.run(`save "${blocked}"`),
      `error: cannot write file: ${blocked}`,
    );
    assert.equal(cli.editor.path, path);
    assert.equal(cli.run("tree"), before);
    assert.match(cli.run("redo"), /^edit redone:/);
    assert.equal(cli.editor.document.find("r").attributes.get("x"), "10");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("A05: style defaults, text escaping and imported extra attributes survive", () => {
  const cli = new Cli();
  cli.run("init");
  cli.run('create text t 0 0 ""');
  cli.run("create line l 0 0 1 1");
  const codec = new SvgCodec();
  const xml = codec.serialize(cli.editor.document);
  assert.ok(!xml.includes("fill="));
  assert.ok(!xml.includes("stroke="));
  const imported = codec.parse(
    '<svg width="10" height="10"><text id="t" x="1" y="2" font-size="16">A &amp; B &lt; C</text></svg>',
  ).document;
  assert.equal(imported.find("t").text, "A & B < C");
  assert.equal(
    codec
      .parse(codec.serialize(imported))
      .document.find("t")
      .attributes.get("font-size"),
    "16",
  );
});

test("A06: document reset discards paths/history, invalid reset is atomic", () => {
  const cli = new Cli();
  cli.run("init");
  cli.run("create g a");
  assert.match(cli.run("init -1 600"), /^error:/);
  assert.match(cli.run("undo"), /^edit undone:/);
  cli.run("init 400 300");
  assert.equal(cli.run("tree"), "svg (400x300)");
  assert.equal(cli.run("redo"), "error: undo not allowed after io command");
  assert.equal(cli.editor.path, undefined);
});

test("A07: architecture dependencies stay directed", () => {
  for (const file of ["Shape", "Document", "Group", "ShapeFactory"]) {
    const source = readFileSync(`src/domain/${file}.ts`, "utf8");
    assert.doesNotMatch(
      source,
      /from\s+["'](?:node:|\.\.\/application|\.\.\/cli|\.\.\/infrastructure)/,
    );
  }
  for (const file of ["Command", "Editor", "GroupCommand", "CreateCommand"]) {
    assert.doesNotMatch(
      readFileSync(`src/application/${file}.ts`, "utf8"),
      /from\s+["'](?:node:|\.\.\/cli|\.\.\/infrastructure)/,
    );
  }
});
