// Over-the-air updates for the Android app.
//
// Every push to main runs .github/workflows/release.yml, which publishes a
// GitHub Release with three files:
//   update.json      { version, nativeBuild, bundle, apk, … }
//   bundle.zip       the built web app (dist/)
//   AutoShkolla.apk  the signed app
//
// On launch (and when the app comes back after 30+ minutes) we read
// update.json:
//   • same native build, newer version → download bundle.zip in the background;
//     it is applied on the next restart, or right away from the "Restart" bar.
//   • newer native build (a Capacitor plugin or android/ changed) → JS alone
//     can't update it, so the bar offers the new APK instead.
// If a downloaded bundle fails to start, the plugin rolls back to the last
// working one and we never retry that version.
import { useSyncExternalStore } from 'react';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { RELEASES_URL } from './brand.js';

const MANIFEST_URL = RELEASES_URL + '/latest/download/update.json';
const RECHECK_MS = 30 * 60 * 1000;
// A downloaded update installs by itself once the app has been in the
// background this long, so it never reloads under someone mid-task.
const APPLY_AFTER_BACKGROUND_MS = 10 * 60 * 1000;

let state = { status: 'idle' }; // idle | ready {version} | native {version, apk}
const listeners = new Set();
function setState(next) { state = next; listeners.forEach(fn => fn()); }

export function useUpdate() {
  return useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => state);
}

export function dismissUpdate() { setState({ status: 'idle', dismissed: true }); }

export async function restartToUpdate() {
  const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
  await CapacitorUpdater.reload();
}

let checking = false;
let lastCheck = 0;

async function check() {
  if (checking || state.dismissed) return;
  checking = true;
  lastCheck = Date.now();
  try {
    const [{ CapacitorUpdater }, { App }] = await Promise.all([import('@capgo/capacitor-updater'), import('@capacitor/app')]);
    // Native request: GitHub's download redirect doesn't send CORS headers.
    const res = await CapacitorHttp.get({ url: MANIFEST_URL, responseType: 'json' });
    if (res.status !== 200) return;
    const m = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    if (!m?.version || !m.nativeBuild) return;

    const installed = Number((await App.getInfo()).build) || 0;
    if (m.nativeBuild > installed) { setState({ status: 'native', version: m.version, apk: m.apk }); return; }
    if (m.nativeBuild !== installed || m.version === __APP_VERSION__) return;

    const { bundles } = await CapacitorUpdater.list();
    let bundle = bundles.find(b => b.version === m.version);
    // Failed bundles are kept (autoDeleteFailed: false) so a broken release
    // isn't re-downloaded and re-crashed on every launch.
    if (bundle?.status === 'error') return;
    if (!bundle || (bundle.status !== 'pending' && bundle.status !== 'success')) {
      bundle = await CapacitorUpdater.download({ url: m.bundle, version: m.version });
    }
    await CapacitorUpdater.next({ id: bundle.id });
    await CapacitorUpdater.setMultiDelay({ delayConditions: [{ kind: 'background', value: String(APPLY_AFTER_BACKGROUND_MS) }] });
    setState({ status: 'ready', version: m.version });
    // Drop older downloads this one supersedes.
    const { bundle: current } = await CapacitorUpdater.current();
    for (const b of bundles) {
      if (b.status === 'pending' && b.id !== bundle.id && b.id !== current.id) CapacitorUpdater.delete({ id: b.id }).catch(() => {});
    }
  } catch (e) {
    console.warn('[updater]', e?.message || e);
  } finally {
    checking = false;
  }
}

// Call once React has rendered: confirming only after a successful render
// means a bundle that crashes on start gets rolled back automatically.
let started = false;
export function initUpdater() {
  if (started || !Capacitor.isNativePlatform()) return;
  started = true;
  import('@capgo/capacitor-updater').then(({ CapacitorUpdater }) => {
    CapacitorUpdater.notifyAppReady();
    check();
  });
  import('@capacitor/app').then(({ App }) => {
    App.addListener('resume', () => { if (Date.now() - lastCheck > RECHECK_MS) check(); });
  });
}
