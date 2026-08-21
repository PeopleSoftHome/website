const ownerRepo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const ref = process.env.GITHUB_REF_NAME;

if (!ownerRepo || !token || !ref) {
  console.error('CodeQL gate requires GITHUB_REPOSITORY, GITHUB_TOKEN and GITHUB_REF_NAME.');
  process.exit(1);
}

const url = `https://api.github.com/repos/${ownerRepo}/code-scanning/alerts?ref=${encodeURIComponent(ref)}&state=open&per_page=100`;
const response = await fetch(url, {
  headers: {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'x-github-api-version': '2022-11-28',
  },
});

if (!response.ok) {
  console.error(`Unable to query CodeQL alerts: ${response.status} ${await response.text()}`);
  process.exit(1);
}

const alerts = await response.json();
const blocking = alerts.filter((alert) => ['high', 'critical'].includes((alert.rule?.security_severity_level || alert.rule?.severity || '').toLowerCase()));

console.log(JSON.stringify({
  ref,
  openAlerts: alerts.length,
  blockingAlerts: blocking.length,
  alerts: alerts.map((alert) => ({
    number: alert.number,
    severity: alert.rule?.security_severity_level || alert.rule?.severity || 'unknown',
    rule: alert.rule?.id,
    path: alert.most_recent_instance?.location?.path,
    line: alert.most_recent_instance?.location?.start_line,
  })),
}, null, 2));

if (blocking.length) process.exit(1);
