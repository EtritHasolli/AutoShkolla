// Pings the Supabase project so the free tier doesn't pause it for inactivity.
// Runs daily from .github/workflows/keep-supabase-awake.yml; locally:
//   npm run keepalive          (reads .env)
//
// Exit codes: 0 = pinged (or not configured → skipped with a warning),
//             1 = the project could not be reached — check the dashboard.
const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const inCI = !!process.env.GITHUB_ACTIONS;

const warn = (title, msg) => console.log(inCI ? `::warning title=${title}::${msg}` : `WARNING ${title}: ${msg}`);
const fail = (title, msg) => { console.log(inCI ? `::error title=${title}::${msg}` : `ERROR ${title}: ${msg}`); process.exit(1); };

if (!url || !key) {
  warn('Keep-alive skipped', 'SUPABASE_URL / SUPABASE_ANON_KEY are not set (GitHub: Settings → Secrets and variables → Actions).');
  process.exit(0);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function request(path, init) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url + path, { ...init, headers, signal: AbortSignal.timeout(20000) });
      // 5xx can be a project that is still waking up — retry those too.
      if (res.status >= 500 && attempt < 4) { lastErr = new Error('HTTP ' + res.status); await sleep(5000 * attempt); continue; }
      return res;
    } catch (e) {
      lastErr = e;
      const code = e.cause?.code || e.code || '';
      if (code === 'ENOTFOUND') break; // the host doesn't exist — retrying won't help
      await sleep(3000 * attempt);
    }
  }
  throw lastErr;
}

let res;
try {
  // Preferred: the keep_alive() RPC from supabase/migration_v5.sql (a real write).
  res = await request('/rest/v1/rpc/keep_alive', { method: 'POST', body: '{}' });
  if (res.status === 404) {
    // Migration v5 not applied yet — a read through the API still counts.
    warn('keep_alive() missing', 'Run supabase/migration_v5.sql; falling back to a read query.');
    res = await request('/rest/v1/public_schools?select=id&limit=1', { method: 'GET' });
  }
} catch (e) {
  const code = e.cause?.code || e.code || '';
  if (code === 'ENOTFOUND') fail('Supabase project not found', `${new URL(url).host} does not resolve — the project was probably deleted. Create a new one and update the secrets.`);
  fail('Supabase unreachable', e.message);
}

const body = await res.text();
if (!res.ok) {
  const host = new URL(url).host;
  // 52x/540 come from the edge when the database behind it is paused/offline.
  if (res.status >= 520 || res.status === 503) fail(`Supabase project is down (HTTP ${res.status})`, `${host} is paused or offline. Restore it in the Supabase dashboard (paused projects can be restored for a limited time), then re-run this check.`);
  if (res.status === 401 || res.status === 403) fail(`Supabase rejected the key (HTTP ${res.status})`, 'Check that SUPABASE_ANON_KEY is the anon public key of this project.');
  const detail = body.trim().startsWith('<') ? res.statusText : body.slice(0, 300);
  fail(`Supabase answered HTTP ${res.status}`, detail);
}
console.log(`Supabase is awake (${new URL(url).host}) — ${new Date().toISOString()}${body && body.length < 60 ? ' · ' + body : ''}`);
