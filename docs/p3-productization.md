# P3 Productization & Production Validation

> Scope note: the 2026-08-21 architecture/product/UI/security assessment explicitly enumerates P0, P1 and P2. It does not define a separate P3 checklist. This document therefore defines P3 from the assessment's explicit final target architecture and priority sequence, without presenting it as source-defined P3.

## Source-derived direction

The assessment's final architecture places Experience Layer, Domain APIs, AI Platform and Event System above shared platform infrastructure. It also states that the project should remain a Modular Monolith while strengthening domain boundaries, event models, AI, security, observability and production-grade validation.

## P3 acceptance targets

### Experience layer
- Global Command Palette is available with `Cmd/Ctrl+K`.
- Navigation actions remain route-based and keyboard accessible.
- Search is exposed as a first-class command rather than a header-only affordance.

### Upload hardening
- Declared MIME type must match file magic bytes before persistence.
- Existing upload allowlist remains the first filter; signature validation is the second gate.
- Invalid content is rejected before object storage writes.

### Production-grade validation
- CodeQL SAST is executed for pull requests.
- CycloneDX SBOM is generated and retained as a CI artifact.
- k6 load smoke baseline exists with HTTP failure and P95 latency thresholds.

### Governance boundaries
- P2 platform contracts remain the source of truth for Tools, Agents, Workflows, Plugins and Governance policies.
- P3 must not bypass Workspace/Role/Permission controls to add convenience features.

## Not claimed by this iteration

- Full Marketplace UI
- Full Workflow Builder UI
- Persistent Knowledge Graph implementation
- Production distributed AI queue migration
- Production object-store adapter completion
- Full Developer Portal UI
- Full Governance Console UI

These remain implementation layers above the P2 contracts or environment-specific production work.
