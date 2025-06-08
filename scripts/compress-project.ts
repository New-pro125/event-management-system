import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const outputFileName = 'eventi-project.zip';
const outputPath = path.join(projectRoot, outputFileName);
const ignoredDirectories = new Set(['.git', 'node_modules',"scripts"]);

function walkDirectory(dirPath: string): string[] {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      files.push(...walkDirectory(path.join(dirPath, entry.name)));
      continue;
    }

    if (entry.name === outputFileName) {
      continue;
    }

    files.push(path.join(dirPath, entry.name));
  }

  return files;
}

function ensureZipAvailable(): void {
  try {
    execFileSync('zip', ['-v'], { stdio: 'ignore' });
  } catch {
    throw new Error(
      'The zip command is not installed or not available in PATH. Install it with: sudo apt-get install zip',
    );
  }
}

ensureZipAvailable();

if (existsSync(outputPath)) {
  unlinkSync(outputPath);
}

const filesToZip = walkDirectory(projectRoot).map((file) => path.relative(projectRoot, file));

if (filesToZip.length === 0) {
  throw new Error('No files were found to compress.');
}

execFileSync('zip', ['-rq', outputFileName, ...filesToZip], {
  cwd: projectRoot,
  stdio: 'inherit',
});

console.log(`Archive created successfully: ${outputPath}`);
