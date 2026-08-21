# P1 Implementation Baseline

Based on the 2026-08-21 architecture/product/UI/security assessment, P1 covers:

1. Visual Regression
2. Performance Budget
3. SLO / Error Budget
4. AI Gateway
5. AI Evaluation
6. Event Contract
7. Signed URL Storage
8. Production HA

## Acceptance contracts

### Visual Regression
Baseline routes: `/`, `/en`, `/zh-TW`; viewports: desktop 1440x900 and mobile 390x844; themes: light/dark. Baseline PNGs are release artifacts and must be reviewed and committed; CI never creates or pushes them.

### Performance Budget
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- Initial JS < 250KB gzip
- Hero image < 250KB

### SLO / Error Budget
- Marketing availability >= 99.99%
- API availability >= 99.95%
- P95 read API < 300ms
- P95 write API < 500ms
- P99 API < 1s
- Error rate < 0.1%
- RPO <= 15 min
- RTO <= 30 min

These are targets, not production evidence until measured against the live environment.

### AI Gateway
All AI entry points converge on quota -> queue -> model gateway -> provider routing. Production provider misconfiguration fails closed instead of silently falling back.

### AI Evaluation
Every model/provider change is evaluated for quality, safety, latency and cost. Current CI is a deterministic live-provider gate; broader semantic and adversarial evaluation remains a planned hardening layer.

### Event Contract
Cross-domain events use versioned event names and stable envelopes. Producers must not directly depend on consumers' persistence models.

### Signed URL Storage
Business files remain private. Production requires S3/OSS-compatible object storage and time-limited signed download URLs.

### Production HA
Stateless API instances, shared Redis state, durable queues, health/readiness endpoints, backup/restore and failover drills are required before production scale claims. CI includes a deterministic local PostgreSQL restore + Redis failover drill; production RPO/RTO still requires environment evidence before release.
