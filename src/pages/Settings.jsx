import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { C, font } from '../data/seed.js';

const DEV_VIEWS = [['owner', 'Owner'], ['instructor', 'Instructor'], ['student', 'Student'], ['superadmin', 'Super admin']];

export default function Settings() {
  const { lang, setLang, school, updateSchoolProfile, role, T, isDevSuperadmin, devSwitchView } = useApp();
  const [name, setName] = useState(school?.name || 'Autoshkolla Prishtina');
  const [phone, setPhone] = useState(school?.phone || '+383 38 224 100');
  const [city, setCity] = useState(school?.city || 'Prishtinë');
  const [address, setAddress] = useState(school?.address || 'Rr. Nëna Terezë 24');
  const [mapsUrl, setMapsUrl] = useState(school?.mapsUrl || '');
  const [hoursStart, setHoursStart] = useState(school?.hoursStart || '08:00');
  const [hoursEnd, setHoursEnd] = useState(school?.hoursEnd || '18:00');
  const [workingDays, setWorkingDays] = useState(school?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const canEdit = ['owner', 'administrator'].includes(role);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const toggleDay = (d) => setWorkingDays(ds => ds.includes(d) ? ds.filter(x => x !== d) : [...ds, d]);

  function Card({ title, children }) {
    return (
      <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid ' + C.line2 }}>
          <div style={{ fontFamily: font.disp, fontWeight: 600, fontSize: 14.5, color: C.ink }}>{title}</div>
        </div>
        <div style={{ padding: '16px 18px' }}>{children}</div>
      </div>
    );
  }

  function Field({ label, children }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>{label}</div>
        {children}
      </div>
    );
  }

  const inp = { width: '100%', border: '1px solid ' + C.line, background: C.surf, color: C.ink, fontSize: 13.5, padding: '10px 12px', borderRadius: 9, outline: 'none' };

  return (
    <div style={{ padding: '22px 26px 40px', maxWidth: 680, animation: 'df-fade .25s' }}>
      <Card title="School profile">
        <Field label="School name"><input value={name} onChange={e => setName(e.target.value)} disabled={!canEdit} style={inp} /></Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label={T('phone')}><input value={phone} onChange={e => setPhone(e.target.value)} disabled={!canEdit} style={inp} /></Field></div>
          <div style={{ flex: 1 }}><Field label="City"><input value={city} onChange={e => setCity(e.target.value)} disabled={!canEdit} style={inp} /></Field></div>
        </div>
        <Field label="Address"><input value={address} onChange={e => setAddress(e.target.value)} disabled={!canEdit} style={inp} /></Field>
        <Field label="Google Maps link (optional)">
          <input value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} disabled={!canEdit} placeholder="https://maps.google.com/…" style={inp} />
        </Field>
        {canEdit && (
          <button onClick={() => updateSchoolProfile({ name, phone, city, address, mapsUrl, hoursStart, hoursEnd, workingDays })}
            style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 18px', borderRadius: 9, cursor: 'pointer' }}>
            {T('save')}
          </button>
        )}
      </Card>
      <Card title="Preferences">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid ' + C.line2, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Language</span>
          <div style={{ display: 'flex', gap: 4, background: C.bg, borderRadius: 8, padding: 3 }}>
            {[['en', 'EN'], ['sq', 'SQ']].map(([v, l]) => (
              <button key={v} onClick={() => setLang(v)} style={{ border: 'none', background: lang === v ? C.pri : 'transparent', color: lang === v ? '#fff' : C.mut, fontSize: 12.5, fontWeight: 600, padding: '6px 14px', borderRadius: 6 }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid ' + C.line2, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Working hours</span>
          {canEdit ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="time" value={hoursStart} onChange={e => setHoursStart(e.target.value)} style={{ ...inp, width: 120, fontFamily: font.mono, fontWeight: 600 }} />
              <span style={{ color: C.mut }}>–</span>
              <input type="time" value={hoursEnd} onChange={e => setHoursEnd(e.target.value)} style={{ ...inp, width: 120, fontFamily: font.mono, fontWeight: 600 }} />
            </div>
          ) : (
            <span style={{ fontSize: 13.5, color: C.mut, fontWeight: 600, fontFamily: font.mono }}>{hoursStart} – {hoursEnd}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Working days</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {DAYS.map(d => {
              const on = workingDays.includes(d);
              return (
                <button key={d} onClick={() => canEdit && toggleDay(d)} disabled={!canEdit}
                  style={{ border: 'none', background: on ? C.pri : C.bg, color: on ? '#fff' : C.mut, fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 7, cursor: canEdit ? 'pointer' : 'default' }}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
      {isDevSuperadmin && (
        <Card title="View as (testing)">
          <div style={{ fontSize: 12.5, color: C.mut, marginBottom: 12 }}>
            Only visible to the designated test account. Switches which portal/role you see — no data changes.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DEV_VIEWS.map(([v, label]) => (
              <button key={v} onClick={() => devSwitchView(v)}
                style={{ border: '1px solid ' + C.line, background: role === v ? C.pri : C.surf, color: role === v ? '#fff' : C.ink, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 9, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
