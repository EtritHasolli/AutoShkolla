// Fingerprint of everything baked into the native APK: android/,
// capacitor.config.json and the versions of plugins with native code.
// If it changes, a live (web-only) update isn't enough — the APK must be
// rebuilt. Used by build-apk.mjs (stamps apk/native.json) and by
// release-plan.mjs in CI (checks the committed APK still matches).
//
// Hashes go through `git hash-object`, which applies .gitattributes line-ending
// normalisation, so Windows and the Linux CI runner get the same result.
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';

export function nativeFingerprint() {
  const files = execSync('git ls-files --cached --others --exclude-standard android capacitor.config.json', { encoding: 'utf8' })
    .split('\n').map(f => f.trim()).filter(f => f && existsSync(f)).sort();
  const blobs = execSync('git hash-object --stdin-paths', { input: files.join('\n') + '\n', encoding: 'utf8' }).trim().split('\n');
  const h = createHash('sha256');
  h.update('v1\n'); // bump to force a new APK
  files.forEach((f, i) => h.update(`${f} ${blobs[i]}\n`));
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).sort()) {
    const p = `node_modules/${name}/package.json`;
    if (!existsSync(p)) continue;
    const dep = JSON.parse(readFileSync(p, 'utf8'));
    if (dep.capacitor || name === '@capacitor/core' || name === '@capacitor/android') h.update(`${name}@${dep.version}\n`);
  }
  return h.digest('hex').slice(0, 16);
}

export const NATIVE_JSON = 'apk/native.json';
export const NATIVE_APK = 'apk/AutoShkolla.apk';

export function readNative() {
  return existsSync(NATIVE_JSON) ? JSON.parse(readFileSync(NATIVE_JSON, 'utf8')) : null;
}
