import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { C, font } from '../data/seed.js';

export default function Settings() {
  const { lang, setLang, school, updateSchoolProfile, role, T } = useApp();
  const [name, setName] = useState(school?.name || 'Autoshkolla Prishtina');
  const [phone, setPhone] = useState(school?.phone || '+383 38 224 100');
  const [city, setCity] = useState(school?.city || 'Prishtinë');
  const [address, setAddress] = useState(school?.address || 'Rr. Nëna Terezë 24');
  const [currency, setCurrency] = useState(school?.currency || 'EUR');
  const [workingHours, setWorkingHours] = useState(school?.workingHours || '08:00 – 18:00');
  const canEdit = ['owner', 'administrator'].includes(role);
  const CURRENCIES = [['EUR', 'EUR (€)'], ['USD', 'USD ($)'], ['GBP', 'GBP (£)'], ['CHF', 'CHF (Fr)']];

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
        {canEdit && (
          <button onClick={() => updateSchoolProfile({ name, phone, city, address, currency, workingHours })}
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
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Currency</span>
          {canEdit ? (
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inp, width: 'auto', padding: '7px 10px', fontWeight: 600, cursor: 'pointer' }}>
              {CURRENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ) : (
            <span style={{ fontSize: 13.5, color: C.mut, fontWeight: 600 }}>{CURRENCIES.find(c => c[0] === currency)?.[1] || currency}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Working hours</span>
          {canEdit ? (
            <input value={workingHours} onChange={e => setWorkingHours(e.target.value)} placeholder="08:00 – 18:00" style={{ ...inp, width: 160, fontFamily: font.mono, fontWeight: 600 }} />
          ) : (
            <span style={{ fontSize: 13.5, color: C.mut, fontWeight: 600, fontFamily: font.mono }}>{workingHours}</span>
          )}
        </div>
      </Card>
    </div>
  );
}
