# AI 预问诊结构化助手

## 项目简介
这是一个基于 Vue 3 + Spring Boot 的 AI 预问诊系统，能够将患者的自由文本描述自动转化为结构化病历。

## 技术栈
- **前端**: Vue 3 (Composition API) + Vue Router + Axios
- **后端**: Spring Boot + MyBatis-Flex + Redis
- **数据库**: MySQL
- **AI**: 通义千问/兼容 OpenAI 接口的大模型

## 功能特性

### 基础功能
✅ 对话式问诊界面 - 患者输入症状描述，AI 返回结构化结果  
✅ 结构化引擎 - 调用大模型 API，通过 Prompt 工程输出 JSON 格式病历  
✅ 记录持久化 - MySQL 存储问诊记录，支持历史查询  
✅ 风险高亮 - 识别高风险症状（胸痛、呼吸困难等）并警示  

### 加分功能
✅ Redis 缓存 - 相同主诉文本命中缓存，不重复调用 AI  
✅ 风险识别高亮 - 红旗症状前端高亮显示  
✅ 接口鉴权 - Token 鉴权，模拟多租户场景  

## 本地运行说明

### 1. 环境要求
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 2. 数据库初始化
执行 `sql/init.sql` 创建数据库和表：
```bash
mysql -u root -p < sql/init.sql
```

### 3. 后端配置
修改 `backend/src/main/resources/application.properties`：
```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/medical_care?useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=你的密码

# Redis 配置
spring.data.redis.host=localhost
spring.data.redis.port=6379

# AI 模型配置（根据你的实际情况配置）
forest.model.api-key=你的API密钥
forest.model.base-url=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 4. 启动后端
```bash
cd backend
mvn spring-boot:run
```
后端服务将在 http://localhost:8080 启动

### 5. 启动前端
```bash
cd frontend
pnpm install
pnpm dev
```
前端服务将在 http://localhost:5173 启动

## 使用说明

### 1. AI 问诊
1. 访问 http://localhost:5173
2. 在输入框中描述您的症状（如"我头疼三天了，昨晚开始发烧"）
3. 点击"提交问诊"按钮
4. 等待 AI 分析，查看结构化结果
5. 如有风险标志，会高亮显示警示信息

### 2. 历史记录
1. 点击顶部导航栏的"📋 历史记录"
2. 查看所有过往问诊记录
3. 点击记录卡片可展开查看详细结构化信息

## Prompt 设计说明

### Prompt 版本迭代

**V1 版本（存在问题）**
```
你是专业医疗助手，请分析患者描述，只输出JSON，不要其他文字：

{
    "chief_complaint": "主诉",
    "present_illness": "现病史摘要",
    ...
}
```

**问题**: 系统角色定义中包含示例字段值，导致模型输出时可能污染 JSON 格式

**V2 版本（优化后）**
```
你是一个专业的医疗信息提取助手，只输出JSON格式。
输出格式：
{
    "chief_complaint": "",
    "present_illness": "",
    "symptom_duration": "",
    "accompanying_symptoms": "",
    "suggested_dept": "",
    "risk_flags": ""
}
字段说明：
- chief_complaint: 患者主述
- present_illness: 现病史摘要
- symptom_duration: 症状持续时间
- accompanying_symptoms: 伴随症状
- suggested_dept: 建议科室
- risk_flags: 胸部、呼吸困难、意识障碍等填具体的症状，如果没有则填写"无"
```

**优化点**:
1. 明确角色定位为"信息提取助手"
2. 使用空字符串作为示例，避免污染
3. 详细的字段说明，提高提取准确性
4. 强调"只输出JSON格式"

### JSON 格式稳定性保证
1. **严格的 System Prompt**: 明确要求只输出 JSON
2. **后端校验**: 对 AI 返回内容进行 JSON 解析验证
3. **异常处理**: 格式异常时抛出错误，避免脏数据入库
4. **Redis 缓存**: 成功结果缓存，减少重复调用

## API 接口文档

### 1. 创建问诊记录
**POST** `/medical/consult`

**Headers**:
```
Authorization: Bearer test-token-tenant-001
Content-Type: application/json
```

**Request Body**:
```json
{
  "patientInput": "我头疼三天了，昨晚开始发烧",
  "conversationId": "" // 可选，首次可为空
}
```

**Response**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "conversationId": "uuid-xxx",
    "patientInput": "我头疼三天了，昨晚开始发烧",
    "chiefComplaint": "头痛伴发热",
    "presentIllness": "患者3天前出现头痛...",
    "symptomDuration": "3天",
    "accompanyingDymptoms": "发热，体温38.5度",
    "suggestedDept": "神经内科",
    "riskFlags": "无",
    "createdAt": "2026-05-03T10:30:00"
  }
}
```

### 2. 获取历史记录
**GET** `/medical/history`

**Headers**:
```
Authorization: Bearer test-token-tenant-001
```

**Response**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    { /* 问诊记录对象 */ }
  ]
}
```

## 项目结构
```
medical-care/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/
│   │   └── com/example/backend/
│   │       ├── ai/         # AI 服务
│   │       ├── controller/ # 控制器
│   │       ├── service/    # 业务逻辑
│   │       ├── mapper/     # 数据访问
│   │       ├── pojo/       # 实体类
│   │       ├── interceptor/# 拦截器
│   │       └── config/     # 配置类
│   └── src/main/resources/
│       └── application.properties
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── api/           # API 模块
│   │   ├── views/         # 页面组件
│   │   ├── router/        # 路由配置
│   │   └── App.vue
│   └── package.json
└── sql/
    └── init.sql           # 数据库初始化脚本
```

## 常见问题

### Q: AI 返回的 JSON 格式不正确怎么办？
A: 后端已做校验，会自动抛出异常。可以检查 Prompt 设计或更换更稳定的模型。

### Q: 如何配置自己的 AI 模型？
A: 修改 `application.properties` 中的 `forest.model.*` 配置项，支持通义千问、OpenAI 等兼容接口。

### Q: Token 鉴权如何工作？
A: 前端在请求头中携带 `Authorization: Bearer test-token-tenant-001`，后端拦截器解析出租户 ID 为 "test"，实现简单的多租户隔离。

## 开发过程中发现并修复的问题

### 问题：Prompt 导致 JSON 格式异常
**现象**: AI 返回的内容包含额外文字，无法解析为 JSON

**定位过程**:
1. 查看日志发现模型输出包含解释性文字
2. 检查 Prompt 发现 system 消息中包含了示例字段值
3. 模型误以为需要填充这些示例值

**解决方案**:
1. 将示例字段值改为空字符串
2. 添加详细的字段说明
3. 在后端增加 JSON 格式校验和异常处理

**代码位置**: `backend/src/main/java/com/example/backend/ai/AiService.java` 第 85-122 行

## License
MIT
