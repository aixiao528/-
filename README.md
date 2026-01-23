<img width="2355" height="1463" alt="image" src="https://github.com/user-attachments/assets/af8ce268-581f-438f-a380-f8aef25d2d5c" /># eight-cat





# [呆猫八条“养成”]

> 一个基于 Vue 3 + Vite 的Web端虚拟宠物养成与生产力伴侣应用。

## 📖 简介

“呆猫八条”是一个集**趣味养成**与**实用工具**于一体的单页应用 (SPA)。项目以一只名为“八条”的虚拟猫咪为核心，用户可以通过互动提升好感度，利用番茄钟功能进行专注学习赚取金币，并在商城为八条购买食物和道具。

本项目是**软件工程前端开发课程大作业**，旨在探索现代前端工程化开发、组件化架构设计以及响应式交互体验的实现

- 🌐 **在线演示**: [点击这里查看 Demo](https://github.com/aixiao528/-/releases/download/v1.0.0/default.mp4)
- 📚 **文档地址**: [点击这里查看完整文档](https://github.com/aixiao528/-/releases/download/v1.0.0/4.docx)

## ✨ 核心功能 (Features)

### 1. 🏠 **沉浸式主场景 (Home)**

- **自适应游戏容器**：基于 JS 算法实现的背景与 UI 坐标同步系统，确保在任意屏幕尺寸下，交互按钮都能精准定位在背景图的特定位置。
- **SVG 交互热区**：使用 Polygon 对不规则形状的猫咪进行精确点击检测。
- **动态交互**：扇形展开的喂食工具栏，以及猫咪的随机反馈动画。

### 2. 🍅 **专注番茄钟 (Study)**

- **多状态管理**：包含选择时长、专注进行中、暂停/休息三种状态的有限状态机 (FSM)。
- **沉浸模式**：全屏磨砂玻璃质感 UI，屏蔽干扰。
- **防打断机制**：严格的暂停倒计时逻辑，培养用户专注习惯。

### 3. 🛍️ **经济与商城 (Shop)**

- **数据驱动视图**：基于 Vue 响应式数据的商品列表与背包系统。
- **逻辑闭环**：实现了金币校验、购买扣款、物品入库、悬浮提示 (Tooltip) 等完整电商逻辑。
- **用户激励**：通过专注获得金币，形成“学习-奖励”的正向循环。

### 4. 🤖 **AI 智能对话 (Chat)**

- **拟人化交互**：接入大模型 API，定制了“傲娇小猫”的 System Prompt。
- **流式体验**：模拟打字机效果，实现流畅的对话视觉体验。
- **上下文记忆**：支持多轮对话逻辑。

### 5. 🖼️ **绘本回忆录 (Gallery)**

- **瀑布流布局**：响应式的图片网格展示。
- **灯箱浏览 (Lightbox)**：支持键盘左右切换、ESC 关闭的大图查看器，配合 CSS 果冻弹跳动画。




## 🛠️ 安装指南

**前置条件**:

- Node.js v24.12.0 (或更高版本)
- npm v11.6.2 (或更高版本)

**步骤**:

1. 克隆仓库

	```bash
	git clone https://github.com/aixiao528/-.git
	cd eight-cat
	```

2.安装依赖

	```bash
	npm install
	```

3.配置环境变量
	  在根目录新建.env.local文件，并填入你的api key：

  ```bash
  VITE_DEEPSEEK_API_KEY=
  VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
  ```

4.启动开发服务器

  ```bash
  npm run dev
  ```

5.项目打包

 ```bash
 npm run build
 ```
