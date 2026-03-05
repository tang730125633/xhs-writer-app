# 小红书文案助手

专为小红书创作者打造的一站式文案生成工具，支持自定义 Kimi API 接入。

![小红书文案助手](https://img.shields.io/badge/%E5%B0%8F%E7%BA%A2%E4%B9%A6%E6%96%87%E6%A1%88%E5%8A%A9%E6%89%8B-Next.js%2014-blue)

## 功能特点

- **自定义 API**：使用自己的 Kimi API Key，数据私有安全
- **多种风格**：种草风、测评风、教程风、日常风四种风格可选
- **一键生成**：输入标题，秒生成带 emoji 的小红书风格文案
- **历史记录**：自动保存最近 20 条生成记录
- **响应式设计**：支持手机和桌面端访问

## 技术栈

- Next.js 14 + React 19 + TypeScript
- Tailwind CSS
- Kimi API (Moonshot AI)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开 http://localhost:3000
```

## 使用说明

1. 首次使用需要输入 Kimi API Key（仅保存在本地浏览器）
2. 输入文案标题，选择风格
3. 点击生成按钮
4. 一键复制生成的文案

## API 说明

- `POST /api/generate` - 生成文案
  - 参数：`title` (标题), `style` (风格), `apiKey` (Kimi API Key)
  - 返回：`content` (生成内容)

## 部署

项目可直接部署到 Vercel：

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 一键部署

---

Made with ❤️ using Vibe Coding
