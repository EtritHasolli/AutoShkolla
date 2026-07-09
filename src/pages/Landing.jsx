import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { KOSOVO_CITIES } from '../data/cities.js';

const inp = {
  width: '100%', border: '1px solid ' + C.line, background: '#f9fafb',
  color: C.ink, fontSize: 14, padding: '11px 14px', borderRadius: 10,
  outline: 'none', fontFamily: font.body, boxSizing: 'border-box',
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

/* Enrollment modal — creates the student account in the chosen school */
function EnrollModal({ school, onClose }) {
  const { enrollStudent, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cat, setCat] = useState(school.cats?.[0] || 'B');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError('');
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    const res = await enrollStudent({ name: name.trim(), email: email.trim(), password, schoolId: school.id, phone, cat });
    setBusy(false);
    if (!res.ok) { setError(res.error || 'Enrollment failed.'); return; }
    if (res.confirm) {
      showToast('Check your email to confirm your account, then sign in.');
      onClose();
    }
    // with an active session the app switches to the student dashboard on its own
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,24,.55)', backdropFilter: 'blur(3px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'df-fade .18s' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 430, background: '#fff', borderRadius: 18, padding: '28px 28px 24px', boxShadow: '0 40px 100px -30px rgba(10,20,40,.6)', maxHeight: '92%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontFamily: font.disp, fontSize: 19, fontWeight: 700, color: C.ink }}>Enroll at {school.name}</div>
          <button onClick={onClose} style={{ border: 'none', background: C.bg, color: C.mut, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="x" size={18} sw={2} />
          </button>
        </div>
        <div style={{ fontSize: 13, color: C.mut, marginBottom: 20 }}>{school.city} · Create your student account</div>

        <Field label="Full name"><input value={name} onChange={e => setName(e.target.value)} placeholder="Emri Mbiemri" style={inp} /></Field>
        <Field label="Email"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inp} autoComplete="email" /></Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Phone"><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+383 4…" style={inp} /></Field></div>
          <div style={{ flex: 1 }}>
            <Field label="Licence category">
              <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {(school.cats?.length ? school.cats : ['B']).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <Field label="Password"><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inp} autoComplete="new-password" /></Field>

        {error && (
          <div style={{ fontSize: 12.5, color: C.red, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="alert" size={14} sw={2} /> {error}
          </div>
        )}

        <button onClick={submit} disabled={busy} style={{
          width: '100%', border: 'none', background: busy ? C.line : 'linear-gradient(135deg,#2a6fdb,#6557d1)',
          color: busy ? C.mut : '#fff', fontSize: 14.5, fontWeight: 700, padding: '13px', borderRadius: 12,
          cursor: busy ? 'wait' : 'pointer', fontFamily: font.body, marginTop: 4,
        }}>
          {busy ? 'Enrolling…' : 'Enroll now'}
        </button>
      </div>
    </div>
  );
}

function SchoolCard({ s, onEnroll }) {
  return (
    <div style={{ background: '#fff', border: '1px solid ' + C.line, borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, transition: 'transform .15s, box-shadow .15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px -18px rgba(10,20,40,.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {s.logo ? <img src={s.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="car2" size={24} sw={1.9} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: font.disp, fontSize: 16.5, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
          <div style={{ fontSize: 12.5, color: C.mut, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <Icon name="pin" size={13} sw={2} />{s.city}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(s.cats || []).map(c => (
          <span key={c} style={{ fontSize: 11.5, fontWeight: 700, color: C.pri, background: C.priBg, padding: '3px 9px', borderRadius: 7 }}>{c}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', background: C.bg, borderRadius: 12, padding: '10px 0' }}>
        {[[s.students, 'Students'], [s.instructors, 'Instructors'], [s.vehicles, 'Vehicles']].map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: font.disp, fontSize: 16, fontWeight: 700, color: C.ink }}>{v}</div>
            <div style={{ fontSize: 10.5, color: C.mut, fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>

      <button onClick={() => onEnroll(s)} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '11px', borderRadius: 10, cursor: 'pointer', fontFamily: font.body }}>
        Enroll
      </button>
    </div>
  );
}

export default function Landing() {
  const { publicSchools, setAuthScreen } = useApp();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('all');
  const [cat, setCat] = useState('all');
  const [enrolling, setEnrolling] = useState(null);

  const cats = useMemo(() => [...new Set(publicSchools.flatMap(s => s.cats || []))].sort(), [publicSchools]);

  const filtered = publicSchools.filter(s => {
    const mq = !q || s.name.toLowerCase().includes(q.toLowerCase()) || (s.city || '').toLowerCase().includes(q.toLowerCase());
    const mc = city === 'all' || s.city === city;
    const mk = cat === 'all' || (s.cats || []).includes(cat);
    return mq && mc && mk;
  });

  const selStyle = { border: '1px solid ' + C.line, background: '#fff', color: C.ink, fontSize: 13.5, padding: '10px 13px', borderRadius: 10, outline: 'none', fontFamily: font.body, fontWeight: 600, cursor: 'pointer', appearance: 'auto' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.body }}>
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg,#0e1219 0%,#141c2b 60%,#1a1f2e 100%)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '18px 0', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Icon name="car2" size={22} sw={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontFamily: font.disp, fontWeight: 700, fontSize: 19, letterSpacing: '-.02em' }}>DriveFlow</div>
              <div style={{ color: '#8d97a8', fontSize: 11, fontWeight: 600, marginTop: -2 }}>Autoshkolla OS</div>
            </div>
            <button onClick={() => setAuthScreen('login')} style={{ border: '1px solid rgba(255,255,255,.18)', background: 'transparent', color: '#fff', fontSize: 13.5, fontWeight: 600, padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: font.body }}>
              Sign in
            </button>
            <button onClick={() => setAuthScreen('signup')} style={{ border: 'none', background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: font.body, boxShadow: '0 8px 20px -8px rgba(42,111,219,.6)' }}>
              Register your school
            </button>
          </div>

          {/* Hero */}
          <div style={{ padding: '38px 0 46px', maxWidth: 640 }}>
            <div style={{ fontFamily: font.disp, fontSize: 38, fontWeight: 700, color: '#fff', letterSpacing: '-.03em', lineHeight: 1.15 }}>
              Find your driving school in Kosovo
            </div>
            <div style={{ fontSize: 15.5, color: '#9aa3b1', marginTop: 12, lineHeight: 1.55 }}>
              Browse registered schools, compare instructors and fleets, and enroll online — your lessons, progress and payments all in one place.
            </div>
          </div>
        </div>
      </div>

      {/* Filters + directory */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 70px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: '#fff', border: '1px solid ' + C.line, borderRadius: 14, padding: '12px 14px', marginTop: -26, boxShadow: '0 14px 40px -20px rgba(10,20,40,.3)' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.mut, display: 'flex' }}><Icon name="search" size={16} sw={2} /></span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search schools…"
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid ' + C.line, background: C.bg, color: C.ink, fontSize: 13.5, padding: '10px 12px 10px 36px', borderRadius: 10, outline: 'none', fontFamily: font.body }} />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)} style={selStyle}>
            <option value="all">All cities</option>
            {KOSOVO_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={cat} onChange={e => setCat(e.target.value)} style={selStyle}>
            <option value="all">All categories</option>
            {cats.map(c => <option key={c} value={c}>Category {c}</option>)}
          </select>
          <div style={{ fontSize: 12.5, color: C.mut, fontWeight: 600, marginLeft: 'auto', paddingRight: 4 }}>
            {filtered.length} school{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18, marginTop: 26 }}>
          {filtered.map(s => <SchoolCard key={s.id} s={s} onEnroll={setEnrolling} />)}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.soft, fontSize: 14 }}>
            No schools match your filters yet.
          </div>
        )}
      </div>

      {enrolling && <EnrollModal school={enrolling} onClose={() => setEnrolling(null)} />}
    </div>
  );
}
