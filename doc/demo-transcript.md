# CLI 演示实录

由 scripts/demo.mjs 执行真实命令生成；save 后的 undo 错误是预期行为。

```text
svg> init 800 600
canvas 800x600 created
svg> create g flowchart
g#flowchart created
svg> create g node1 in flowchart
g#node1 created in g#flowchart
svg> create rect start 120 100 160 60 #4a90d9 in node1
rect#start created in g#node1
svg> create text start-label 155 135 "开始" in node1
text#start-label created in g#node1
svg> create g node2 in flowchart
g#node2 created in g#flowchart
svg> create rect process 520 100 160 60 #f5a623 in node2
rect#process created in g#node2
svg> create text process-label 545 135 "处理数据" in node2
text#process-label created in g#node2
svg> create line arrow1 280 130 520 130 black in flowchart
line#arrow1 created in g#flowchart
svg> move node2 0 100
g#node2 moved by (0,100)
svg> undo
edit undone: g#node2 moved by (0,100)
svg> set process-label text "处理数据 v2"
text#process-label updated: text="处理数据 v2"
svg> tree
svg (800x600)
└── g#flowchart
    ├── g#node1
    │   ├── rect#start fill=#4a90d9 x=120 y=100 w=160 h=60
    │   └── text#start-label (155,135) "开始"
    ├── g#node2
    │   ├── rect#process fill=#f5a623 x=520 y=100 w=160 h=60
    │   └── text#process-label (545,135) "处理数据 v2"
    └── line#arrow1 (280,130) -> (520,130)
svg> save examples/flowchart.svg
saved to examples/flowchart.svg (8 elements)
svg> undo
error: undo not allowed after io command
svg> read examples/flowchart.svg
read examples/flowchart.svg (8 elements)
svg> tree
svg (800x600)
└── g#flowchart
    ├── g#node1
    │   ├── rect#start fill=#4a90d9 x=120 y=100 w=160 h=60
    │   └── text#start-label (155,135) "开始"
    ├── g#node2
    │   ├── rect#process fill=#f5a623 x=520 y=100 w=160 h=60
    │   └── text#process-label (545,135) "处理数据 v2"
    └── line#arrow1 (280,130) -> (520,130)
svg> show process-label
text#process-label  parent=g#node2
  x=545 y=135
  text="处理数据 v2"
```
