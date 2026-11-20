import React, { useEffect } from 'react';
import { avatarTone, initials } from '../lib/format.js';
import { BRAND } from '../lib/brand.js';

/* ------------------------------------------------------------------ icons */
const P = {
  dashboard: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>,
  home: <><path d="M3.5 10.5L12 4l8.5 6.5" /><path d="M5.5 9v10.5h13V9" /><path d="M10 19.5v-5h4v5" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16.5" rx="3" /><path d="M3 9.5h18" /><path d="M8 2.5v4" /><path d="M16 2.5v4" /></>,
  students: <><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20a6.3 6.3 0 0 1 12.4 0" /><circle cx="17.2" cy="9" r="2.5" /><path d="M16.2 14.3a4.9 4.9 0 0 1 5 4.9" /></>,
  instructors: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" /><path d="M12 14.6V21" /><path d="M9.6 11.1L3.4 9.6" /><path d="M14.4 11.1l6.2-1.5" /></>,
  car: <><path d="M4.5 12.5l1.7-4.6A2.5 2.5 0 0 1 8.5 6.3h7a2.5 2.5 0 0 1 2.3 1.6l1.7 4.6" /><rect x="3" y="12.5" width="18" height="5.5" rx="2" /><path d="M5.5 18v2" /><path d="M18.5 18v2" /><circle cx="7.5" cy="15.2" r=".9" fill="currentColor" /><circle cx="16.5" cy="15.2" r=".9" fill="currentColor" /></>,
  packages: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8.5l9 5 9-5V8" /><path d="M12 13v8.5" /></>,
  payments: <><rect x="2.5" y="5" width="19" height="14" rx="3" /><path d="M2.5 10h19" /><path d="M6.5 15h4" /></>,
  exams: <><rect x="5" y="4" width="14" height="17.5" rx="2.5" /><rect x="8.8" y="2.3" width="6.4" height="3.6" rx="1.3" /><path d="M8.6 13.2l2.3 2.3 4.6-4.8" /></>,
  courses: <><path d="M4 5.5A2 2 0 0 1 6 3.5h5v16H6a2 2 0 0 0-2 2z" /><path d="M20 5.5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2z" /></>,
  reports: <><path d="M4 20h16" /><rect x="5.5" y="11" width="3" height="6.5" rx="1" /><rect x="10.5" y="6.5" width="3" height="11" rx="1" /><rect x="15.5" y="13.5" width="3" height="4" rx="1" /></>,
  bell: <><path d="M18.5 16.5h-13l1.4-2.3v-3.6a5.1 5.1 0 0 1 10.2 0v3.6z" /><path d="M10 19.6a2 2 0 0 0 4 0" /></>,
  settings: <><path d="M4 7h10" /><path d="M18 7h2" /><path d="M4 17h2" /><path d="M10 17h10" /><circle cx="16" cy="7" r="2.3" /><circle cx="8" cy="17" r="2.3" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20.5 20.5l-4.2-4.2" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  minus: <path d="M5 12h14" />,
  x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.8 2.8L16.2 9.6" /></>,
  chevR: <path d="M9 5.5l6.5 6.5L9 18.5" />,
  chevL: <path d="M15 5.5L8.5 12l6.5 6.5" />,
  chevD: <path d="M5.5 9l6.5 6.5L18.5 9" />,
  arrowR: <><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.4 2" /></>,
  alert: <><path d="M12 3.6l9.2 16H2.8z" /><path d="M12 10v4.2" /><path d="M12 17.2v.1" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.6v.1" /></>,
  phone: <path d="M5.2 3.8h3.4l1.5 4.3-2.4 1.6a12.4 12.4 0 0 0 5.6 5.6l1.6-2.4 4.3 1.5v3.4a2 2 0 0 1-2.1 2A16.6 16.6 0 0 1 3.2 5.9a2 2 0 0 1 2-2.1z" />,
  whatsapp: <><path d="M3.6 20.4l1.3-4.1A8.6 8.6 0 1 1 8 19.3z" /><path d="M9 8.6c.2-.5.6-.6.9-.6h.4c.2 0 .3.1.4.3l.7 1.6c.1.2 0 .4-.1.6l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.2.1.3.2.3.4v.4c0 .3-.1.7-.6.9-1.6.7-6.4-2.6-6.8-6.8z" /></>,
  pin: <><path d="M12 21s7-6 7-11.2a7 7 0 0 0-14 0C5 15 12 21 12 21z" /><circle cx="12" cy="9.8" r="2.5" /></>,
  logout: <><path d="M15.5 16.5L20 12l-4.5-4.5" /><path d="M20 12H9.5" /><path d="M11 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13.5 13.5 0 0 1 0 18" /><path d="M12 3a13.5 13.5 0 0 0 0 18" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  more: <><circle cx="5.5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="18.5" cy="12" r="1.4" fill="currentColor" /></>,
  grid: <><circle cx="6" cy="6" r="1.6" /><circle cx="12" cy="6" r="1.6" /><circle cx="18" cy="6" r="1.6" /><circle cx="6" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18" cy="12" r="1.6" /><circle cx="6" cy="18" r="1.6" /><circle cx="12" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></>,
  euro: <><circle cx="12" cy="12" r="9" /><path d="M15.2 8.8a4 4 0 1 0 0 6.4" /><path d="M7.5 11h6" /><path d="M7.5 13.2h5" /></>,
  filter: <><path d="M3.5 5.5h17" /><path d="M6.5 12h11" /><path d="M10 18.5h4" /></>,
  doc: <><path d="M7 3h7l4 4v14H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /><path d="M9.5 13h5.5" /><path d="M9.5 16.5h5.5" /></>,
  receipt: <><path d="M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.4z" /><path d="M9 8h6" /><path d="M9 11.5h6" /><path d="M9 15h3.5" /></>,
  star: <path d="M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.2" r="1.7" /><path d="M21 16l-5-5-7.5 7.5" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></>,
  edit: <><path d="M4 20h4L18.6 9.4a2 2 0 0 0-2.8-2.8L5 17.2z" /><path d="M14 8l2.9 2.9" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M10.6 5.1A11 11 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.4 3.2" /><path d="M6.2 6.2A17.6 17.6 0 0 0 2 12s3.6 7 10 7a10.4 10.4 0 0 0 4.1-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M3 3l18 18" /></>,
  download: <><path d="M12 4v11" /><path d="M7 10.5l5 5 5-5" /><path d="M4.5 19.5h15" /></>,
  upload: <><path d="M12 15.5V4.5" /><path d="M7 9l5-5 5 5" /><path d="M4.5 19.5h15" /></>,
  printer: <><path d="M7 8V3.5h10V8" /><rect x="3.5" y="8" width="17" height="8.5" rx="2" /><path d="M7 13.5h10V21H7z" /></>,
  repeat: <><path d="M17 3l3 3-3 3" /><path d="M4 11.5V10a4 4 0 0 1 4-4h12" /><path d="M7 21l-3-3 3-3" /><path d="M20 12.5V14a4 4 0 0 1-4 4H4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  shield: <><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></>,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
  map: <><path d="M9 4.5L3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2z" /><path d="M9 4.5v13" /><path d="M15 6.5v13" /></>,
  wifiOff: <><path d="M3 3l18 18" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><path d="M5 12.9a10 10 0 0 1 4.2-2.5" /><path d="M14.6 10.3A10 10 0 0 1 19 12.9" /><path d="M2 9.3a15 15 0 0 1 4.3-2.8" /><path d="M10.6 5.6A15 15 0 0 1 22 9.3" /><path d="M12 19.8v.1" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  building: <><path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5V21" /><path d="M15 10h3.5A1.5 1.5 0 0 1 20 11.5V21" /><path d="M3 21h18" /><path d="M8 8h3" /><path d="M8 12h3" /><path d="M8 16h3" /></>,
  list: <><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="12" r="1" fill="currentColor" /><circle cx="4.5" cy="18" r="1" fill="currentColor" /></>,
  trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.3 5.3L3.5 17.5a2.1 2.1 0 0 0 3 3l5.9-5.9a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.6-.4-.4-2.6z" />,
  smartphone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12.5" rx="2" /><path d="M9 20.5h6" /><path d="M12 16.5v4" /></>,
};
P.vehicles = P.car;
P.car2 = P.car;
P.notifications = P.bell;

