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
Baseline routes: `/`, `/en`, `/zh-TW`; viewports: desktop 1440x900 and mobile 390x844; themes: light/dark.

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

These are targets, not a claim that production currently meets them.

### AI Gateway
All AI entry points should converge on quota -> queue -> model gateway -> provider routing, keeping model latency isolated from normal API workers.

### AI Eval
Every model/provider change should be evaluated for quality, cost, latency, and safety before production promotion.

### Event Contract
Cross-domain events use versioned event names and stable envelopes. Producers must not directly depend on consumers' persistence models.

### Signed URL Storage
Business files remain private in object storage. Applications return time-limited signed download URLs instead of public object paths.

### Production HA
Stateless API instances, shared Redis state, durable job queues, health/readiness endpoints, and documented backup/restore objectives are required before production scale claims.
