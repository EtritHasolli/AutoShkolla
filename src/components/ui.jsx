import React from 'react';
import { C, font } from '../data/seed.js';

export function Icon({ name, size = 18, sw = 1.8 }) {
  const paths = {
    dashboard: [<rect key={1} x={3} y={3} width={7} height={7} rx={1.4} />, <rect key={2} x={14} y={3} width={7} height={7} rx={1.4} />, <rect key={3} x={3} y={14} width={7} height={7} rx={1.4} />, <rect key={4} x={14} y={14} width={7} height={7} rx={1.4} />],
    calendar: [<rect key={1} x={3} y={4.5} width={18} height={16} rx={2.4} />, <path key={2} d="M3 9h18" />, <path key={3} d="M8 2.5v4" />, <path key={4} d="M16 2.5v4" />],
    students: [<circle key={1} cx={9} cy={8} r={3.2} />, <path key={2} d="M3.5 19.5a5.6 5.6 0 0 1 11 0" />, <circle key={3} cx={17} cy={9} r={2.4} />, <path key={4} d="M16 14.4a4.6 4.6 0 0 1 4.5 5" />],
    instructors: [<circle key={1} cx={12} cy={12} r={8.5} />, <circle key={2} cx={12} cy={12} r={2.4} />, <path key={3} d="M12 3.5v6" />, <path key={4} d="M12 14.4v6" />, <path key={5} d="M3.5 12h6" />, <path key={6} d="M14.4 12h6" />],
    vehicles: [<path key={1} d="M4 13l1.6-4.6A2.4 2.4 0 0 1 7.9 7h8.2a2.4 2.4 0 0 1 2.3 1.4L20 13" />, <rect key={2} x={3} y={13} width={18} height={5.4} rx={1.8} />, <circle key={3} cx={7.5} cy={18.6} r={1.4} />, <circle key={4} cx={16.5} cy={18.6} r={1.4} />],
    packages: [<path key={1} d="M21 8l-9-5-9 5 9 5 9-5z" />, <path key={2} d="M3 8v8l9 5 9-5V8" />, <path key={3} d="M12 13v8" />],
    payments: [<rect key={1} x={2.5} y={5.5} width={19} height={13} rx={2.4} />, <path key={2} d="M2.5 10h19" />, <path key={3} d="M6.5 14.5h4" />],
    exams: [<rect key={1} x={5.5} y={4} width={13} height={17} rx={2.2} />, <rect key={2} x={9} y={2.2} width={6} height={3.6} rx={1.2} />, <path key={3} d="M8.5 13l2.2 2.2L15.5 11" />],
    progress: [<path key={1} d="M3 17l5-5 4 4 8-8" />, <path key={2} d="M14.5 8h5.5v5.5" />],
    reports: [<path key={1} d="M5 20V10" />, <path key={2} d="M12 20V5" />, <path key={3} d="M19 20v-7" />],
    notifications: [<path key={1} d="M18.5 16.5H5.5l1.3-2.2v-3.6a5.2 5.2 0 0 1 10.4 0v3.6z" />, <path key={2} d="M10 19.5a2 2 0 0 0 4 0" />],
    settings: [<path key={1} d="M4 8h9" />, <path key={2} d="M19 8h1" />, <path key={3} d="M4 16h1" />, <path key={4} d="M11 16h9" />, <circle key={5} cx={16} cy={8} r={2.2} />, <circle key={6} cx={8} cy={16} r={2.2} />],
    search: [<circle key={1} cx={11} cy={11} r={7} />, <path key={2} d="M21 21l-4.2-4.2" />],
    plus: [<path key={1} d="M12 5v14" />, <path key={2} d="M5 12h14" />],
    x: [<path key={1} d="M6 6l12 12" />, <path key={2} d="M18 6L6 18" />],
    check: [<path key={1} d="M5 12.5l4.5 4.5L19 7.5" />],
    chevR: [<path key={1} d="M9 5.5l6.5 6.5L9 18.5" />],
    chevL: [<path key={1} d="M15 5.5L8.5 12l6.5 6.5" />],
    clock: [<circle key={1} cx={12} cy={12} r={8.5} />, <path key={2} d="M12 7v5.2l3.4 2" />],
    alert: [<path key={1} d="M12 3.4l9 15.6H3z" />, <path key={2} d="M12 10v4" />, <path key={3} d="M12 16.8v.2" />],
    phone: [<path key={1} d="M5 4h3.6l1.3 4.4-2.3 1.6a12 12 0 0 0 5.4 5.4l1.6-2.3 4.4 1.3V20a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 3 5.1 2 2 0 0 1 5 4z" />],
    pin: [<path key={1} d="M12 21s7-5.8 7-11a7 7 0 0 0-14 0c0 5.2 7 11 7 11z" />, <circle key={2} cx={12} cy={10} r={2.4} />],
    logout: [<path key={1} d="M15.5 16.5l4.5-4.5-4.5-4.5" />, <path key={2} d="M20 12H9.5" />, <path key={3} d="M11 4.5H5.5v15H11" />],
    globe: [<circle key={1} cx={12} cy={12} r={8.5} />, <path key={2} d="M3.5 12h17" />, <path key={3} d="M12 3.5a13 13 0 0 1 0 17" />, <path key={4} d="M12 3.5a13 13 0 0 0 0 17" />],
    monitor: [<rect key={1} x={3} y={4} width={18} height={13} rx={2} />, <path key={2} d="M9 21h6" />, <path key={3} d="M12 17v4" />],
    mobile: [<rect key={1} x={7} y={2.5} width={10} height={19} rx={2.4} />, <path key={2} d="M11 18.5h2" />],
    bolt: [<path key={1} d="M13 3L5 13.5h5l-1 7.5 8-10.5h-5l1-7.5z" />],
    euro: [<circle key={1} cx={12} cy={12} r={8.5} />, <path key={2} d="M15 9.2a4 4 0 1 0 0 5.6" />, <path key={3} d="M7.5 11h6" />, <path key={4} d="M7.5 13h5" />],
    car2: [<path key={1} d="M4 13l1.6-4.6A2.4 2.4 0 0 1 7.9 7h8.2a2.4 2.4 0 0 1 2.3 1.4L20 13" />, <rect key={2} x={3} y={13} width={18} height={5.4} rx={1.8} />, <circle key={3} cx={7.5} cy={18.6} r={1.4} />, <circle key={4} cx={16.5} cy={18.6} r={1.4} />],
    filter: [<path key={1} d="M3 5h18" />, <path key={2} d="M6 12h12" />, <path key={3} d="M10 19h4" />],
    menu: [<path key={1} d="M4 7h16" />, <path key={2} d="M4 12h16" />, <path key={3} d="M4 17h16" />],
    bell: [<path key={1} d="M18.5 16.5H5.5l1.3-2.2v-3.6a5.2 5.2 0 0 1 10.4 0v3.6z" />, <path key={2} d="M10 19.5a2 2 0 0 0 4 0" />],
    doc: [<path key={1} d="M7 3h7l4 4v14H7z" />, <path key={2} d="M14 3v4h4" />, <path key={3} d="M9.5 13h5" />, <path key={4} d="M9.5 16h5" />],
    star: [<path key={1} d="M12 4l2.3 4.8 5.2.7-3.8 3.6.9 5.1L12 16.6 7.2 18.2l.9-5.1L4.3 9.5l5.2-.7z" />],
    courses: [<path key={1} d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" />, <path key={2} d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />],
    image: [<rect key={1} x={3} y={4} width={18} height={16} rx={2.2} />, <circle key={2} cx={8.5} cy={9} r={1.6} />, <path key={3} d="M21 16l-5-5-7 7" />],
    trash: [<path key={1} d="M4 7h16" />, <path key={2} d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />, <path key={3} d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />],
    edit: [<path key={1} d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2z" />, <path key={2} d="M14 7l3 3" />],
    eye: [<path key={1} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />, <circle key={2} cx={12} cy={12} r={3} />],
    eyeOff: [<path key={1} d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.4 3.2" />, <path key={2} d="M6.2 6.2A18 18 0 0 0 2 12s3.5 7 10 7a10.6 10.6 0 0 0 4.1-.8" />, <path key={3} d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />, <path key={4} d="M3 3l18 18" />],
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block' }}>
      {paths[name] || null}
    </svg>
  );
}

export function Pill({ text, color, bg }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, color, background: bg, padding: '4px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
}

export function Avatar({ name, size = 34 }) {
  const colors = [C.pri, C.vio, C.teal, C.amb, C.grn];
  const ci = name.charCodeAt(0) % colors.length;
  const init = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors[ci] + '1f', color: colors[ci],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
      fontFamily: font.disp,
    }}>{init}</div>
  );
}

