/**
 * validate-version-sync.cjs
 * 校验三个子项目的 package.json 版本号是否一致，并与 CHANGELOG.md 最新版本对齐。
 * 退出码 0 表示同步，1 表示不一致。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const PACKAGES = [
  { name: 'root', file: path.join(ROOT, 'package.json') },
  { name: 'talentpro-backend', file: path.join(ROOT, 'talentpro-backend', 'package.json') },
  { name: 'talentpro-admin', file: path.join(ROOT, 'talentpro-admin', 'package.json') },
];

const CHANGELOG_FILE = path.join(ROOT, 'CHANGELOG.md');

function readVersion(filePath) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return pkg.version;
}

function extractLatestChangelogVersion(source) {
  // 匹配 ## [vX.Y.Z] 或 ## [Unreleased] 后的第一个版本号
  const versionMatch = source.match(/^##\s*\[v?([0-9]+\.[0-9]+\.[0-9]+)\]/im);
  return versionMatch ? versionMatch[1] : null;
}

function main() {
  const versions = PACKAGES.map((p) => ({
    name: p.name,
    version: readVersion(p.file),
  }));

  const uniqueVersions = new Set(versions.map((v) => v.version));

  console.log('[validate-version-sync] Package versions:');
  versions.forEach((v) => {
    console.log(`  - ${v.name}: ${v.version}`);
  });

  if (uniqueVersions.size > 1) {
    console.error('[validate-version-sync] ❌ Package versions are inconsistent.');
    process.exit(1);
  }

  const syncedVersion = versions[0].version;

  if (!fs.existsSync(CHANGELOG_FILE)) {
    console.error(`[validate-version-sync] ❌ CHANGELOG.md not found at ${CHANGELOG_FILE}`);
    process.exit(1);
  }

  const changelogSource = fs.readFileSync(CHANGELOG_FILE, 'utf8');
  const changelogVersion = extractLatestChangelogVersion(changelogSource);

  if (!changelogVersion) {
    console.error('[validate-version-sync] ❌ Could not extract latest version from CHANGELOG.md');
    process.exit(1);
  }

  console.log(`[validate-version-sync] CHANGELOG latest version: ${changelogVersion}`);

  if (changelogVersion !== syncedVersion) {
    console.error(
      `[validate-version-sync] ❌ Version mismatch: package.json is ${syncedVersion}, but CHANGELOG.md latest is ${changelogVersion}.`,
    );
    process.exit(1);
  }

  console.log(
    `[validate-version-sync] ✅ All packages are synced at v${syncedVersion} and match CHANGELOG.md.`,
  );
}

main();
