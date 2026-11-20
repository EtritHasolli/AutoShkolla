// Builds the Android APK:  npm run android:apk
//   1. vite build (uses .env → the APK talks to your Supabase project)
//   2. cap sync android
//   3. gradlew assembleRelease (signed, if android/keystore.properties exists)
//      or assembleDebug otherwise
//   4. copies the APK to release/AutoShkolla-v<version>.apk
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const win = process.platform === 'win32';
const env = { ...process.env };

// Android Gradle Plugin 8.x needs JDK 21 — Android Studio ships one.
const jbr = win ? 'C:\\Program Files\\Android\\Android Studio\\jbr' : '/Applications/Android Studio.app/Contents/jbr/Contents/Home';
if (existsSync(jbr)) env.JAVA_HOME = jbr;
const sdk = env.ANDROID_HOME || env.ANDROID_SDK_ROOT || (win ? join(env.LOCALAPPDATA || '', 'Android', 'Sdk') : join(env.HOME || '', 'Library/Android/sdk'));
env.ANDROID_HOME = sdk;
if (!existsSync('android/local.properties')) writeFileSync('android/local.properties', 'sdk.dir=' + sdk.replace(/\\/g, '\\\\') + '\n');

const run = (cmd, cwd = '.') => { console.log('\n> ' + cmd); execSync(cmd, { stdio: 'inherit', env, cwd }); };

// --demo: build without the Supabase config (offline demo data only).
// Vite never overrides variables that already exist in the environment.
const demo = process.argv.includes('--demo');
if (demo) { env.VITE_SUPABASE_URL = ''; env.VITE_SUPABASE_ANON_KEY = ''; }

run('npx vite build');
run('npx cap sync android');

const release = existsSync('android/keystore.properties');
run((win ? '.\\gradlew.bat' : './gradlew') + (release ? ' assembleRelease' : ' assembleDebug') + ' --console=plain', 'android');

const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const out = release ? 'android/app/build/outputs/apk/release/app-release.apk' : 'android/app/build/outputs/apk/debug/app-debug.apk';
mkdirSync('release', { recursive: true });
const dest = `release/AutoShkolla-v${version}${demo ? '-demo' : ''}${release ? '' : '-debug'}.apk`;
copyFileSync(out, dest);
console.log('\nAPK ready: ' + dest);