export function Icon({ name, size = 18, sw = 1.8, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ flexShrink: 0, display: 'block', ...style }}>
      {P[name] || null}
    </svg>
  );
}

/* ----------------------------------------------------------------- brand */
export function LogoMark({ size = 36, logo }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: logo ? 'var(--surface)' : 'linear-gradient(145deg, #2f63f5, #1c47c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, position: 'relative', overflow: 'hidden', boxShadow: logo ? 'inset 0 0 0 1px var(--line)' : '0 6px 14px -6px rgba(36,86,230,.7)' }}>
      {logo ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
        <>
          <Icon name="instructors" size={size * 0.58} sw={2.1} />
          <span style={{ position: 'absolute', top: size * 0.14, right: size * 0.14, width: size * 0.17, height: size * 0.17, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 0 2px #2456e6' }} />
        </>
      )}
    </div>
  );
}

export function Logo({ size = 36, sub, light, name = BRAND, logo }) {
  return (
    <div className="row" style={{ gap: 10, minWidth: 0 }}>
      <LogoMark size={size} logo={logo} />
      <div style={{ minWidth: 0 }}>
        <div className="truncate" style={{ fontWeight: 800, fontSize: size * 0.47, letterSpacing: '-.03em', color: light ? '#fff' : 'var(--ink)', lineHeight: 1.15 }}>{name}</div>
        {sub && <div className="truncate" style={{ fontSize: 11.5, fontWeight: 550, color: light ? 'rgba(255,255,255,.7)' : 'var(--muted)' }}>{sub}</div>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- buttons */
export function Button({ variant = 'secondary', size, icon, iconRight, block, loading, className = '', children, type = 'button', ...rest }) {
  const cls = ['btn', 'btn-' + variant, size && 'btn-' + size, block && 'btn-block', !children && icon && 'btn-icon', className].filter(Boolean).join(' ');
  const isz = size === 'sm' ? 15 : size === 'lg' ? 19 : 17;
  return (
    <button type={type} className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className={'spinner' + (['primary', 'danger', 'success'].includes(variant) ? '' : ' dark')} /> : icon && <Icon name={icon} size={isz} sw={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={isz} sw={2} />}
    </button>
  );
}

export function LinkButton({ href, variant = 'secondary', size, icon, block, children, className = '', ...rest }) {
  const cls = ['btn', 'btn-' + variant, size && 'btn-' + size, block && 'btn-block', !children && icon && 'btn-icon', className].filter(Boolean).join(' ');
  const external = /^https?:/.test(href || '');
  return (
    <a href={href} className={cls} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} sw={2} />}
      {children}
    </a>
  );
}

/* ------------------------------------------------------------- surfaces */
export function Card({ title, sub, extra, children, flush, className = '', bodyStyle, style, id }) {
  return (
    <div id={id} className={'card ' + (flush ? 'card-flush ' : '') + className} style={style}>
      {(title || extra) && (
        <div className="card-head">
          <div style={{ minWidth: 0 }}>
            {title && <div className="card-title truncate">{title}</div>}
            {sub && <div className="card-sub">{sub}</div>}
          </div>
          {extra}
        </div>
      )}
      <div className="card-body" style={bodyStyle}>{children}</div>
    </div>
  );
}

export function Badge({ tone = 'gray', dot, children, style }) {
  return <span className={'badge tone-' + tone + (dot ? ' badge-dot' : '')} style={style}>{children}</span>;
}

export function ToneIcon({ name, tone = 'brand', size = 36, iconSize }) {
  return (
    <div className={'ic-tile tone-' + tone} style={{ width: size, height: size, borderRadius: size * 0.3 }}>
      <Icon name={name} size={iconSize || Math.round(size * 0.5)} sw={2} />
    </div>
  );
}

export function Avatar({ name, size = 36, color }) {
  const [fg, bg] = color ? [color, color + '1c'] : avatarTone(name);
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.38) }}>
      {initials(name)}
    </div>
  );
}

