// Plans the next release. Run by .github/workflows/release.yml with GH_REPO
// and RUN_NUMBER set. Writes out/update.json + out/notes.md and step outputs.
//
// The APK is signed locally (the key never leaves your PC) and committed to
// apk/ by `npm run android:apk`. This checks it still matches the native code:
// if android/, capacitor.config.json or a native plugin changed since, a
// web-only update could call native code the installed app doesn't have, so
// the release stops and asks for a fresh APK.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { nativeFingerprint, readNative, NATIVE_APK } from './native-fingerprint.mjs';

const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
const repo = process.env.GH_REPO;
const run = process.env.RUN_NUMBER;
if (!repo || !run) throw new Error('GH_REPO and RUN_NUMBER are required');

const native = readNative();
const fingerprint = nativeFingerprint();
if (!native || !existsSync(NATIVE_APK)) {
  console.log('::error::No apk/ folder. Run `npm run android:apk` on the PC that has the signing key, commit apk/, push.');
  process.exit(1);
}
if (native.fingerprint !== fingerprint) {
  console.log(`::error::Native code changed since the committed APK (apk/native.json ${native.fingerprint}, now ${fingerprint}). Run \`npm run android:apk\`, commit apk/, push.`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const [major, minor] = pkg.version.split('.');
const version = `${major}.${minor}.${run}`;
const tag = 'v' + version;
const base = `https://github.com/${repo}/releases/download/${tag}`;

mkdirSync('out', { recursive: true });
writeFileSync('out/update.json', JSON.stringify({
  version,
  nativeBuild: native.nativeBuild,
  nativeVersion: native.nativeVersion,
  bundle: `${base}/bundle.zip`,
  apk: `${base}/AutoShkolla.apk`,
  commit: sh('git rev-parse HEAD'),
  date: new Date().toISOString(),
}, null, 2) + '\n');
writeFileSync('out/notes.md', [
  sh('git log -1 --format=%B').replace(/\n*Co-Authored-By:.*$/gim, '').trim(),
  '',
  `App build ${native.nativeBuild}. Installed apps on this build update themselves on next launch; older builds are offered this APK.`,
  '',
  '**Install on Android:** download `AutoShkolla.apk` below on the phone and open it (allow "Install unknown apps").',
].join('\n'));

const outputs = { version, tag };
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(outputs).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
console.log(JSON.stringify({ ...outputs, nativeBuild: native.nativeBuild, fingerprint }, null, 2));
