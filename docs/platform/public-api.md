# TalentPro Public API v1

Base path: `/api/v1`.

P2 platform APIs use a stable resource namespace under `/platform/v1` while retaining the existing domain API versioning model.

## Platform endpoints

- `GET /api/v1/platform/v1/tools` — discover governed tools available to the caller.
- `POST /api/v1/platform/v1/tools/invoke` — invoke a registered tool after role, permission and workspace-scope checks.

## Authentication

Use the existing authenticated session/JWT model. Public API consumers must not bypass workspace and permission checks.

## Compatibility

Breaking platform contract changes require a new schema version. Tool IDs are stable; tool behavior changes require a new tool version.

## Developer Portal baseline

The portal should publish:
- OpenAPI documents
- tool manifests and JSON Schemas
- SDK examples
- authentication and rate-limit policies
- changelog/deprecation schedule
- sandbox credentials and audit requirements