export function ProgressBar({ val, max, color, h: height = 7 }) {
  const pct = Math.round(val / max * 100);
  return (
    <div style={{ height, background: C.line, borderRadius: height, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: height, transition: 'width .4s' }} />
    </div>
  );
}

export function Card({ title, extra, children }) {
  return (
    <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 14, overflow: 'hidden' }}>
      {title != null && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid ' + C.line2 }}>
          <div style={{ fontFamily: font.disp, fontWeight: 600, fontSize: 14.5, color: C.ink }}>{title}</div>
          {extra}
        </div>
      )}
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  );
}

export function EmptyRow({ msg }) {
  return <div style={{ padding: '30px 20px', textAlign: 'center', color: C.soft, fontSize: 13 }}>{msg}</div>;
}

export function KV({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + C.line2, fontSize: 13.5 }}>
      <span style={{ color: C.mut, fontWeight: 500 }}>{label}</span>
      <span style={{ color: C.ink, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export function iconBtnStyle() {
  return { border: '1px solid ' + C.line, background: C.surf, color: C.ink2, width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' };
}

export function btnGhostStyle() {
  return { display: 'flex', alignItems: 'center', gap: 7, border: '1px solid ' + C.line, background: C.surf, color: C.ink2, fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10 };
}

export function inputStyle() {
  return { width: '100%', border: '1px solid ' + C.line, background: C.surf, color: C.ink, fontSize: 13.5, padding: '10px 12px', borderRadius: 9, outline: 'none' };
}

export function statusColor(s) {
  return ({ scheduled: C.pri, completed: C.grn, cancelled: C.red, no_show: C.amb, passed: C.grn, failed: C.red })[s] || C.mut;
}
export function statusBg(s) {
  return ({ scheduled: C.priBg, completed: C.grnBg, cancelled: C.redBg, no_show: C.ambBg, passed: C.grnBg, failed: C.redBg })[s] || C.line2;
}
export function payColor(p) {
  return ({ paid: C.grn, partial: C.amb, unpaid: C.red })[p] || C.mut;
}
export function payBg(p) {
  return ({ paid: C.grnBg, partial: C.ambBg, unpaid: C.redBg })[p] || C.line2;
}
export function euro(n) { return '€' + Number(n).toLocaleString('de-DE'); }
