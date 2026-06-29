import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

const ROLES = [
  { value: 'owner',         label: 'Owner',          sub: 'Full access — desktop',    device: 'desktop' },
  { value: 'administrator', label: 'Administrator',   sub: 'Manage ops — desktop',     device: 'desktop' },
  { value: 'receptionist',  label: 'Receptionist',   sub: 'Front desk — desktop',     device: 'desktop' },
  { value: 'instructor',    label: 'Instructor',      sub: 'Lessons & students — mobile', device: 'mobile' },
  { value: 'student',       label: 'Student',         sub: 'My lessons & progress — mobile', device: 'mobile' },
];

export default function Login() {
  const { login } = useApp();
  const [selected, setSelected] = useState('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSignIn() {
    const role = ROLES.find(r => r.value === selected);
    login(role.value, role.device);
  }

  const inp = {
    width: '100%', border: '1px solid ' + C.line, background: '#f9fafb',
    color: C.ink, fontSize: 14, padding: '11px 14px', borderRadius: 10,
    outline: 'none', fontFamily: font.body,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0e1219 0%,#141c2b 60%,#1a1f2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 22, padding: '40px 36px', boxShadow: '0 40px 80px -20px rgba(0,0,0,.55)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px -6px rgba(42,111,219,.6)' }}>
            <Icon name="car2" size={24} sw={2} />
          </div>
          <div>
            <div style={{ fontFamily: font.disp, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: '-.02em' }}>DriveFlow</div>
            <div style={{ fontSize: 12, color: C.mut, fontWeight: 600, marginTop: -2 }}>Autoshkolla OS</div>
          </div>
        </div>

        <div style={{ fontFamily: font.disp, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Sign in</div>
        <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 24 }}>Choose your role to continue</div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@autoshkolla.com" style={inp} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} />
        </div>

        {/* Role picker */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 10 }}>Role</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {ROLES.map(r => {
            const active = selected === r.value;
            const isMobile = r.device === 'mobile';
            return (
              <button key={r.value} onClick={() => setSelected(r.value)} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '11px 14px',
                border: '1.5px solid ' + (active ? C.pri : C.line),
                background: active ? C.priBg : '#fafafa',
                borderRadius: 11, textAlign: 'left', cursor: 'pointer',
                transition: 'all .14s',
              }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? C.pri : C.line2, color: active ? '#fff' : C.mut, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={isMobile ? 'mobile' : 'monitor'} size={16} sw={1.9} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: active ? C.pri : C.ink }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: C.mut, marginTop: 1 }}>{r.sub}</div>
                </div>
                {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.pri, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        <button onClick={handleSignIn} style={{
          width: '100%', border: 'none', background: 'linear-gradient(135deg,#2a6fdb,#6557d1)',
          color: '#fff', fontSize: 14.5, fontWeight: 700, padding: '13px', borderRadius: 12,
          cursor: 'pointer', boxShadow: '0 10px 24px -8px rgba(42,111,219,.55)',
          fontFamily: font.body,
        }}>
          Sign in
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: C.soft, marginTop: 18 }}>
          Demo app — any credentials work
        </div>
      </div>
    </div>
  );
}
