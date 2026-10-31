import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { Cli } from "../src/cli/Cli.js";
import { SvgCodec } from "../src/infrastructure/SvgCodec.js";
const setup = (lines: string[]) => {
  const cli = new Cli();
  for (const line of ["init", ...lines])
    assert.ok(!cli.run(line).startsWith("error:"), line);
  return cli;
};
test("all shapes, floating coordinates, recursive move and scale", () => {
  const c = setup([
    "create g scene",
    "create rect r 1 2 3 4 in scene",
    "create circle c 2 3 4 in scene",
    "create ellipse e 2 3 4 5 in scene",
    "create line l 1 2 3 4 black in scene",
    'create text t 1.5 2 "中文 & text" in scene',
  ]);
  c.run("move scene 10 20");
  c.run("scale scene 2");
  assert.equal(c.editor.document.find("r").attributes.get("x"), "22");
  assert.equal(c.editor.document.find("r").attributes.get("width"), "6");
  assert.equal(c.editor.document.find("c").attributes.get("r"), "8");
  assert.equal(c.editor.document.find("e").attributes.get("ry"), "10");
  assert.equal(c.editor.document.find("l").attributes.get("x2"), "26");
  assert.equal(c.editor.document.find("t").attributes.get("x"), "23");
  const tree = c.run("tree");
  c.run("undo");
  c.run("redo");
  assert.equal(c.run("tree"), tree);
});
test("failure is atomic and does not clear redo", () => {
  const c = setup(["create rect r 1 2 3 4", "move r 5 6"]);
  c.run("undo");
  const before = c.run("tree");
  assert.match(c.run("set r width -1"), /^error:/);
  assert.match(c.run("create circle r 0 0 1"), /id already exists/);
  assert.equal(c.run("tree"), before);
  c.run("redo");
  assert.equal(c.editor.document.find("r").attributes.get("x"), "6");
  c.run("undo");
  c.run("set r fill blue");
  assert.equal(c.run("redo"), "error: nothing to redo");
});
test("group uses document order, undo restores parents, rejects ancestor selection", () => {
  const c = setup([
    "create g a",
    "create g b",
    "create rect r 1 2 3 4 in a",
    "create circle c 0 0 2 in b",
  ]);
  const before = c.run("tree");
  c.run("group joined c r");
  assert.deepEqual(
    c.editor.document.find("joined").children.map((s) => s.id),
    ["r", "c"],
  );
  c.run("undo");
  assert.equal(c.run("tree"), before);
  assert.equal(
    c.run("group bad a r"),
    "error: cannot group a container into its own descendant: a",
  );
  assert.equal(c.run("tree"), before);
  assert.match(c.run("addto a a"), /^error:/);
  assert.equal(c.run("tree"), before);
});
test("nested ungroup, addto, z-order and delete restore exact structure", () => {
  const c = setup([
    "create g root",
    "create g nested in root",
    "create rect r 0 0 1 1 in nested",
    "create circle c 0 0 1 in root",
  ]);
  const before = c.run("tree");
  c.run("ungroup nested");
  assert.deepEqual(
    c.editor.document.find("root").children.map((s) => s.id),
    ["r", "c"],
  );
  c.run("undo");
  assert.equal(c.run("tree"), before);
  assert.equal(
    c.run("ungroup root"),
    "error: cannot ungroup top-level container: root",
  );
  c.run("addto nested c");
  c.run("front r");
  assert.deepEqual(
    c.editor.document.find("nested").children.map((s) => s.id),
    ["c", "r"],
  );
  c.run("back r");
  assert.deepEqual(
    c.editor.document.find("nested").children.map((s) => s.id),
    ["r", "c"],
  );
  const original = c.run("tree");
  c.run("delete nested");
  assert.throws(() => c.editor.document.find("r"));
  c.run("undo");
  assert.equal(c.run("tree"), original);
});
test("comments, colors, quotes, whitelist and mandatory document", () => {
  const c = new Cli();
  assert.match(c.run("help"), /create/);
  assert.equal(c.run("tree"), "error: no document. use 'init' or 'read' first");
  c.run("init");
  assert.equal(c.run(" # comment"), "");
  c.run("create rect r 0 0 1 1 #ffffff");
  assert.equal(c.editor.document.find("r").attributes.get("fill"), "#ffffff");
  c.run('create text t 0 0 "a b 中文"');
  assert.equal(c.editor.document.find("t").text, "a b 中文");
  assert.equal(c.run("set r r 10"), "error: unknown attribute: r");
  assert.match(c.run("create box b"), /unknown shape type/);
  assert.match(c.run("create g a in r"), /not a container/);
  assert.equal(c.run("scale r 0"), "error: scale factor must be positive");
  assert.match(c.run('set t text "oops'), /unterminated quote/);
});
test("SVG round trip, escaping and missing ID collision avoidance", () => {
  const codec = new SvgCodec();
  const c = setup([
    "create g scene",
    'create text t 1 2 "A & B < C" in scene',
    "create ellipse e 1 2 3 4 red in scene",
  ]);
  const xml = codec.serialize(c.editor.document);
  assert.match(xml, /&amp;/);
  assert.match(xml, /&lt;/);
  assert.equal(codec.serialize(codec.parse(xml).document), xml);
  const result = codec.parse(
    '<svg width="400" height="300"><rect/><rect id="rect1"/><g><circle/></g></svg>',
  );
  assert.ok(
    result.warnings.includes("warning: assigned id rect2 to unnamed <rect>"),
  );
  assert.equal(result.document.all().length, 4);
  assert.throws(
    () => codec.parse('<svg><g id="x"/><rect id="x"/></svg>'),
    /id already exists/,
  );
  assert.throws(
    () => codec.parse('<svg><g transform="translate(2,3)"/></svg>'),
    /transform/,
  );
  assert.throws(() => codec.parse("<svg><rect></svg>"), /invalid SVG/);
});
test("IO boundaries, canvas query and failed IO preserve history", () => {
  const dir = mkdtempSync(join(tmpdir(), "svg-lab-"));
  try {
    const path = join(dir, "demo.svg");
    const c = setup(["create rect r 1 2 3 4"]);
    c.run("canvas");
    c.run("tree");
    c.run("show r");
    assert.equal(c.run("undo"), "edit undone");
    c.run("redo");
    assert.match(
      c.run('read "' + join(dir, "missing.svg") + '"'),
      /cannot read file/,
    );
    assert.equal(c.run("undo"), "edit undone");
    c.run("redo");
    assert.match(c.run('save "' + path + '"'), /^saved/);
    assert.equal(c.run("undo"), "error: undo not allowed after io command");
    c.run("move r 1 1");
    c.run("undo");
    assert.equal(c.run("undo"), "error: nothing to undo");
    assert.match(readFileSync(path, "utf8"), /<rect/);
    assert.match(c.run('read "' + path + '"'), /^read/);
    assert.match(c.run("save"), /^saved/);
    c.run("move r 1 1");
    c.run("canvas 900 700");
    assert.equal(c.run("redo"), "error: undo not allowed after io command");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("CLI process accepts scripts and exits on EOF", () => {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "src/main.ts"],
    {
      input: 'init 400 300\ncreate text t 10 20 "Hello world"\ntree\n',
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /svg \(400x300\)/);
  assert.match(result.stdout, /Hello world/);
});
