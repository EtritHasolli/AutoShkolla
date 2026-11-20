// Plans the next release. Run by .github/workflows/release.yml (needs gh +
// GH_TOKEN + GH_REPO + RUN_NUMBER). Writes out/update.json, out/notes.md and
// the step outputs used by the workflow.
//
//   version      <major>.<minor>.<run number>, e.g. 1.0.12
//   fingerprint  hash of everything baked into the native APK: android/,
//                capacitor.config.json and native plugin versions
//   nativeBuild  the APK's versionCode. Same fingerprint as the latest
//                release → keep it and reuse that APK (installed apps get a
//                live update). Different → +1 and build a new APK (installed
//                apps are asked to install it).
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';

const sh = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const repo = process.env.GH_REPO;
const run = process.env.RUN_NUMBER;
if (!repo || !run) throw new Error('GH_REPO and RUN_NUMBER are required');

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

function nativeFingerprint() {
  const h = createHash('sha256');
  h.update('v1\n'); // bump to force every app onto a new APK
  for (const f of sh('git ls-files android capacitor.config.json').split('\n').filter(Boolean).sort()) {
    h.update(f + '\0');
    h.update(readFileSync(f));
  }
  // Plugins with native code (they declare a "capacitor" block) + the runtime.
  for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).sort()) {
    const p = `node_modules/${name}/package.json`;
    if (!existsSync(p)) continue;
    const dep = JSON.parse(readFileSync(p, 'utf8'));
    if (dep.capacitor || name === '@capacitor/core' || name === '@capacitor/android') h.update(`${name}@${dep.version}\n`);
  }
  return h.digest('hex').slice(0, 16);
}

let prev = null;
try {
  prev = JSON.parse(sh(`gh release download --repo ${repo} --pattern update.json --output -`));
} catch {
  console.log('No previous release with update.json — this is the first one.');
}

const [major, minor] = pkg.version.split('.');
const version = `${major}.${minor}.${run}`;
const tag = 'v' + version;
const fingerprint = nativeFingerprint();
const force = process.env.FORCE_APK === 'true';
const buildApk = force || !prev || prev.fingerprint !== fingerprint;
const nativeBuild = buildApk ? (prev?.nativeBuild || 0) + 1 : prev.nativeBuild;
const nativeVersion = buildApk ? version : prev.nativeVersion;

const base = `https://github.com/${repo}/releases/download/${tag}`;
const manifest = {
  version,
  nativeBuild,
  nativeVersion,
  fingerprint,
  bundle: `${base}/bundle.zip`,
  apk: `${base}/AutoShkolla.apk`,
  commit: sh('git rev-parse HEAD'),
  date: new Date().toISOString(),
};

mkdirSync('out', { recursive: true });
writeFileSync('out/update.json', JSON.stringify(manifest, null, 2) + '\n');
writeFileSync('out/notes.md', [
  sh('git log -1 --format=%B').trim(),
  '',
  buildApk
    ? `**New APK** (build ${nativeBuild}). Installed apps will offer to download it.`
    : `**Live update.** Installed apps (build ${nativeBuild}) update themselves, no reinstall needed.`,
  '',
  'Install on Android: download **AutoShkolla.apk** below on the phone and open it (allow "Install unknown apps").',
].join('\n'));

const outputs = { version, tag, native_build: nativeBuild, native_version: nativeVersion, build_apk: buildApk, prev_tag: prev ? 'v' + prev.version : '' };
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(outputs).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
console.log(JSON.stringify({ ...outputs, fingerprint, previous: prev && { version: prev.version, nativeBuild: prev.nativeBuild, fingerprint: prev.fingerprint } }, null, 2));
