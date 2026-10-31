# SVG Editor — Lab1 Phase 1

TypeScript 面向对象 SVG 命令行编辑器，支持六种图形、嵌套分组、撤销重做和 SVG 文件读写。Node.js 22 或更新版本。

```sh
npm ci
npm run cli
npm run check
npm test
npm run build
```

交互模式输入 `help` 查看语法，Ctrl+D（Windows 可使用 Ctrl+Z 后回车）结束。PowerShell 回放示例：

```powershell
Get-Content -Encoding utf8 examples/flowchart.txt | npm run cli
```

生成的 `examples/flowchart.svg` 可直接拖入浏览器。详细架构、语义约定、开发记录和质量说明见 [doc/README.md](doc/README.md)。本阶段不支持 box 插件；SVG 导入支持六类元素，遇到 transform、未知元素及非默认 viewBox 明确报错。
