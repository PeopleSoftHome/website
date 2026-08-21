import fs from 'node:fs';
import path from 'node:path';

const datasetPath = path.resolve('docs/ai-eval/dataset.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

const failures = [];
for (const item of dataset.cases) {
  const answer = item.referenceAnswer || '';
  const expected = item.mustInclude || [];
  const missing = expected.filter((term) => !answer.includes(term));
  if (missing.length) {
    failures.push({ id: item.id, missing });
  }
}

const summary = {
  total: dataset.cases.length,
  passed: dataset.cases.length - failures.length,
  failed: failures.length,
  qualityScore: dataset.cases.length ? (dataset.cases.length - failures.length) / dataset.cases.length : 1,
  targetQualityScore: dataset.targetQualityScore,
  status: failures.length === 0 && (dataset.cases.length === 0 || (dataset.cases.length - failures.length) / dataset.cases.length >= dataset.targetQualityScore) ? 'pass' : 'fail',
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exit(1);
}
