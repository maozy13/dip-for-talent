根据设计文档开发 AI 应用。

# 规则
- 在编写代码前，一定要仔细阅读文档。
- 不要实现任何文档中没有提及的功能。
- 不允许修改 @docs、@openapi 或其他任何规范定义文档

# 上下文信息
- 从 @docs/prd 查询 PRD 文档
- 从 @openapi 目录下查询 OpenAPI 定义

# 环境变量
API 服务地址：https://dip.aishu.cn/api
Authorization: Bearer ory_at_WaCDXOIxHGVfgbgWY65v8mRGOQpqQEaJ8TcmuLlXQIE.vYPuMbf4tTV4g_-KBCkUejHRiJs16roATBYr40RmHlE

# 技术规格
- 使用 Python 3 作为后端语言
- 在 .venv 下创建 Python 虚拟环境
- 使用 FastAPI 作为后端服务框架
- 后端接口超时时间为 1 分钟
- 使用 TypeScript 作为前端开发语言
- 使用 ReactJS 作为前端框架
- 使用 Tailwind CSS 作为 CSS 框架
- 使用 Ant Design 作为 UI 框架，参考 @docs/vendor/antdesign/llms.txt