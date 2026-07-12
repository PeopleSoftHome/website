# src/shared — 可复用能力层

本目录汇总前端门户中可跨项目复用的模块，采用 **re-export** 方式保持与现有代码兼容，未来合并时可直接整体迁移。

## 子目录

| 目录 | 说明 | 代表模块 |
|------|------|----------|
| `api/` | HTTP 客户端与统一响应处理 | `client.ts` |
| `cms/` | CMS 数据获取与 fallback 注册表 | `useCmsData.ts` |
| `composables/` | 通用 UI / 状态 / 搜索 / 主题 Composables | `useTheme`, `useSearch`, `useSiteConfig`, `useNavigation` |
| `utils/` | SSR-safe 工具函数 | `jsonld.ts`, `date.ts` |

## 使用方式

业务代码继续通过原有路径导入；跨项目复用时建议从 `@/shared/*` 导入。

```ts
import { apiClient } from '@/shared/api/client';
import { useCmsDataByKey } from '@/shared/cms/useCmsData';
import { useTheme } from '@/shared/composables';
```

## 迁移到其它项目

1. 复制 `src/shared/` 到新项目。
2. 根据新项目框架调整 `client.ts` 的 baseURL / 拦截器。
3. 替换 Pinia store 为对应状态管理方案（若不用 Pinia）。
4. 保留 i18n 相关 Composables 时，同步迁移 `i18n.config.ts` 与 locale 文件。
