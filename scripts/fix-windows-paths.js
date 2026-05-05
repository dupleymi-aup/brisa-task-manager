/**
 * Fix Windows path issue in Brisa build output.
 * 
 * Brisa 0.2.15 on Windows generates import paths with backslashes
 * in JavaScript string literals, which causes Bun.build to fail
 * because backslashes are interpreted as escape characters.
 * 
 * This script normalizes all backslash paths to forward slashes
 * in the generated server entry point.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const BUILD_DIR = resolve(import.meta.dirname, '..', 'build');

function fixBackslashesInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const original = content;
    
  // Replace Windows absolute paths in import/from statements
  // Pattern: from 'C:\path' or from "C:\path" 
  content = content.replace(
    /((?:import|from)\s*(?:['"]))([A-Z]:\\[^'"]*)\1/g,
    (match, quote, path) => {
      const fixed = path.replace(/\\/g, '/');
      return `${quote}${fixed}${quote}`;
    }
  );
  
  // Also fix template literal paths
  content = content.replace(
    /([A-Z]:\\[^\s'",;)}\]]+)/g,
    (match) => match.replace(/\\/g, '/')
  );
  
    if (content !== original) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`[fix-windows-paths] Fixed: ${filePath}`);
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
          if (fixBackslashesInFile(fullPath)) fixed++;
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
  console.log(`[fix-windows-paths] Fixed ${count} file(s) with Windows path issues`);
} else {
  console.log('[fix-windows-paths] No Windows path issues found');
}
