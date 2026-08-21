# Production SLO / Error Budget

P1 operating targets from the 2026-08-21 assessment:

| Metric | Target | Error budget / action |
|---|---:|---|
| Marketing availability | >= 99.99% | Freeze risky releases when budget is exhausted |
| API availability | >= 99.95% | Prioritize reliability work before feature work |
| P95 read API | < 300 ms | Investigate endpoints over budget |
| P95 write API | < 500 ms | Investigate slow writes, queues, and downstreams |
| P99 API | < 1 s | Treat sustained breach as incident-level signal |
| Error rate | < 0.1% | Alert and correlate with deploy/provider changes |
| RPO | <= 15 min | Backup/replication objective |
| RTO | <= 30 min | Restore/failover objective |

## Measurement requirements

- Availability and latency must be measured from the edge and API gateway, not inferred from application logs alone.
- Read/write endpoints need separate latency dashboards.
- AI traffic must have separate latency, error, quota, and provider dashboards.
- Error-budget policy must be attached to release/deployment decisions.
- RPO/RTO are operational targets and require a restore drill to become verified capabilities.

## Current status

These are target contracts. This repository does not yet prove that production traffic meets them.
