import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { KOSOVO_CITIES } from '../data/cities.js';

const CATS = ['A', 'A1', 'A2', 'AM', 'B', 'B1', 'BE', 'C', 'C1', 'CE', 'D', 'D1'];

const STEPS = [
  { label: 'Account',  icon: 'students' },
  { label: 'School',   icon: 'dashboard' },
  { label: 'Contact',  icon: 'phone' },
  { label: 'Details',  icon: 'packages' },
];

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px -6px rgba(42,111,219,.6)' }}>
        <Icon name="car2" size={24} sw={2} />
      </div>
      <div>
        <div style={{ fontFamily: font.disp, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: '-.02em' }}>DriveFlow</div>
        <div style={{ fontSize: 12, color: C.mut, fontWeight: 600, marginTop: -2 }}>Autoshkolla OS</div>
      </div>
    </div>
  );
}

function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28, alignItems: 'center' }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < step ? C.grn : i === step ? C.pri : C.line2,
              color: i <= step ? '#fff' : C.mut, fontSize: 12, fontWeight: 700, transition: 'all .2s',
            }}>
              {i < step ? <Icon name="check" size={14} sw={2.5} /> : i + 1}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? C.grn : C.line, transition: 'background .3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inp = {
  width: '100%', border: '1px solid ' + C.line, background: '#f9fafb',
  color: C.ink, fontSize: 14, padding: '11px 14px', borderRadius: 10,
  outline: 'none', fontFamily: font.body, boxSizing: 'border-box',
};

function PasswordInput({ value, onChange, show, onToggle, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...inp, paddingRight: 44 }} autoComplete="new-password" />
      <button className="df-ghost" onClick={onToggle} tabIndex={-1} title={show ? 'Hide password' : 'Show password'}
        style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: C.mut, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name={show ? 'eyeOff' : 'eye'} size={18} sw={1.8} />
      </button>
    </div>
  );
}

