import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Button, Field, Input, PasswordInput, Icon, Logo } from '../components/ui.jsx';
import { LangToggle } from '../components/Shell.jsx';
import { DemoPicker } from './Landing.jsx';

export function AuthSide() {
  const { T } = useApp();
  return (
    <div className="auth-side">
      <Logo size={38} light />
      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ color: '#fff', fontSize: 34, fontWeight: 800, letterSpacing: '-.035em', maxWidth: 440 }}>{T('auth_side_title')}</h2>
        <div className="stack" style={{ gap: 12, marginTop: 24 }}>
          {['auth_side_1', 'auth_side_2', 'auth_side_3'].map(k => (
            <div key={k} className="row" style={{ gap: 10, fontSize: 15, color: 'rgba(255,255,255,.92)' }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} sw={2.6} /></span>{T(k)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 40, fontSize: 13, color: 'rgba(255,255,255,.65)', position: 'relative', zIndex: 1 }}>© {new Date().getFullYear()} · Kosovë</div>
    </div>
  );
}

export function AuthTop() {
  const { T, navigate } = useApp();
  return (
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 28 }}>
      <button onClick={() => navigate({ screen: 'landing' })} className="btn btn-ghost btn-sm" style={{ marginLeft: -10 }}><Icon name="chevL" size={16} />{T('nav_schools')}</button>
      <LangToggle />
    </div>
  );
}

export default function Login() {
  const { T, authenticate, resetPassword, resendConfirmation, showToast, navigate, hasBackend } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [demo, setDemo] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    setError(''); setUnconfirmed(false);
    if (!email.trim() || !password) return setError(T('err_login_fields'));
    setBusy(true);
    const res = await authenticate(email.trim(), password);
    setBusy(false);
    if (!res.ok) { setError(res.error || T('err_login')); setUnconfirmed(!!res.unconfirmed); }
  }
  async function forgot() {
    if (!email.trim()) return setError(T('enter_email_first'));
    const r = await resetPassword(email.trim());
    showToast(r.ok ? T('reset_sent', { email: email.trim() }) : r.error, r.ok ? 'ok' : 'error');
  }
  async function resend() {
    const r = await resendConfirmation(email.trim());
    showToast(r.ok ? T('confirm_resent', { email: email.trim() }) : r.error, r.ok ? 'ok' : 'error');
  }

  return (
    <div className="auth">
      <AuthSide />
      <div className="auth-main">
        <div className="auth-card">
          <AuthTop />
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.035em' }}>{T('welcome_back')}</h1>
          <p className="muted" style={{ marginTop: 4, marginBottom: 24 }}>{T('sign_in_sub')}</p>
          <form onSubmit={submit}>
            <Field label={T('email')}><Input type="email" icon="user" value={email} onChange={e => setEmail(e.target.value)} placeholder="ju@autoshkolla.com" autoComplete="email" autoFocus /></Field>
            <Field label={<span className="row" style={{ justifyContent: 'space-between' }}>{T('password')}<button type="button" className="btn-link" style={{ fontSize: 12.5 }} onClick={forgot}>{T('forgot_password')}</button></span>}>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            {error && (
              <div className="field-error" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
                <Icon name="alert" size={15} sw={2} />
                <div>{error}{unconfirmed && <div><button type="button" className="btn-link" style={{ fontSize: 12.5, marginTop: 4 }} onClick={resend}>{T('resend_confirm')}</button></div>}</div>
              </div>
            )}
            <Button type="submit" variant="primary" size="lg" block loading={busy}>{busy ? T('signing_in') : T('sign_in')}</Button>
          </form>

          <div className="row" style={{ gap: 10, margin: '22px 0' }}><div style={{ flex: 1, height: 1, background: 'var(--line)' }} /><span className="soft" style={{ fontSize: 12 }}>{T('try_demo').toLowerCase()}</span><div style={{ flex: 1, height: 1, background: 'var(--line)' }} /></div>
          <Button block icon="sparkle" onClick={() => setDemo(true)}>{T('try_demo')}</Button>
          {!hasBackend && <p className="soft" style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>Demo: {T('password').toLowerCase()} = owner · admin · instructor · student · superadmin</p>}

          <div className="muted" style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5 }}>
            {T('no_account')} <button className="btn-link" onClick={() => navigate({ screen: 'signup' })}>{T('register_school')}</button>
          </div>
          <div className="muted" style={{ textAlign: 'center', marginTop: 6, fontSize: 13.5 }}>
            {T('are_student')} <button className="btn-link" onClick={() => navigate({ screen: 'landing' })}>{T('browse_schools')}</button>
          </div>
        </div>
      </div>
      {demo && <DemoPicker onClose={() => setDemo(false)} />}
    </div>
  );
}
