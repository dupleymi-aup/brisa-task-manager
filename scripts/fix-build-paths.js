/**
 * Fix absolute Windows paths in Brisa build output.
 * Replaces absolute Windows paths with relative paths in all JS files.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';

const BUILD_DIR = resolve(import.meta.dirname, '..', 'build');
const PROJECT_ROOT = resolve(import.meta.dirname, '..');

function fixAbsolutePathsInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const original = content;

    // Replace all variations of absolute Windows paths with relative paths
    // Pattern: C:\Users\...\brisa-task-manager\build\... -> ./...
    const projectRootEscaped = PROJECT_ROOT.replace(/\\/g, '\\\\');
    const projectRootForward = PROJECT_ROOT.replace(/\\/g, '/');

    // Double backslash version (escaped in strings)
    content = content.replace(
      new RegExp(projectRootEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\\\', 'g'),
      './'
    );

    // Single backslash version
    content = content.replace(
      new RegExp(projectRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\\\', 'g'),
      './'
    );

    // Forward slash version
    content = content.replace(
      new RegExp(projectRootForward.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/', 'g'),
      './'
    );

    if (content !== original) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`[fix-build-paths] Fixed: ${filePath}`);
      return true;
    }
  } catch (e) {
    // Ignore files that can't be read
  }
  return false;
}

function walkDir(dir) {
  let fixed = 0;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          fixed += walkDir(fullPath);
        } else if (entry.endsWith('.js') || entry.endsWith('.ts')) {
          if (fixAbsolutePathsInFile(fullPath)) fixed++;
        }
      } catch (e) {
        // Skip files that can't be accessed
      }
    }
  } catch (e) {
    // Skip directories that can't be read
  }
  return fixed;
}

const count = walkDir(BUILD_DIR);
if (count > 0) {
  console.log(`[fix-build-paths] Fixed ${count} file(s) with absolute path issues`);
} else {
  console.log('[fix-build-paths] No absolute path issues found');
}
