// Date, money, contact-link and file helpers shared by every screen.
// Dates are handled as local "YYYY-MM-DD" strings to avoid timezone drift.
import { Capacitor } from '@capacitor/core';

const DAY_MS = 86400000;

export const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const NAMES = {
  sq: {
    dayShort: ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'],
    dayLong: ['E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë', 'E diel'],
    monShort: ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'kor', 'gus', 'sht', 'tet', 'nën', 'dhj'],
    monLong: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  },
  en: {
    dayShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dayLong: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    monShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
};
const names = (lang) => NAMES[lang] || NAMES.sq;

export function toISO(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function parseISO(s) {
  if (!s) return null;
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function todayISO() { return toISO(new Date()); }
export function addDays(iso, n) {
  const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d);
}
// Monday of the week containing `iso`
export function weekStart(iso) {
  const d = parseISO(iso);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return toISO(d);
}
// 0 = Monday … 6 = Sunday
export function weekdayIdx(iso) { return (parseISO(iso).getDay() + 6) % 7; }
export function daysBetween(fromISO, toISOStr) {
  return Math.round((parseISO(toISOStr) - parseISO(fromISO)) / DAY_MS);
}
export function daysUntil(iso) { return daysBetween(todayISO(), iso); }
export function sameMonth(iso, ref = todayISO()) { return iso && iso.slice(0, 7) === ref.slice(0, 7); }
export function monthKey(iso) { return iso.slice(0, 7); }

export function hh(hour) { return String(hour).padStart(2, '0') + ':00'; }

export function dayShort(idx, lang) { return names(lang).dayShort[idx]; }
export function dayLong(idx, lang) { return names(lang).dayLong[idx]; }
export function monthShort(m, lang) { return names(lang).monShort[m]; }
export function monthLong(m, lang) { return names(lang).monLong[m]; }

// "Pre, 20 nën" / "Fri, 20 Nov"
export function fmtDay(iso, lang) {
  if (!iso) return '—';
  const d = parseISO(iso);
  return dayShort(weekdayIdx(iso), lang) + ', ' + d.getDate() + ' ' + monthShort(d.getMonth(), lang);
}
// "20 nën 2026"
export function fmtDate(iso, lang, { year = true } = {}) {
  if (!iso) return '—';
  const d = parseISO(iso);
  return d.getDate() + ' ' + monthShort(d.getMonth(), lang) + (year ? ' ' + d.getFullYear() : '');
}
// "E premte, 20 nëntor"
export function fmtLong(iso, lang) {
  if (!iso) return '—';
  const d = parseISO(iso);
  return dayLong(weekdayIdx(iso), lang) + ', ' + d.getDate() + ' ' + monthLong(d.getMonth(), lang);
}
export function fmtRange(fromISO, toISOStr, lang) {
  const a = parseISO(fromISO), b = parseISO(toISOStr);
  if (a.getMonth() === b.getMonth()) return a.getDate() + '–' + b.getDate() + ' ' + monthLong(b.getMonth(), lang) + ' ' + b.getFullYear();
  return a.getDate() + ' ' + monthShort(a.getMonth(), lang) + ' – ' + b.getDate() + ' ' + monthShort(b.getMonth(), lang) + ' ' + b.getFullYear();
}

export function euro(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' €';
}

export function initials(name) {
  return String(name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_TONES = [
  ['#2456e6', '#eef3ff'], ['#7048e8', '#f2eefe'], ['#0e8aa6', '#e6f6fa'],
  ['#c27408', '#fff6e5'], ['#15935a', '#e9f8f0'], ['#d6336c', '#fdeef4'],
];
export function avatarTone(name) {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

// ---- contact links ----------------------------------------------------------
// Kosovo numbers are written like "+383 44 123 456" or "044 123 456".
export function normalizePhone(phone) {
  let p = String(phone || '').replace(/[^\d+]/g, '');
  if (!p) return '';
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (p.startsWith('0')) p = '+383' + p.slice(1);
  if (!p.startsWith('+')) p = '+' + p;
  return p;
}
export function telLink(phone) { const p = normalizePhone(phone); return p ? 'tel:' + p : ''; }
export function whatsappLink(phone, text) {
  const p = normalizePhone(phone).replace('+', '');
  const q = text ? '?text=' + encodeURIComponent(text) : '';
  return p ? 'https://wa.me/' + p + q : 'https://wa.me/' + q;
}

// ---- files ------------------------------------------------------------------
export function toCSV(rows) {
  return rows.map(r => r.map(c => {
    const s = String(c ?? '');
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
}

// Saves a text file. On the web this downloads it; inside the Android app it
// writes to the cache and opens the system share sheet (WebView can't download).
export async function saveTextFile(filename, content, mime = 'text/csv') {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const res = await Filesystem.writeFile({ path: filename, data: '﻿' + content, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: filename, url: res.uri });
    return;
  }
  const blob = new Blob(['﻿' + content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function greetingKey() {
  const h = new Date().getHours();
  return h < 12 ? 'greet_morning' : h < 18 ? 'greet_day' : 'greet_evening';
}