function NavRow({ step, onBack, onNext, nextLabel = 'Continue', disabled = false }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
      {step > 0 && (
        <button onClick={onBack} style={{ flex: '0 0 auto', border: '1px solid ' + C.line, background: C.surf, color: C.ink2, fontSize: 14, fontWeight: 600, padding: '12px 18px', borderRadius: 12, cursor: 'pointer', fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="chevL" size={15} sw={2} />
        </button>
      )}
      <button onClick={onNext} disabled={disabled} style={{ flex: 1, border: 'none', background: disabled ? C.line : 'linear-gradient(135deg,#2a6fdb,#6557d1)', color: disabled ? C.mut : '#fff', fontSize: 14.5, fontWeight: 700, padding: '13px', borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: disabled ? 'none' : '0 10px 24px -8px rgba(42,111,219,.55)', fontFamily: font.body, transition: 'all .2s' }}>
        {nextLabel}
      </button>
    </div>
  );
}

export default function Signup() {
  const { registerSchool, setAuthScreen, showToast } = useApp();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const logoInputRef = useRef(null);

  // Step 0 — account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1 — school identity
  const [schoolName, setSchoolName] = useState('');
  const [bizNumber, setBizNumber] = useState('');

  // Step 2 — contact
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3 — details
  const [logoPreview, setLogoPreview] = useState(null);
  const [cats, setCats] = useState(['B']);

  function toggleCat(c) {
    setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function finish() {
    if (busy) return;
    setError('');
    setBusy(true);
    const res = await registerSchool({
      name, email: email.trim(), password,
      school: { name: schoolName, bizNumber, address, city, phone, logo: logoPreview, cats },
    });
    setBusy(false);
    if (!res.ok) { setError(res.error || 'Sign up failed. Please try again.'); return; }
    if (res.confirm) {
      showToast('Check your email to confirm your account, then sign in.');
      setAuthScreen('login');
    }
    // otherwise the session is live and the app switches to the dashboard on its own
  }

  const passwordsMatch = password.length >= 6 && password === confirm;
  const canStep0 = name.trim() && email.trim() && passwordsMatch;
  const canStep1 = schoolName.trim() && bizNumber.trim();
  const canStep2 = address.trim() && city.trim() && phone.trim();
  const canStep3 = cats.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0e1219 0%,#141c2b 60%,#1a1f2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 22, padding: '36px 36px 32px', boxShadow: '0 40px 80px -20px rgba(0,0,0,.55)' }}>
        <Logo />
        <StepBar step={step} />

        {step === 0 && (
          <>
            <div style={{ fontFamily: font.disp, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Create your account</div>
            <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 22 }}>Your personal login credentials</div>
            <Field label="Full name"><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp} /></Field>
            <Field label="Email"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@autoshkolla.com" style={inp} autoComplete="email" /></Field>
            <Field label="Password">
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} show={showPass} onToggle={() => setShowPass(s => !s)} placeholder="Min. 6 characters" />
            </Field>
            <Field label="Confirm password">
              <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} show={showConfirm} onToggle={() => setShowConfirm(s => !s)} placeholder="Re-enter password" />
            </Field>
            {confirm.length > 0 && password !== confirm && (
              <div style={{ fontSize: 12, color: C.red, marginTop: -6, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="alert" size={13} sw={2} /> Passwords do not match
              </div>
            )}
            <div style={{ height: 8 }} />
            <NavRow step={step} onBack={() => setStep(s => s - 1)} onNext={() => setStep(1)} disabled={!canStep0} />
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ fontFamily: font.disp, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Your driving school</div>
            <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 22 }}>Legal identity of the school</div>
            <Field label="School name"><input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Autoshkolla Prishtina" style={inp} /></Field>
            <Field label="Business registration number"><input value={bizNumber} onChange={e => setBizNumber(e.target.value)} placeholder="e.g. 811234567" style={inp} /></Field>
            <div style={{ height: 8 }} />
            <NavRow step={step} onBack={() => setStep(s => s - 1)} onNext={() => setStep(2)} disabled={!canStep1} />
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontFamily: font.disp, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Contact & location</div>
            <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 22 }}>Where your students can find you</div>
            <Field label="Street address"><input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Rr. Nëna Terezë 12" style={inp} /></Field>
            <Field label="City">
              <select value={city} onChange={e => setCity(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer', fontWeight: city ? 600 : 400, color: city ? C.ink : C.mut }}>
                <option value="">Select a city…</option>
                {KOSOVO_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Phone number"><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+383 44 000 000" style={inp} /></Field>
            <div style={{ height: 8 }} />
            <NavRow step={step} onBack={() => setStep(s => s - 1)} onNext={() => setStep(3)} disabled={!canStep2} />
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontFamily: font.disp, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Logo & categories</div>
            <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 22 }}>Finishing touches</div>

            <Field label="School logo">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div onClick={() => logoInputRef.current.click()} style={{ width: 64, height: 64, borderRadius: 14, border: '2px dashed ' + (logoPreview ? C.pri : C.line), background: logoPreview ? 'transparent' : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, color: C.mut }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Icon name="plus" size={22} sw={1.8} />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink2 }}>Upload logo</div>
                  <div style={{ fontSize: 11.5, color: C.mut, marginTop: 2 }}>PNG or JPG, shown in sidebar</div>
                  <button onClick={() => logoInputRef.current.click()} style={{ marginTop: 6, border: '1px solid ' + C.line, background: C.surf, color: C.ink2, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: font.body }}>
                    {logoPreview ? 'Change' : 'Choose file'}
                  </button>
                </div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
            </Field>

            <Field label="License categories offered">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                {CATS.map(c => {
                  const on = cats.includes(c);
                  return (
                    <button key={c} onClick={() => toggleCat(c)} style={{ border: '1.5px solid ' + (on ? C.pri : C.line), background: on ? C.priBg : '#fafafa', color: on ? C.pri : C.ink2, fontSize: 13, fontWeight: 700, padding: '7px 13px', borderRadius: 9, cursor: 'pointer', transition: 'all .14s', fontFamily: font.body }}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            {error && (
              <div style={{ fontSize: 12.5, color: C.red, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="alert" size={14} sw={2} /> {error}
              </div>
            )}
            <div style={{ height: 8 }} />
            <NavRow step={step} onBack={() => setStep(s => s - 1)} onNext={finish} nextLabel={busy ? 'Creating your school…' : 'Launch DriveFlow'} disabled={!canStep3 || busy} />
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: 13, color: C.mut, marginTop: 20 }}>
          Already have an account?{' '}
          <button onClick={() => setAuthScreen('login')} style={{ border: 'none', background: 'none', color: C.pri, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: font.body }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
