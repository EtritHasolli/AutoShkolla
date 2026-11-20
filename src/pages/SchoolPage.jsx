import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Dialog, Field, Input, Select, PasswordInput, Button, LinkButton, Badge, Icon, LogoMark, Empty, Card } from '../components/ui.jsx';
import { PackageCard } from './Packages.jsx';
import { SiteNav, SiteFooter } from './Landing.jsx';
import { euro, telLink, whatsappLink, DAY_KEYS, dayShort } from '../lib/format.js';
import { BRAND } from '../lib/brand.js';

/* Enrollment: creates the student account inside the chosen school. */
export function EnrollDialog({ school, onClose }) {
  const { T, enrollStudent, showToast, navigate } = useApp();
  const [f, setF] = useState({ name: '', email: '', phone: '', cat: school.cats?.[0] || 'B', password: '', consent: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (p) => setF(prev => ({ ...prev, ...p }));

  async function submit() {
    setError('');
    if (!f.name.trim() || !f.email.trim()) return setError(T('err_name_email'));
    if (f.password.length < 6) return setError(T('err_password_short'));
    if (!f.consent) return setError(T('consent_required'));
    setBusy(true);
    const res = await enrollStudent({ name: f.name.trim(), email: f.email.trim(), password: f.password, schoolId: school.id, phone: f.phone, cat: f.cat });
    setBusy(false);
    if (!res.ok) return setError(res.error || T('err_generic'));
    if (res.confirm) { showToast(T('check_email')); onClose(); navigate({ screen: 'login' }); }
  }

  return (
    <Dialog title={T('enroll_at', { name: school.name })} onClose={onClose} footer={
      <Button variant="primary" block size="lg" loading={busy} onClick={submit}>{T('enroll')}</Button>
    }>
      <p className="muted" style={{ marginBottom: 16 }}>{T('enroll_sub')}</p>
      <Field label={T('full_name')}><Input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="Emri Mbiemri" autoComplete="name" /></Field>
      <Field label={T('email')}><Input type="email" value={f.email} onChange={e => set({ email: e.target.value })} placeholder="ju@email.com" autoComplete="email" /></Field>
      <div className="form-row">
        <Field label={T('phone')}><Input type="tel" value={f.phone} onChange={e => set({ phone: e.target.value })} placeholder="+383 44 …" autoComplete="tel" /></Field>
        <Field label={T('category')}><Select value={f.cat} onChange={e => set({ cat: e.target.value })} options={(school.cats?.length ? school.cats : ['B']).map(c => ({ v: c, l: c }))} /></Field>
      </div>
      <Field label={T('password')} hint={T('min6')}><PasswordInput value={f.password} onChange={e => set({ password: e.target.value })} autoComplete="new-password" /></Field>
      <label className="check" style={{ marginTop: 4 }}>
        <input type="checkbox" checked={f.consent} onChange={e => set({ consent: e.target.checked })} />
        <span>{T('consent', { school: school.name, brand: BRAND })} <a href="#/privacy" target="_blank" rel="noopener">{T('privacy_policy')}</a>.</span>
      </label>
      {error && <div className="field-error" style={{ marginTop: 12 }}><Icon name="alert" size={14} sw={2} />{error}</div>}
    </Dialog>
  );
}

export default function SchoolPage() {
  const { view, publicSchools, directoryLoaded, T, lang, navigate } = useApp();
  const s = publicSchools.find(x => String(x.id) === String(view.schoolId));
  const [enrolling, setEnrolling] = useState(false);

  if (!s) {
    return (
      <div className="site">
        <SiteNav />
        <div className="site-wrap" style={{ padding: '60px 24px' }}>
          {directoryLoaded ? <Card><Empty icon="building" title={T('no_match')} action={<Button onClick={() => navigate({ screen: 'landing' })}>{T('back_to_list')}</Button>} /></Card> : <div className="spinner dark" style={{ margin: '0 auto' }} />}
        </div>
      </div>
    );
  }

  const minPrice = s.packages?.length ? Math.min(...s.packages.map(p => p.price)) : null;
  const enrollBtn = s.acceptEnrollments
    ? <Button variant="primary" size="lg" icon="user" onClick={() => setEnrolling(true)}>{T('enroll')}</Button>
    : null;

  return (
    <div className="site">
      <SiteNav />
      <div className="hero" style={{ borderBottom: '1px solid var(--line-2)' }}>
        <div className="site-wrap" style={{ padding: '24px 24px 36px' }}>
          <Button variant="ghost" size="sm" icon="chevL" onClick={() => navigate({ screen: 'landing' })} style={{ marginLeft: -8, marginBottom: 16 }}>{T('back_to_list')}</Button>
          <div className="row" style={{ gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <LogoMark size={72} logo={s.logo} />
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.035em' }}>{s.name}</h1>
              <div className="row muted" style={{ gap: 6, marginTop: 6, fontSize: 15 }}><Icon name="pin" size={16} />{[s.address, s.city].filter(Boolean).join(', ')}</div>
              <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {(s.cats || []).map(c => <Badge key={c} tone="brand">{T('category')} {c}</Badge>)}
                {minPrice != null && <Badge tone="accent">{T('price_from', { v: euro(minPrice) })}</Badge>}
              </div>
            </div>
            {enrollBtn}
          </div>
        </div>
      </div>

      <div className="site-wrap" style={{ padding: '32px 24px 64px' }}>
        {!s.acceptEnrollments && (
          <div className="badge tone-amber" style={{ display: 'flex', borderRadius: 12, padding: '12px 14px', marginBottom: 24, whiteSpace: 'normal', fontSize: 13.5 }}><Icon name="info" size={17} />{T('enroll_closed')}</div>
        )}
        <div className="grid-main">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>{T('packages_prices')}</h2>
            {!s.packages?.length && (
              <Card><Empty icon="packages" title={T('packages_contact')} action={s.phone && <LinkButton href={telLink(s.phone)} icon="phone">{T('call')}</LinkButton>} /></Card>
            )}
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', paddingTop: 10 }}>
              {(s.packages || []).map(p => (
                <PackageCard key={p.id} p={p} T={T}>
                  {s.acceptEnrollments && <Button variant={p.popular ? 'primary' : 'soft'} block style={{ marginTop: 18 }} onClick={() => setEnrolling(true)}>{T('enroll')}</Button>}
                </PackageCard>
              ))}
            </div>
          </div>
          <div className="stack">
            {(s.phone || s.address || s.mapsUrl) && <Card title={T('contact_location')}>
              {s.phone && <div className="row" style={{ gap: 10, marginBottom: 12 }}><Icon name="phone" size={17} style={{ color: 'var(--muted)' }} /><span style={{ fontWeight: 600 }}>{s.phone}</span></div>}
              {s.address && <div className="row" style={{ gap: 10, marginBottom: 12, alignItems: 'flex-start' }}><Icon name="pin" size={17} style={{ color: 'var(--muted)' }} /><span>{s.address}, {s.city}</span></div>}
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {s.phone && <LinkButton size="sm" href={telLink(s.phone)} icon="phone">{T('call')}</LinkButton>}
                {s.phone && <LinkButton size="sm" variant="whatsapp" href={whatsappLink(s.phone)} icon="whatsapp">WhatsApp</LinkButton>}
                {s.mapsUrl && <LinkButton size="sm" href={s.mapsUrl} icon="map">{T('view_on_map')}</LinkButton>}
              </div>
            </Card>}
            <Card title={T('working_hours')}>
              <div className="row" style={{ gap: 8, marginBottom: 12 }}><Icon name="clock" size={17} style={{ color: 'var(--muted)' }} /><span className="mono" style={{ fontWeight: 650 }}>{s.hoursStart} – {s.hoursEnd}</span></div>
              <div className="row" style={{ gap: 5, flexWrap: 'wrap' }}>
                {DAY_KEYS.map((d, i) => <Badge key={d} tone={(s.workingDays || []).includes(d) ? 'brand' : 'gray'}>{dayShort(i, lang)}</Badge>)}
              </div>
            </Card>
            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center', padding: '14px 0' }}>
              {[[s.students, T('stat_students')], [s.instructors, T('stat_instructors')], [s.vehicles, T('stat_vehicles')]].map(([v, l]) => (
                <div key={l}><div style={{ fontWeight: 800, fontSize: 20 }}>{v ?? '—'}</div><div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
      {enrolling && <EnrollDialog school={s} onClose={() => setEnrolling(false)} />}
    </div>
  );
}
