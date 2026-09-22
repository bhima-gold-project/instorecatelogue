/**
 * Production Build & Packaging Script for Frontend (ES Module)
 *
 * Builds Next.js and creates a self-contained `dist/` directory that runs
 * completely WITHOUT source code (.tsx, .ts, app/).
 *
 * Everything is configurable via `dist/.env`:
 * - PORT (e.g., PORT=9009)
 * - Backend API URL (e.g., NEXT_PUBLIC_API_SERVICE_BASE_URL=http://192.168.10.12:9006)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.dirname(__filename);
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const STANDALONE_DIR = path.join(NEXT_DIR, 'standalone');

const startTime = Date.now();

console.log('--------------------------------------------------');
console.log('🚀 Starting Frontend Production Build (Next.js)...');
console.log('--------------------------------------------------');

// Helper: copy directory recursively
function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Run Next.js build
console.log('⚡ Compiling Next.js application...');
try {
  execSync('npx next build', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });
} catch (err) {
  console.error('❌ Next.js build failed.');
  process.exit(1);
}

// 2. Clean previous dist folder
console.log('🧹 Cleaning previous dist folder...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 3. Package build files
if (fs.existsSync(STANDALONE_DIR)) {
  console.log('📦 Packaging standalone server & traced dependencies...');
  copyDirRecursive(STANDALONE_DIR, DIST_DIR);

  // Copy .next/static into dist/.next/static
  const staticSrc = path.join(NEXT_DIR, 'static');
  const staticDest = path.join(DIST_DIR, '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    console.log('🎨 Copying static assets (.next/static)...');
    copyDirRecursive(staticSrc, staticDest);
  }
} else {
  console.log('📦 Packaging .next build & server...');
  copyDirRecursive(NEXT_DIR, path.join(DIST_DIR, '.next'));
  const serverSrc = path.join(ROOT_DIR, 'server.js');
  if (fs.existsSync(serverSrc)) {
    fs.copyFileSync(serverSrc, path.join(DIST_DIR, 'server.js'));
  }
}

// Ensure empty app directory exists in dist for Next.js App Router
fs.mkdirSync(path.join(DIST_DIR, 'app'), { recursive: true });

// 4. Copy public folder
const publicSrc = path.join(ROOT_DIR, 'public');
const publicDest = path.join(DIST_DIR, 'public');
if (fs.existsSync(publicSrc)) {
  console.log('🖼️ Copying public directory...');
  copyDirRecursive(publicSrc, publicDest);
}

// 5. Copy and configure .env
console.log('⚙️ Copying environment and server configurations...');
const envSrc = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envSrc)) {
  console.log('🔑 Copying .env into dist/.env (configurable PORT & API URL)...');
  fs.copyFileSync(envSrc, path.join(DIST_DIR, '.env'));
} else {
  console.warn('⚠️  [WARNING] .env file is missing! Please create a .env file.');
}

const envExampleSrc = path.join(ROOT_DIR, '.env.example');
if (fs.existsSync(envExampleSrc)) {
  fs.copyFileSync(envExampleSrc, path.join(DIST_DIR, '.env.example'));
}

// 6. Copy web.config for IIS
const webConfigSrc = path.join(ROOT_DIR, 'web.config');
if (fs.existsSync(webConfigSrc)) {
  fs.copyFileSync(webConfigSrc, path.join(DIST_DIR, 'web.config'));
}

// 7. Generate 1-click Windows runner: start.bat
console.log('🖱️ Generating 1-click start.bat runner...');
const startBatContent = `@echo off
title In-Store Catalogue Frontend
echo ===================================================
echo Starting In-Store Catalogue Frontend...
echo ===================================================
node server.js
pause
`;
fs.writeFileSync(path.join(DIST_DIR, 'start.bat'), startBatContent, 'utf8');

// 8. Generate production package.json for dist
const pkgSrc = path.join(ROOT_DIR, 'package.json');
if (fs.existsSync(pkgSrc)) {
  const pkg = JSON.parse(fs.readFileSync(pkgSrc, 'utf8'));
  const prodPkg = {
    name: pkg.name || 'instorewebapplication',
    version: pkg.version || '0.1.0',
    type: 'module',
    scripts: {
      start: 'node server.js',
    },
    dependencies: pkg.dependencies || {},
  };
  fs.writeFileSync(
    path.join(DIST_DIR, 'package.json'),
    JSON.stringify(prodPkg, null, 2),
    'utf8'
  );
}

const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('--------------------------------------------------');
console.log(`✅ Frontend Production Package created in ${durationSec}s!`);
console.log(`📂 Output directory: ${DIST_DIR}`);
console.log('--------------------------------------------------');
console.log('To run the frontend without source code:');
console.log('  1. cd dist');
console.log('  2. Configure dist/.env (PORT, API URL)');
console.log('  3. Double-click start.bat (or run "node server.js")');
console.log('--------------------------------------------------');
