# dsh-plugin-file-manager

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）Web 界面右侧挂一个文件管理面板：
列出当前工作区目录、内联预览文本文件，并把文件交给操作系统的默认应用打开。

- **停靠，不是浮层遮挡**：展开时给 `body` 加右内边距，应用自己的三列网格随之收缩，不遮住对话内容。
- **跟随工作区**：默认落在当前会话的工作目录，切换工作区/会话时自动跳过去。
- **一次点击即可打开**：点文件用系统默认应用打开，同时在下方预览文本；点目录进入下一层。
- **零构建步骤**：浏览器半边是手写的 lazy-CJS bundle，改完刷新页面即可。

英文版见 [README.md](README.md)。

## 功能

| | |
| --- | --- |
| 右侧停靠面板 | 拖左边缘调宽（280–760px），可收起成 40px 窄条；宽度、展开状态、最后浏览目录存在 `localStorage`。 |
| 跟随工作区 | 当前会话 `cwd` → 最近使用的 Workspace → 宿主进程目录。 |
| 浏览 | 面包屑跳转、上一级、可编辑路径框（回车跳转）、刷新、隐藏项开关；目录在前、名称自然排序、文件显示大小。 |
| 预览 | 只读文本预览，上限 512 KiB（`maxReadBytes`），超出标记「已截断」；二进制文件自动识别、不解码。 |
| 打开 | 经 `ctx.workspaces` 调用 `host.openPath`，走系统默认应用；另有显式按钮、复制路径、打开当前目录。 |

## 环境要求

- `dsh` 0.1.0-rc.6 或更高，且以 `web` profile 启动（`dsh web`）。
- 宿主 Node.js 22+（`dsh` 运行时要求）。

## 安装

### 方式 A —— 作为 profile bundle（推荐）

包内声明了 `dsh.bundle`，所以 `dsh plugin` 安装时会顺带把 profile 行接好：

```sh
dsh plugin --profile web add dsh-plugin-file-manager   # 已发布到 npm 时
dsh plugin --profile web add ./dsh-plugin-file-manager # 从 checkout 或 tarball 安装
```

然后启动（或重启）`dsh web`。**不需要**改 `cordis.patch.yml` —— bundle 层自带插入行。

### 方式 B —— 手工安装（无需 pnpm）

1. 让 profile 目录能按包名解析到这个包。Windows 用 junction（macOS / Linux 用符号链接即可）：

   ```powershell
   New-Item -ItemType Junction `
     -Path "$env:USERPROFILE\.dsh\profiles\node_modules\dsh-plugin-file-manager" `
     -Target "<本仓库的绝对路径>"
   ```

2. 在你自己的 patch 层（`~/.dsh/profiles/web/cordis.patch.yml`）插入一行：

   ```yaml
   - insert:
       - id: file-manager
         name: 'dsh-plugin-file-manager'
   ```

   这个文件是热加载的：宿主半边立即挂载，HTTP 接口随即可用。浏览器半边属于页面启动时的插件表，
   所以**需要刷新一次页面**。

> 两种方式只选一种。同时使用会插入两条同 id 的条目，Loader 会因重复 id 报错。

## 使用

1. 打开 dsh Web 界面，面板出现在右侧；如果之前收起过，点 40px 窄条上的文件夹图标展开。
2. 面板默认停在当前会话的工作区。点目录进入、点面包屑跳转，或在路径框输入绝对路径回车。
3. 点文件：交给系统默认应用打开，同时下方列出文本内容。
4. 预览栏有「用系统默认应用打开」「复制文件路径」按钮；页脚有「复制当前目录」「在系统文件管理器中打开当前目录」。

想改成「点一下只预览、用按钮打开」：把 `lib/client.js` 顶部的 `const OPEN_ON_CLICK = true;` 改成 `false`。

## 配置

全部可省略。写在插入行上：

```yaml
- insert:
    - id: file-manager
      name: 'dsh-plugin-file-manager'
      config:
        root: 'C:\path\to\fallback-folder'  # 仅兜底：有会话时以会话 cwd 为准
        maxEntries: 1500                     # 单层目录最多返回多少行
        maxReadBytes: 524288                 # 512 KiB 文本预览上限
```

| 键 | 默认值 | 含义 |
| --- | --- | --- |
| `root` | `process.cwd()` | 既无会话也无工作区时的初始目录。 |
| `maxEntries` | `1500` | 单层最多返回行数，超出时列表标 `truncated`。 |
| `maxReadBytes` | `524288` | 单次读取字节数，超出时预览标「已截断」。 |

## 实现说明

这是一个**双面包**：一个 profile 行同时挂载两半。

| 半边 | 入口 | 职责 |
| --- | --- | --- |
| Node（宿主） | `lib/index.js` | 在 `ctx.webServer` 上注册只读的 `GET /file-manager/api/{root,list,read}`。 |
| 浏览器 | `lib/client.js` | 通过 `dsh.client` 清单被发现，由 `/plugins/<id>/client.js` 提供，注册一个 `shell.overlay` 条目。 |

- HTTP 面就是 `node:http` handler + `node:fs/promises`，不依赖 harness 的 RPC 契约，也没有第三方依赖。
  只接受全限定路径（Windows 上是 `C:\…` 或完整 UNC），与内置目录选择器同一条围栏。
- 浏览器半边遵循 DSH 的 lazy-CJS 约定：`window.__ModuleLoader__.load({ id, factory })`，
  `factory(require)` 只能 require 平台种子模块。这里用了 `react` 与
  `@deepseek-ai/dsh-client-ui-primitives`，因此不需要打包器。
- `shell.overlay` 是整帧浮层（`list` 槽，默认穿透点击，条目自己声明 `pointer-events`）。面板在其中
  `position: fixed`，所以能脱离 frame 的网格；`body` 的内边距则让网格把右侧空间让出来。

## 安全与隐私

- **只读**：没有写入、删除、重命名、新建接口，也不执行 shell。
- **无外部网络访问**：宿主只服务本地 HTTP；浏览器半边只请求自身来源（`/file-manager/api/*`）；
  没有遥测、统计或远程资源。
- **默认回环**：跑在 dsh 自己的 web server 上（默认 `127.0.0.1`），不发送 CORS 头，第三方页面读不到响应体。
- **全盘范围**：与内置目录选择器一致，浏览不限制在工作区内。这是本地开发工具，不是沙箱边界——
  dsh 宿主进程能读的，面板都能读。
- **路径出现在查询串**（`?path=...`），会进入浏览器历史和你启用的宿主请求日志。
- 插件在 `localStorage` 里只存 `{ open, width, lastPath }`，不会把任何数据发到本机之外。

## 开发

没有构建步骤。改完 `lib/client.js` 或 `lib/index.js` 后：

```sh
npm run check   # 对两半执行 node --check
```

然后刷新浏览器标签页。宿主半边改动需要重启 `dsh`（ESM 不做热替换），客户端改动只需刷新页面。

## 已知限制

- Windows 隐藏项只按「点前缀」判定（Node dirent 不暴露 `FILE_ATTRIBUTE_HIDDEN`）。
- 单层超过 800 条时跳过逐条 `stat`，这些行不显示大小。
- 没有搜索、多选和文件操作。
- 面板是全局单例：跟随当前会话，不按会话分屏。

## 许可证

MIT，见 `LICENSE`。
