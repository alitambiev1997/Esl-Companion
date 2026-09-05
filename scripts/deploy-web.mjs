import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const repo = resolve(process.cwd());
const dist = join(repo, 'dist');
const origin = execSync('git remote get-url origin', { cwd: repo }).toString().trim();
const name = execSync('git config user.name', { cwd: repo }).toString().trim();
const email = execSync('git config user.email', { cwd: repo }).toString().trim();
const work = join(tmpdir(), `esl-web-publish-${Date.now()}`);

const run = (cmd) => execSync(cmd, { cwd: work, stdio: 'inherit' });

try {
  if (!existsSync(dist)) {
    throw new Error('dist/ missing - run "npx expo export --platform web" first');
  }
  mkdirSync(work);
  run('git init -q');
  run('git remote add origin ' + origin);
  run('git checkout -q -b gh-pages');
  if (process.platform === 'win32') {
    run(`xcopy /E /I /Y "${dist}" "${work}"`);
  } else {
    run(`cp -R "${dist}/." "${work}/"`);
  }
  writeFileSync(join(work, '.nojekyll'), '');
  run('git add -A');
  run(`git -c user.name="${name}" -c user.email="${email}" commit -q -m "publish web build"`);
  run('git push -q -f origin gh-pages');
  console.log('Published clean gh-pages branch from dist/');
} finally {
  rmSync(work, { recursive: true, force: true });
}