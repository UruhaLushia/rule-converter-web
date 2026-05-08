# Rule Converter Web

Rule Converter 的浏览器前端，基于本地 WASM 在浏览器内完成规则集转换、匹配测试和 GeoIP/Geosite 索引读取。数据不会上传到服务器。

这个仓库主要用于展示和测试 `@uruhalushia/rule-converter-wasm` 的浏览器集成方式，是一个轻量示例/玩具项目，不一定适合作为有实际生产意义的完整 Web 工具使用。

## 功能

- 支持 Mihomo、Sing-Box、Egern、General、GeoIP、Geosite、ASN 相关格式。
- 支持文本、文件和多输入条目；多输入可合并构建数据库。
- 支持自动检测输入类型，并在可确定格式时锁定输入选项。
- 支持规则匹配测试，查看命中的原始规则和来源集合。
- 支持读取数据库索引，并通过虚拟滚动选择、搜索和筛选条目。
- 支持浅色/深色模式跟随系统设置。

## 开发

项目默认使用 npm 上发布的 `@uruhalushia/rule-converter-wasm`：

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

构建产物输出到 `dist/`。

## 代码检查

```bash
pnpm format
pnpm lint
```

## 依赖

- React 19
- Vite 8
- HeroUI 3
- Tailwind CSS 4
- `@uruhalushia/rule-converter-wasm`
