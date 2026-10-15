# FitPilot 电子健身私教

FitPilot 是一个本地优先、可安装的健身私教 Web 应用。它会根据训练目标、经验、时间、可用器械和旧伤信息生成每周计划，并在训练中记录重量、次数、组间休息和主观反馈。即使没有任何 API Key，完整训练流程也能使用。

## 核心能力

- 2–5 天自适应训练计划，内置 31 个已审核动作
- 动作示意、动作提示、同模式替换与器械过滤
- 每组重量/次数记录、可恢复的组间计时器
- RPE、目标肌群感受、疼痛与代偿反馈
- 基于训练反馈的安全进阶规则和训练总结
- 本地规则教练，以及可选的 OpenAI 结构化 AI 教练
- 浏览器本地存储、PWA 安装信息、移动端和桌面端布局

## 本地运行

要求 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

打开 <http://127.0.0.1:3000>。首次进入时完成训练档案；档案、计划和训练记录默认只保存在当前浏览器的 `localStorage`。

## 可选：启用 OpenAI 教练

不配置 Key 时，Agent 自动使用本地规则。要启用模型建议：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```dotenv
OPENAI_API_KEY=你的_api_key
OPENAI_MODEL=gpt-4o-mini
```

然后重新启动 `npm run dev`。API Key 只由服务端路由读取，不会发送到浏览器。请求超时、返回格式异常或未配置 Key 时会自动回退到本地建议；疼痛和危险症状始终优先执行确定性的本地安全规则。

启用 AI 模式后，为了生成相关建议，服务端会把当前问题、精简后的训练档案与计划，以及最近 3 次训练的时间和总结发送给 OpenAI。不要在提问中输入不希望交给模型处理的敏感信息。

## 验证与构建

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

一次运行所有检查：

```bash
npm run verify
```

首次运行端到端测试时，如本机没有 Playwright 浏览器：

```bash
npx playwright install chromium
```

生产模式：

```bash
npm run build
npm start
```

## 目录

- `src/domain/`：动作库、计划、进阶、安全与校验规则
- `src/store/`：Zustand 本地持久化和训练状态机
- `src/components/`：建档、计划、训练、总结与 Agent 界面
- `src/app/api/coach/`：可选 OpenAI 服务端接口
- `tests/`：单元、状态、组件和 API 测试
- `e2e/`：真实浏览器核心流程测试

## 安全边界

本项目不提供医学诊断、康复处方或紧急医疗服务。训练中出现胸部不适、呼吸困难、眩晕、晕厥或明显疼痛时，应立即停止训练并寻求合适的专业帮助。
