import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const files = globSync('apps/api/src/modules/**/*.spec.ts', { cwd: root });

for (const file of files) {
  const path = join(root, file);
  let src = readFileSync(path, 'utf-8');

  // Only process files that create a TestingModule inside beforeEach
  if (!src.includes('Test.createTestingModule')) continue;
  if (src.includes('afterAll(async () => { await module.close(); })')) continue;

  // Add `let module: TestingModule;` if not present
  if (!/\blet module:\s*TestingModule;/.test(src)) {
    // Insert after the first block of `let ...;` declarations inside describe
    src = src.replace(
      /(describe\(['"][^'"]+['"],\s*\(\)\s*=>\s*\{)(\s*let [^;]+;(?:\s*let [^;]+;)*)?/,
      (match, describeHeader, lets) => {
        const existingLets = lets || '';
        return `${describeHeader}${existingLets}\n  let module: TestingModule;`;
      }
    );
  }

  // Change `const module: TestingModule = await Test.createTestingModule` -> module assignment
  src = src.replace(
    /const module:\s*TestingModule = await Test\.createTestingModule\(/g,
    'module = await Test.createTestingModule('
  );

  // Find the end of the beforeEach(async () => { ... }); block and insert afterAll
  const beforeEachIdx = src.search(/beforeEach\(async \(\) => \{/);
  if (beforeEachIdx !== -1) {
    let braceIdx = src.indexOf('{', beforeEachIdx);
    let depth = 1;
    let i = braceIdx + 1;
    while (i < src.length && depth > 0) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
      i++;
    }
    // i now points after the closing brace of beforeEach body
    // find the closing `);` of beforeEach call
    const afterBody = src.slice(i);
    const closeMatch = afterBody.match(/^[\s\n]*\)\s*;/);
    if (closeMatch) {
      const insertPos = i + closeMatch[0].length;
      const indent = '  ';
      const afterAllBlock = `\n${indent}afterAll(async () => {\n${indent}  await module.close();\n${indent}});`;
      src = src.slice(0, insertPos) + afterAllBlock + src.slice(insertPos);
    }
  }

  writeFileSync(path, src, 'utf-8');
  console.log(`✅ ${file}`);
}
