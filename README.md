# MyTik

## 端口说明

当前项目为 `uni-app` 微信小程序项目，**现阶段不依赖固定业务端口**。

- 微信小程序开发与预览主要通过 `uni-app` 构建结果 + 微信开发者工具完成
- 当前阶段无本地后端服务
- 当前阶段无本地 API 服务
- 当前阶段无数据库服务端口要求

如果后续增加以下能力，再补充端口约定：

- 本地调试 H5 预览
- WebSocket 中转服务
- 局域网互动调试服务
- 后端 API / 数据库

## 项目简介

MyTik 是一个以“本地优先、隐私优先、沉浸式浏览”为核心方向的微信小程序项目，定位为“你的私人短视频空间”。

当前第一阶段目标：

- 使用 `uni-app` 实现微信小程序端
- 以本地视频导入、分类管理、沉浸式播放、个人弹幕留存、JSON 备份恢复为核心能力
- 默认不接入业务后端
- 后续保留扩展到 App 端的能力

相关需求与技术决策文档：

- [MyTik (你的私人短视频空间) - 完整项目需求与产品设计文档 (PRD).md](D:\practice\two\docs\MyTik%20%28%E4%BD%A0%E7%9A%84%E7%A7%81%E4%BA%BA%E7%9F%AD%E8%A7%86%E9%A2%91%E7%A9%BA%E9%97%B4%29%20-%20%E5%AE%8C%E6%95%B4%E9%A1%B9%E7%9B%AE%E9%9C%80%E6%B1%82%E4%B8%8E%E4%BA%A7%E5%93%81%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3%20%28PRD%29.md)
- [MyTik 技术栈选型说明.md](D:\practice\two\docs\MyTik%20%E6%8A%80%E6%9C%AF%E6%A0%88%E9%80%89%E5%9E%8B%E8%AF%B4%E6%98%8E.md)

## 当前技术栈

- `uni-app`
- `Vue 3`
- `TypeScript`
- `Vite`
- `Pinia`
- `Sass / SCSS`
- `uni-ui`
- `dayjs`
- `nanoid`
- `zod`

## 目录结构

```text
.
├─ docs/                    项目文档与需求文档
├─ src/
│  ├─ components/           通用组件与业务组件
│  ├─ composables/          组合式能力封装
│  ├─ constants/            常量定义
│  ├─ pages/                uni-app 页面
│  ├─ repositories/         数据访问层
│  ├─ services/
│  │  ├─ platform/          微信/uni 平台能力封装
│  │  └─ storage/           本地存储封装
│  ├─ stores/               Pinia 状态管理
│  ├─ theme/                主题与设计 token
│  ├─ types/                TypeScript 类型定义
│  └─ utils/                工具函数
├─ index.html               Vite 入口
├─ package.json             项目依赖与脚本
├─ tsconfig.json            TypeScript 配置
└─ vite.config.ts           Vite 配置
```

说明：

- `docs/` 需要纳入版本控制，不忽略
- `material/`、`UIdesign/` 当前作为外部素材和设计参考目录，已加入 `.gitignore`
- `src/pages/` 下已经预留 `library`、`home`、`settings`、`lock` 页面骨架，其中 `lock` 当前为保留目录，非首期必做

## 环境要求

- Node.js：建议 `>= 20`
- npm：建议 `>= 10`
- 微信开发者工具：用于导入和运行 `mp-weixin` 构建产物

当前本地已验证：

- `node v22.14.0`
- `npm 11.10.1`

## 安装依赖

```bash
npm install
```

## 常用命令

微信小程序开发：

```bash
npm run dev:mp-weixin
```

停止微信小程序开发：

```bash
Ctrl + C
```

微信小程序构建：

```bash
npm run build:mp-weixin
```

H5 调试：

```bash
npm run dev:h5
```

停止 H5 调试：

```bash
Ctrl + C
```

H5 构建：

```bash
npm run build:h5
```

类型检查：

```bash
npm run type-check
```

代码格式化：

```bash
npm run format
```

代码检查：

```bash
npm run lint
```

## 当前已完成初始化

- 已完成 `uni-app + Vue 3 + TypeScript + Vite` 工程初始化
- 已安装核心依赖与基础开发工具
- 已建立首期页面骨架
- 已建立主题样式、状态管理、平台能力与本地存储目录
- 已验证 `npm run type-check` 通过
- 已验证 `npm run build:mp-weixin` 通过

微信开发者工具导入目录：

```text
dist/build/mp-weixin
```

如果需要完全结束当前查看流程：

- 停止终端中的 `npm run dev:*` 命令：按 `Ctrl + C`
- 关闭微信开发者工具中的当前项目窗口或停止编译

## 开发约定

- 默认以 `docs/` 中的项目文档为最高优先级约束
- 首期优先微信小程序 MVP，不做无关抽象
- 首期默认无后端
- 所有业务数据默认本地存储
- 优先保证产品闭环、可运行、可验证

## 后续建议开发顺序

1. 读取 `UIdesign` 里的页面设计与视觉规范
2. 先实现主题基础组件与单机评论体验
3. 实现素材库页面与本地视频导入
4. 实现首页沉浸式播放、播放池与个人弹幕回显
5. 实现设置页、JSON 备份导出与恢复
6. 再进入断链修复和体验优化

## 已知说明

- 当前构建时会出现 Sass legacy API 的弃用警告，但**不影响当前开发与构建**
- `uni-app` CLI 会提示有新版本可升级，目前不影响当前项目初始化结果
