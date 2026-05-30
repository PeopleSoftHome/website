import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Type } from '@nestjs/common';

/**
 * 动态扫描并加载指定目录下的 NestJS 模块/监听器/处理器
 *
 * 使用方式：
 *   const modules = await loadModulesFromDirectory('modules', '\\.module\\.ts$');
 *   const listeners = await loadModulesFromDirectory('listeners', '\\.listener\\.ts$');
 *   const processors = await loadModulesFromDirectory('processors', '\\.processor\\.ts$');
 */

export async function loadModulesFromDirectory(
  relativeDir: string,
  filePattern: RegExp,
): Promise<Type<any>[]> {
  const basePath = join(__dirname, '..', '..', relativeDir);
  const entries = readdirSync(basePath, { withFileTypes: true });
  const result: Type<any>[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirPath = join(basePath, entry.name);
    const files = readdirSync(dirPath);

    for (const file of files) {
      if (!filePattern.test(file)) continue;

      const filePath = join(dirPath, file);
      try {
        const mod = await import(filePath);
        // NestJS 模块/服务/监听器通常只有一个命名导出
        const exported = Object.values(mod).find(
          (v): v is Type<any> => typeof v === 'function',
        );
        if (exported) {
          result.push(exported);
        }
      } catch {
        // 跳过无法加载的文件
      }
    }
  }

  return result;
}
