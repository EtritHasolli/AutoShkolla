import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const { authenticate, setAuthScreen, showToast, isLive } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);

  async function handleSignIn() {
    setError('');
    setUnconfirmed(false);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    const res = await authenticate(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || 'Invalid email or password.');
      setUnconfirmed(!!res.unconfirmed);
    }
  }

  async function resendConfirmation() {
    const { error: err } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    showToast(err ? err.message : 'Confirmation email re-sent to ' + email.trim());
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0e1a15 0%,#13251d 55%,#1a3327 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 22, padding: '40px 36px', boxShadow: '0 40px 80px -20px rgba(0,0,0,.55)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: '#0f9d6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px -6px rgba(15,157,107,.6)' }}>
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
            <button className="df-link" onClick={async () => {
              if (!isLive) { showToast('Password reset link sent (demo)'); return; }
              if (!email.trim()) { setError('Enter your email first, then tap "Forgot password?".'); return; }
              const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
              showToast(err ? err.message : 'Password reset link sent to ' + email.trim());
            }} style={{ border: 'none', background: 'none', color: C.pri, fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: font.body }}>
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
          <div style={{ fontSize: 12.5, color: C.red, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="alert" size={14} sw={2} /> {error}
            </div>
            {unconfirmed && (
              <button onClick={resendConfirmation} style={{ border: 'none', background: 'none', color: C.pri, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: 0, marginTop: 6, fontFamily: font.body }}>
                Resend confirmation email
              </button>
            )}
          </div>
        )}

        <div style={{ height: error ? 0 : 16 }} />

        <button onClick={handleSignIn} disabled={busy} style={{
          width: '100%', border: 'none', background: busy ? C.line : '#0f9d6b',
          color: busy ? C.mut : '#fff', fontSize: 14.5, fontWeight: 700, padding: '13px', borderRadius: 12,
          cursor: busy ? 'wait' : 'pointer', boxShadow: busy ? 'none' : '0 10px 24px -8px rgba(15,157,107,.55)', fontFamily: font.body,
        }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 13, color: C.mut, marginTop: 20 }}>
          Don't have an account?{' '}
          <button className="df-link" onClick={() => setAuthScreen('signup')} style={{ border: 'none', background: 'none', color: C.pri, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: font.body }}>
            Register your school
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: C.mut, marginTop: 8 }}>
          Student?{' '}
          <button className="df-link" onClick={() => setAuthScreen('landing')} style={{ border: 'none', background: 'none', color: C.pri, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: font.body }}>
            Browse schools & enroll
          </button>
        </div>
      </div>
    </div>
  );
}
