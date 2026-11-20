import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext.jsx';
import { Button, Field, Input, Select, PasswordInput, Choices, Icon, LogoMark } from '../components/ui.jsx';
import { AuthSide, AuthTop } from './Login.jsx';
import { KOSOVO_CITIES } from '../data/cities.js';
import { LICENCE_CATS } from '../lib/brand.js';

const STEPS = ['step_account', 'step_school', 'step_contact', 'step_details'];

// Resize the logo before it's stored (it travels in the signup metadata).
function shrinkImage(file, max = 256) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(r.result);
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

export default function Signup() {
  const { T, registerSchool, showToast, navigate } = useApp();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', schoolName: '', bizNumber: '', address: '', city: '', phone: '', logo: null, cats: ['B'], terms: false });
  const set = (p) => setF(prev => ({ ...prev, ...p }));

  const ok = [
    f.name.trim() && /\S+@\S+\.\S+/.test(f.email) && f.password.length >= 6 && f.password === f.confirm,
    f.schoolName.trim(),
    f.city && f.phone.trim(),
    f.cats.length > 0 && f.terms,
  ];

  async function finish() {
    setError('');
    setBusy(true);
    const res = await registerSchool({
      name: f.name.trim(), email: f.email.trim(), password: f.password,
      school: { name: f.schoolName.trim(), bizNumber: f.bizNumber.trim(), address: f.address.trim(), city: f.city, phone: f.phone.trim(), logo: f.logo, cats: f.cats },
    });
    setBusy(false);
    if (!res.ok) return setError(res.error || T('err_generic'));
    if (res.confirm) { showToast(T('check_email')); navigate({ screen: 'login' }); }
  }

  const head = (t, d) => (<><h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.035em' }}>{T(t)}</h1><p className="muted" style={{ marginTop: 4, marginBottom: 22 }}>{T(d)}</p></>);

  return (
    <div className="auth">
      <AuthSide />
      <div className="auth-main">
        <div className="auth-card">
          <AuthTop />
          <div className="row" style={{ gap: 6, marginBottom: 26 }}>
            {STEPS.map((k, i) => (
              <React.Fragment key={k}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: i < step ? 'var(--green)' : i === step ? 'var(--brand)' : 'var(--surface-3)', color: i <= step ? '#fff' : 'var(--muted)' }}>
                    {i < step ? <Icon name="check" size={14} sw={2.8} /> : i + 1}
                  </span>
                  {i === step && <span style={{ fontSize: 12.5, fontWeight: 650 }}>{T(k)}</span>}
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: i < step ? 'var(--green)' : 'var(--line)' }} />}
              </React.Fragment>
            ))}
          </div>

          {step === 0 && (<>
            {head('su_account_t', 'su_account_d')}
            <Field label={T('full_name')}><Input value={f.name} onChange={e => set({ name: e.target.value })} autoComplete="name" autoFocus /></Field>
            <Field label={T('email')}><Input type="email" value={f.email} onChange={e => set({ email: e.target.value })} placeholder="ju@autoshkolla.com" autoComplete="email" /></Field>
            <Field label={T('password')} hint={T('min6')}><PasswordInput value={f.password} onChange={e => set({ password: e.target.value })} autoComplete="new-password" /></Field>
            <Field label={T('confirm_password')} error={f.confirm && f.password !== f.confirm ? T('pw_mismatch') : null}><PasswordInput value={f.confirm} onChange={e => set({ confirm: e.target.value })} autoComplete="new-password" /></Field>
          </>)}

          {step === 1 && (<>
            {head('su_school_t', 'su_school_d')}
            <Field label={T('school_name')}><Input value={f.schoolName} onChange={e => set({ schoolName: e.target.value })} placeholder={T('school_name_ph')} autoFocus /></Field>
            <Field label={T('biz_number') + ' (' + T('optional') + ')'}><Input value={f.bizNumber} onChange={e => set({ bizNumber: e.target.value })} placeholder="811234567" inputMode="numeric" /></Field>
          </>)}

          {step === 2 && (<>
            {head('su_contact_t', 'su_contact_d')}
            <Field label={T('city')}><Select value={f.city} onChange={e => set({ city: e.target.value })} options={[{ v: '', l: T('select_city') }, ...KOSOVO_CITIES.map(c => ({ v: c, l: c }))]} /></Field>
            <Field label={T('address')}><Input value={f.address} onChange={e => set({ address: e.target.value })} placeholder="Rr. Nëna Terezë 12" /></Field>
            <Field label={T('phone')}><Input type="tel" value={f.phone} onChange={e => set({ phone: e.target.value })} placeholder="+383 44 000 000" /></Field>
          </>)}

          {step === 3 && (<>
            {head('su_details_t', 'su_details_d')}
            <Field label={T('school_logo') + ' (' + T('optional') + ')'} hint={T('logo_hint')}>
              <div className="row" style={{ gap: 14 }}>
                <button type="button" onClick={() => fileRef.current.click()} style={{ border: '2px dashed var(--line)', background: 'var(--surface-2)', borderRadius: 16, padding: 0, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft)', overflow: 'hidden' }}>
                  {f.logo ? <LogoMark size={60} logo={f.logo} /> : <Icon name="upload" size={22} />}
                </button>
                <Button size="sm" onClick={() => fileRef.current.click()}>{f.logo ? T('change') : T('choose_file')}</Button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const file = e.target.files[0]; if (file) set({ logo: await shrinkImage(file) }); }} />
              </div>
            </Field>
            <Field label={T('categories_offered')}>
              <Choices multi chip value={f.cats} onChange={v => set({ cats: v })} options={LICENCE_CATS.map(c => ({ v: c, l: c }))} />
            </Field>
            <label className="check" style={{ marginTop: 6 }}>
              <input type="checkbox" checked={f.terms} onChange={e => set({ terms: e.target.checked })} />
              <span>{T('terms_consent')} <a href="#/privacy" target="_blank" rel="noopener">{T('privacy_policy')}</a>.</span>
            </label>
            {error && <div className="field-error" style={{ marginTop: 12 }}><Icon name="alert" size={14} sw={2} />{error}</div>}
          </>)}

          <div className="row" style={{ gap: 10, marginTop: 22 }}>
            {step > 0 && <Button size="lg" icon="chevL" onClick={() => setStep(s => s - 1)} aria-label={T('back')} />}
            {step < 3
              ? <Button variant="primary" size="lg" block disabled={!ok[step]} onClick={() => setStep(s => s + 1)}>{T('continue')}</Button>
              : <Button variant="primary" size="lg" block disabled={!ok[3]} loading={busy} onClick={finish}>{busy ? T('creating') : T('launch')}</Button>}
          </div>
          <div className="row muted" style={{ gap: 6, justifyContent: 'center', marginTop: 14, fontSize: 12.5 }}><Icon name="shield" size={15} />{T('pilot_note')}</div>
          <div className="muted" style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5 }}>
            {T('have_account')} <button className="btn-link" onClick={() => navigate({ screen: 'login' })}>{T('sign_in')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
