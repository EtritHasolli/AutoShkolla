import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

export default function Login() {
  const { authenticate, setAuthScreen, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  function handleSignIn() {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!authenticate(email, password)) {
      setError('Invalid email or password.');
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSignIn();
  }

  const inp = {
    width: '100%', border: '1px solid ' + C.line, background: '#f9fafb',
    color: C.ink, fontSize: 14, padding: '11px 14px', borderRadius: 10,
    outline: 'none', fontFamily: font.body, boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0e1219 0%,#141c2b 60%,#1a1f2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 22, padding: '40px 36px', boxShadow: '0 40px 80px -20px rgba(0,0,0,.55)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px -6px rgba(42,111,219,.6)' }}>
            <Icon name="car2" size={24} sw={2} />
          </div>
          <div>
            <div style={{ fontFamily: font.disp, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: '-.02em' }}>DriveFlow</div>
            <div style={{ fontSize: 12, color: C.mut, fontWeight: 600, marginTop: -2 }}>Autoshkolla OS</div>
          </div>
        </div>

        <div style={{ fontFamily: font.disp, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 24 }}>Sign in to your account</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Email</div>
          <input
            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
            placeholder="you@autoshkolla.com" style={inp} autoComplete="email"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2 }}>Password</div>
            <button className="df-link" onClick={() => showToast('Password reset link sent (demo)')} style={{ border: 'none', background: 'none', color: C.pri, fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: font.body }}>
              Forgot password?
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
              placeholder="••••••••" style={{ ...inp, paddingRight: 44 }} autoComplete="current-password"
            />
            <button className="df-ghost" onClick={() => setShowPass(s => !s)} tabIndex={-1} title={showPass ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: C.mut, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name={showPass ? 'eyeOff' : 'eye'} size={18} sw={1.8} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12.5, color: C.red, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="alert" size={14} sw={2} /> {error}
          </div>
        )}

        <div style={{ height: error ? 0 : 16 }} />

        <button onClick={handleSignIn} style={{
          width: '100%', border: 'none', background: 'linear-gradient(135deg,#2a6fdb,#6557d1)',
          color: '#fff', fontSize: 14.5, fontWeight: 700, padding: '13px', borderRadius: 12,
          cursor: 'pointer', boxShadow: '0 10px 24px -8px rgba(42,111,219,.55)', fontFamily: font.body,
        }}>
          Sign in
        </button>

        <div style={{ textAlign: 'center', fontSize: 13, color: C.mut, marginTop: 20 }}>
          Don't have an account?{' '}
          <button className="df-link" onClick={() => setAuthScreen('signup')} style={{ border: 'none', background: 'none', color: C.pri, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: font.body }}>
            Register your school
          </button>
        </div>
      </div>
    </div>
  );
}
