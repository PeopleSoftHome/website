# 搜索方案迁移评估：Meilisearch → Elasticsearch

> **评估日期**: 2026-05-30 | **评估人**: 架构诊断团队
> **背景**: 当前使用 Meilisearch 0.48.0，随着内容规模增长需评估长期搜索方案

---

## 一、现状分析

| 指标 | 当前值 |
|------|--------|
| 搜索引擎 | Meilisearch 0.48.0 |
| 索引内容 | BlogPosts, ForumTopics, Resources, Cases, Products |
| 搜索功能 | 全文检索、分页、基础过滤 |
| 部署形态 | 单实例 Docker 容器 |

**Meilisearch 的优势**（当前适用）：
- 轻量快速，开箱即用
- 搜索相关性优秀（基于 proximity + typo tolerance）
- 开发友好，REST API 简单直观
- 当前内容规模（博客/论坛/资源）完全在其处理能力内

**Meilisearch 的局限**（未来风险）：
- 集群模式不成熟（v1.0 后才逐步完善）
- 聚合分析能力弱（无法做复杂的漏斗/分面统计）
- 与现有数据分析体系（PostgreSQL + Prisma）集成度低
- 中文分词支持不如 Elasticsearch + IK 插件

---

## 二、Elasticsearch 优势分析

| 维度 | Meilisearch | Elasticsearch |
|------|-------------|---------------|
| **全文搜索** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **分面搜索 (Faceted)** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐⭐ |
| **聚合分析 (Aggregations)** | ⭐⭐☆☆☆ | ⭐⭐⭐⭐⭐ |
| **中文分词** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐⭐（IK 插件） |
| **高可用集群** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐⭐ |
| **与 ELK 生态集成** | ❌ | ⭐⭐⭐⭐⭐ |
| **运维复杂度** | ⭐⭐⭐⭐⭐ 低 | ⭐⭐☆☆☆ 高 |
| **内存/磁盘占用** | ⭐⭐⭐⭐⭐ 低 | ⭐⭐☆☆☆ 高 |
| **学习曲线** | ⭐⭐⭐⭐⭐ 平缓 | ⭐⭐⭐☆☆ 陡峭 |

---

## 三、触发迁移的条件

建议当以下任一条件满足时启动迁移评估：

1. **内容规模** > 100 万文档（当前预计 < 1 万）
2. **搜索并发** > 1000 QPS（当前预计 < 100）
3. **需要复杂搜索功能**：
   - 多字段加权排序（如标题权重 10x，正文 1x）
   - 地理距离搜索（按城市/区域筛选职位/公司）
   - 实时搜索建议（Search-as-you-type 且毫秒级）
   - 搜索行为分析（热门搜索词、零结果查询）
4. **需要搜索与数据分析统一**：将用户搜索日志与业务数据做关联分析
5. **已有 Elasticsearch 基础设施**：团队其他系统已使用 ES，可复用集群

---

## 四、迁移方案

### 4.1 平滑迁移路径（双写阶段）

```
Phase 1: 双写（2 周）
  - 后端写入数据时同时同步到 Meilisearch + Elasticsearch
  - 前端搜索仍走 Meilisearch
  
Phase 2: 灰度切换（1 周）
  - 新搜索功能（如 Faceted Search）走 Elasticsearch
  - 旧搜索功能仍走 Meilisearch
  
Phase 3: 全量切换（1 周）
  - 前端搜索 API 指向 Elasticsearch
  - 保留 Meilisearch 作为降级备份
  
Phase 4: 下线（1 周后）
  - 确认无问题后停止 Meilisearch 双写
```

### 4.2 技术实现

**NestJS 端**：
```typescript
// SearchModule 内部抽象
interface SearchEngine {
  index(document): Promise<void>;
  search(query): Promise<SearchResult>;
}

// 当前实现
class MeilisearchEngine implements SearchEngine { ... }

// 未来实现
class ElasticsearchEngine implements SearchEngine { ... }
```

通过 Strategy 模式封装，切换搜索引擎只需改一行配置。

---

## 五、成本估算

| 成本项 | Meilisearch | Elasticsearch |
|--------|-------------|---------------|
| 云托管费用 | ~$30/月（单实例） | ~$150/月（3 节点基础集群） |
| 运维人力 | 0.1 FTE | 0.3 FTE |
| 迁移开发 | — | 2-3 周 |
| 学习成本 | — | 团队需学习 Query DSL |

---

## 六、决策建议

**当前建议：维持 Meilisearch，做好迁移准备**

1. **SearchModule 内引入 Engine 抽象层**，当前实现 `MeilisearchEngine`，预留 `ElasticsearchEngine` 接口
2. **搜索相关 DTO 和 Service 不绑定具体引擎**，确保未来切换成本最小
3. **监控搜索性能指标**：
   - 索引文档总量
   - 搜索平均响应时间
   - 零结果率
   - 搜索 QPS
4. **当内容量达到 10 万或需要 Faceted Search 时**，启动迁移

**备选轻量方案**：若仅需 Faceted Search，可评估升级至 **Meilisearch v1.6+**（已支持 `facetDistribution`），避免引入 ES 的运维负担。

---

*评估完成于 2026-05-30*
