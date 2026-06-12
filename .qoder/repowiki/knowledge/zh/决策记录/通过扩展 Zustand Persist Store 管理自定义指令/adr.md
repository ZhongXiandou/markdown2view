# 通过扩展 Zustand Persist Store 管理自定义指令

_来源：eda6dc8 → 976215b 提交周期内记录的编码计划——内容为规划时意图，实现可能滞后或有出入。_

**状态：** accepted

## 背景
用户需要保存和管理自定义的设计指令（Custom Instructions），需要决定持久化存储方案。

## 决策驱动
- 复用现有状态管理机制
- 降低架构复杂度
- 避免额外的 localStorage Key 管理

## 备选方案
- **使用独立的 localStorage Key 存储** _（已否决）_ — 优点：数据隔离清晰；缺点：增加复杂度；需单独处理版本迁移和序列化；与现有 AppState 割裂
- **扩展现有的 Zustand persist store (m2v-store)** — 优点：复用已有的持久化逻辑；自动处理默认值和合并；代码集中易于维护；缺点：单一 Store 体积增大（需限制条数和字符数以防超出 localStorage 限制）

## 决策
直接在 `src/lib/store.ts` 的 AppState 中新增 `customInstructions` 数组及 CRUD actions。利用 Zustand persist 中间件自动将其持久化到现有的 `m2v-store` localStorage key 中。实施安全限制：单条指令最大 5000 字符，总数最多 50 条。

## 影响
简化了存储架构，用户自定义指令与全局状态无缝集成。需注意 localStorage 的 5MB 限制，已通过数量和内容长度限制进行缓解。