export function Progress({ value, max = 100, color = 'var(--brand)', h = 6 }) {
  const pct = max ? Math.max(0, Math.min(100, Math.round(value / max * 100))) : 0;
  return <div className="progress" style={{ height: h }}><span style={{ width: pct + '%', background: color }} /></div>;
}

export function Ring({ pct, size = 96, stroke = 9, color = 'var(--brand)', track = 'var(--line-2)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * p) / 100} style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, sub, icon, tone = 'brand', valueColor }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <div className="stat-label">{label}</div>
        {icon && <ToneIcon name={icon} tone={tone} size={32} />}
      </div>
      <div className="stat-value" style={valueColor ? { color: valueColor } : null}>{value}</div>
      {sub && <div className="stat-sub truncate">{sub}</div>}
    </div>
  );
}

export function Empty({ icon = 'sparkle', title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-ic"><Icon name={icon} size={24} sw={1.8} /></div>
      {title && <div className="empty-title">{title}</div>}
      {text && <div className="empty-text">{text}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="page-head">
      <div style={{ minWidth: 0 }}>
        <h1 className="page-title">{title}</h1>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {actions && <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>{actions}</div>}
    </div>
  );
}

export function KV({ label, value, valueStyle }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line-2)', fontSize: 13.5 }}>
      <span className="muted" style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right', ...valueStyle }}>{value}</span>
    </div>
  );
}

