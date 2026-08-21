# P2 Platform Foundation

Based on the 2026-08-21 architecture/product/UI/security assessment.

The assessment defines P2 as the platform expansion stage:
- MCP Tool Platform
- Agent Marketplace
- Knowledge Graph
- AI Workflow Builder
- Plugin SDK
- Developer Portal / Public API
- AI Governance Console

This iteration establishes the shared contracts first. UI-heavy Marketplace/Portal/Console features consume these contracts instead of inventing parallel models.

## Architecture

```text
Developer Portal / Agent Marketplace / Workflow Builder
                    |
                    v
              Public API v1
                    |
          +---------+----------+
          | AI Platform        |
          |                    |
          | Tool Registry      |
          | Agent Registry     |
          | Workflow Runtime   |
          | Knowledge Graph    |
          | Governance         |
          +---------+----------+
                    |
            Domain APIs / Events
```

## Safety boundary

`User -> Workspace -> Role -> Permission -> Tool -> DataScope`

Agents and plugins never receive implicit administrator capability. Every registered tool declares its permission, data scope, risk class and audit requirement.

## P2 acceptance baseline

1. Tools are discoverable through a versioned registry contract.
2. Agents reference tools by stable IDs, never by arbitrary runtime code.
3. Workflow definitions are declarative and versioned.
4. Knowledge graph entities/relations are tenant-scoped.
5. Plugins expose a constrained SDK manifest and lifecycle hooks.
6. Public API is versioned from `/api/v1` and publishes an OpenAPI contract.
7. Governance rules are explicit and testable before production UI is added.