/* ----------------------------------------------------------------- forms */
export function Field({ label, hint, error, children, style }) {
  return (
    <div className="field" style={style}>
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint && !error && <div className="field-hint">{hint}</div>}
      {error && <div className="field-error"><Icon name="alert" size={14} sw={2} />{error}</div>}
    </div>
  );
}

export function Input({ icon, right, className = '', ...props }) {
  if (!icon && !right) return <input className={'input ' + className} {...props} />;
  return (
    <div className={'input-icon' + (icon ? ' has-left' : '')}>
      {icon && <span className="ic"><Icon name={icon} size={17} sw={2} /></span>}
      <input className={'input ' + className} style={right ? { paddingRight: 44 } : null} {...props} />
      {right && <span className="ic-right">{right}</span>}
    </div>
  );
}

export function PasswordInput({ value, onChange, placeholder, autoComplete = 'current-password', onKeyDown }) {
  const [show, setShow] = React.useState(false);
  return (
    <Input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
      autoComplete={autoComplete} onKeyDown={onKeyDown}
      right={<button type="button" className="btn btn-ghost btn-sm btn-icon" tabIndex={-1} onClick={() => setShow(s => !s)}><Icon name={show ? 'eyeOff' : 'eye'} size={17} /></button>} />
  );
}

export function Select({ options, className = '', ...props }) {
  return (
    <select className={'select ' + className} {...props}>
      {options.map(o => <option key={o.v} value={o.v} disabled={o.disabled}>{o.l}</option>)}
    </select>
  );
}

export function Textarea(props) { return <textarea className="textarea" {...props} />; }

export function Segmented({ value, onChange, options, size }) {
  return (
    <div className={'seg' + (size === 'sm' ? ' seg-sm' : '')}>
      {options.map(o => (
        <button key={o.v} type="button" className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>
          {o.icon && <Icon name={o.icon} size={15} sw={2} />}{o.l}
        </button>
      ))}
    </div>
  );
}

export function Choices({ value, onChange, options, multi, chip }) {
  const isOn = (v) => multi ? value.includes(v) : value === v;
  return (
    <div className="choices">
      {options.map(o => (
        <button key={o.v} type="button" className={'choice' + (chip ? ' chip-toggle' : '') + (isOn(o.v) ? ' on' : '')} disabled={o.disabled}
          onClick={() => onChange(multi ? (value.includes(o.v) ? value.filter(x => x !== o.v) : [...value, o.v]) : o.v)}>
          {o.icon && <Icon name={o.icon} size={15} sw={2} />}{o.l}
        </button>
      ))}
    </div>
  );
}

export function Switch({ on, onChange, disabled }) {
  return <button type="button" role="switch" aria-checked={on} className={'switch' + (on ? ' on' : '')} disabled={disabled} onClick={() => onChange(!on)} />;
}

export function SettingRow({ title, hint, children }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--line-2)', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0, flex: '1 1 220px' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {hint && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

/* --------------------------------------------------------------- dialog */
export function Dialog({ title, onClose, children, footer, size, sheet = true }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={'overlay' + (sheet ? ' sheetable' : '')} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={'dialog' + (size === 'lg' ? ' dialog-lg' : '')} role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        <div className="dialog-head">
          <div className="dialog-title truncate">{title}</div>
          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={onClose} aria-label="close"><Icon name="x" size={18} /></button>
        </div>
        <div className="dialog-body">{children}</div>
        {footer && <div className="dialog-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- statuses */
export function lessonTone(s) {
  return ({ scheduled: 'brand', completed: 'green', cancelled: 'red', no_show: 'amber' })[s] || 'gray';
}
export function examTone(s) {
  return ({ scheduled: 'brand', passed: 'green', failed: 'red', not_taken: 'gray' })[s] || 'gray';
}
export function payTone(p) {
  return ({ paid: 'green', partial: 'amber', unpaid: 'red' })[p] || 'gray';
}
export function vehicleTone(s) {
  return ({ available: 'green', in_use: 'brand', maintenance: 'amber' })[s] || 'gray';
}
export function schoolTone(s) {
  return ({ active: 'green', trial: 'amber', suspended: 'red' })[s] || 'gray';
}
export const TONE_VAR = { brand: 'var(--brand)', green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', violet: 'var(--violet)', teal: 'var(--teal)', gray: 'var(--soft)' };
export const TONE_BG = { brand: 'var(--brand-50)', green: 'var(--green-50)', amber: 'var(--amber-50)', red: 'var(--red-50)', violet: 'var(--violet-50)', teal: 'var(--teal-50)', gray: 'var(--gray-50)' };
