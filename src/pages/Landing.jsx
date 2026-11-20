import React, { useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../AppContext.jsx';
import { Button, LinkButton, Badge, Icon, Logo, LogoMark, Ring, Dialog, Select, Empty, ToneIcon } from '../components/ui.jsx';
import { LangToggle } from '../components/Shell.jsx';
import { EnrollDialog } from './SchoolPage.jsx';
import { KOSOVO_CITIES } from '../data/cities.js';
import { euro } from '../lib/format.js';
import { BRAND, PLANS, SHOW_PRICES, APK_URL, CONTACT } from '../lib/brand.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

const native = Capacitor.isNativePlatform();
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function DemoPicker({ onClose }) {
  const { T, startDemo } = useApp();
  const opts = [['owner', 'monitor', 'demo_role_owner', 'brand'], ['instructor', 'instructors', 'demo_role_instructor', 'violet'], ['student', 'smartphone', 'demo_role_student', 'teal']];
  return (
    <Dialog title={T('try_demo')} onClose={onClose}>
      <p className="muted" style={{ marginBottom: 14 }}>{T('demo_pick_role')}</p>
      <div className="stack" style={{ gap: 10 }}>
        {opts.map(([r, ic, k, tone]) => (
          <button key={r} className="row-item card card-hover" style={{ borderRadius: 14, border: '1px solid var(--line)', padding: '14px 16px' }} onClick={() => startDemo(r)}>
            <ToneIcon name={ic} tone={tone} size={40} />
            <span style={{ fontWeight: 650, fontSize: 15, flex: 1 }}>{T(k)}</span>
            <Icon name="arrowR" size={18} style={{ color: 'var(--soft)' }} />
          </button>
        ))}
      </div>
    </Dialog>
  );
}

export function SiteNav() {
  const { T, navigate, isLoggedIn, view } = useApp();
  const mobile = useIsMobile(860);
  const [demo, setDemo] = useState(false);
  const onLanding = view.screen === 'landing';
  const sec = (id) => onLanding ? scrollTo(id) : (navigate({ screen: 'landing' }), setTimeout(() => scrollTo(id), 80));
  return (
    <header className="site-nav">
      <div className="site-wrap site-nav-inner">
        <button onClick={() => { navigate({ screen: 'landing' }); document.querySelector('.screen-scroll')?.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ border: 0, background: 'none', padding: 0 }}>
          <Logo size={34} />
        </button>
        {!mobile && (
          <nav className="row" style={{ gap: 22, marginLeft: 12 }}>
            <button className="site-link" onClick={() => sec('schools')}>{T('nav_schools')}</button>
            {!native && <button className="site-link" onClick={() => sec('owners')}>{T('nav_owners')}</button>}
            {!native && <button className="site-link" onClick={() => sec('app')}>{T('nav_app')}</button>}
          </nav>
        )}
        <span className="spacer" />
        {!mobile && <LangToggle />}
        {isLoggedIn ? (
          <Button variant="primary" icon="dashboard" onClick={() => navigate({ screen: 'app', route: 'dashboard' })}>{BRAND}</Button>
        ) : (
          <>
            {!mobile && !native && <Button variant="ghost" icon="sparkle" onClick={() => setDemo(true)}>{T('try_demo')}</Button>}
            <Button variant={mobile ? 'primary' : 'secondary'} onClick={() => navigate({ screen: 'login' })}>{T('sign_in')}</Button>
            {!mobile && <Button variant="primary" onClick={() => navigate({ screen: 'signup' })}>{T('register_school')}</Button>}
          </>
        )}
        {mobile && <LangToggle />}
      </div>
      {demo && <DemoPicker onClose={() => setDemo(false)} />}
    </header>
  );
}

export function SiteFooter() {
  const { T, navigate } = useApp();
  return (
    <footer className="site-foot">
      <div className="site-wrap row" style={{ justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <Logo size={30} />
          <div className="muted" style={{ marginTop: 8, fontSize: 13.5 }}>{T('footer_tagline')}</div>
        </div>
        <div className="row muted" style={{ gap: 18, fontSize: 13.5, flexWrap: 'wrap' }}>
          <button className="site-link" onClick={() => navigate({ screen: 'privacy' })}>{T('privacy')}</button>
          {CONTACT.email && <a href={'mailto:' + CONTACT.email} className="site-link">{CONTACT.email}</a>}
          {CONTACT.phone && <a href={'tel:' + CONTACT.phone} className="site-link">{CONTACT.phone}</a>}
          <span>© {new Date().getFullYear()} {BRAND}. {T('rights')}</span>
        </div>
      </div>
    </footer>
  );
}

/* A small, honest preview of the student app, drawn in HTML. */
function PhonePreview() {
  const { T, lang } = useApp();
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-screen">
        <div style={{ padding: '30px 16px 0' }}>
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{T('greet_morning')},</div>
          <div style={{ fontWeight: 800, fontSize: 21, letterSpacing: '-.03em' }}>Rina</div>
          <div style={{ marginTop: 12, borderRadius: 16, padding: 14, color: '#fff', background: 'linear-gradient(150deg, #2f63f5, #1c47c7)' }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}>
              <span>{T('next_lesson')}</span><span className="mono" style={{ background: 'rgba(255,255,255,.2)', padding: '2px 7px', borderRadius: 6 }}>10:00</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, marginTop: 8 }}>{lang === 'sq' ? 'Nesër, e martë' : 'Tomorrow, Tuesday'}</div>
            <div className="row" style={{ gap: 10, fontSize: 11.5, marginTop: 6, opacity: .9 }}><span className="row" style={{ gap: 4 }}><Icon name="user" size={12} />Vlora B.</span><span className="row" style={{ gap: 4 }}><Icon name="car" size={12} />Opel Astra</span></div>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 12 }}>
            <div className="card" style={{ flex: 1, padding: 12, textAlign: 'center' }}>
              <div style={{ display: 'inline-block' }}><Ring pct={63} size={70} stroke={7}><div style={{ fontWeight: 800, fontSize: 17 }}>11</div><div className="muted" style={{ fontSize: 8.5, fontWeight: 600 }}>{T('remaining')}</div></Ring></div>
              <div style={{ fontSize: 11, fontWeight: 650, marginTop: 4 }}>{T('package')}</div>
            </div>
            <div className="card" style={{ flex: 1, padding: 12 }}>
              <div className="muted" style={{ fontSize: 10.5, fontWeight: 600 }}>{T('readiness')}</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--green)' }}>78%</div>
              <div className="progress" style={{ height: 5, marginTop: 4 }}><span style={{ width: '78%', background: 'var(--green)' }} /></div>
              <Badge tone="green" style={{ marginTop: 8, fontSize: 9.5 }}>{T('exam_ready')}</Badge>
            </div>
          </div>
          <div className="card" style={{ marginTop: 12, padding: 12 }}>
            <div className="muted" style={{ fontSize: 10.5, fontWeight: 600 }}>{T('balance_after')}</div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontWeight: 800, fontSize: 18 }}>180 €</span><Badge tone="amber" style={{ fontSize: 10 }}>{T('partial')}</Badge></div>
          </div>
        </div>
        <div className="row" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid var(--line)', padding: '8px 0 12px' }}>
          {[['dashboard', T('home')], ['calendar', T('schedule')], ['courses', T('courses')], ['payments', T('payments')]].map(([ic, l], k) => (
            <div key={ic} style={{ flex: 1, textAlign: 'center', color: k === 0 ? 'var(--brand)' : 'var(--soft)', fontSize: 9.5, fontWeight: 600 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name={ic} size={18} /></div>{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SchoolCard({ s, onEnroll }) {
  const { T, navigate } = useApp();
  const minPrice = s.packages?.length ? Math.min(...s.packages.map(p => p.price)) : null;
  return (
    <div className="school-card card-hover" onClick={() => navigate({ screen: 'school', schoolId: s.id })}>
      <div className="row" style={{ gap: 12 }}>
        <LogoMark size={46} logo={s.logo} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="truncate" style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
          <div className="row muted" style={{ gap: 4, fontSize: 13 }}><Icon name="pin" size={14} />{s.city || '—'}</div>
        </div>
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {(s.cats || []).map(c => <Badge key={c} tone="brand">{c}</Badge>)}
        {minPrice != null && <Badge tone="gray">{T('price_from', { v: euro(minPrice) })}</Badge>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', background: 'var(--surface-2)', borderRadius: 12, padding: '9px 0' }}>
        {[[s.students, T('stat_students')], [s.instructors, T('stat_instructors')], [s.vehicles, T('stat_vehicles')]].map(([v, l]) => (
          <div key={l}><div style={{ fontWeight: 750 }}>{v ?? '—'}</div><div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{l}</div></div>
        ))}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <Button variant="secondary" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); navigate({ screen: 'school', schoolId: s.id }); }}>{T('details')}</Button>
        {s.acceptEnrollments && <Button variant="primary" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); onEnroll(s); }}>{T('enroll')}</Button>}
      </div>
    </div>
  );
}

export default function Landing() {
  const { T, publicSchools, directoryLoaded, navigate } = useApp();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('all');
  const [cat, setCat] = useState('all');
  const [enrolling, setEnrolling] = useState(null);
  const [demo, setDemo] = useState(false);

  const cats = useMemo(() => [...new Set(publicSchools.flatMap(s => s.cats || []))].sort(), [publicSchools]);
  const cities = useMemo(() => [...new Set([...publicSchools.map(s => s.city).filter(Boolean)])].sort((a, b) => KOSOVO_CITIES.indexOf(a) - KOSOVO_CITIES.indexOf(b)), [publicSchools]);
  const qq = q.trim().toLowerCase();
  const list = publicSchools.filter(s => (!qq || s.name.toLowerCase().includes(qq) || (s.city || '').toLowerCase().includes(qq))
    && (city === 'all' || s.city === city) && (cat === 'all' || (s.cats || []).includes(cat)));

  const features = [
    ['calendar', 'f_calendar', 'brand'], ['euro', 'f_payments', 'green'], ['smartphone', 'f_instructor', 'violet'],
    ['globe', 'f_enroll', 'teal'], ['courses', 'f_theory', 'amber'], ['reports', 'f_reports', 'brand'],
  ];

  return (
    <div className="site">
      <SiteNav />

      {/* hero */}
      <section className="hero">
        <div className="site-wrap"><div className="hero-grid">
          <div>
            <span className="eyebrow"><Icon name="pin" size={14} sw={2.2} />{T('hero_eyebrow')}</span>
            <h1 style={{ marginTop: 18 }}>{T('hero_title')}</h1>
            <p className="hero-lead">{T('hero_lead')}</p>
            <div className="search-panel">
              <div className="input-icon has-left" style={{ flex: 1.4 }}>
                <span className="ic"><Icon name="search" size={18} sw={2} /></span>
                <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder={T('search_schools')} onKeyDown={e => e.key === 'Enter' && scrollTo('schools')} />
              </div>
              <div className="divider" />
              <Select value={city} onChange={e => setCity(e.target.value)} style={{ flex: 1 }} options={[{ v: 'all', l: T('all_cities') }, ...cities.map(c => ({ v: c, l: c }))]} />
              <Button variant="primary" size="lg" icon="search" onClick={() => scrollTo('schools')}>{T('find')}</Button>
            </div>
            <div className="row" style={{ gap: 18, marginTop: 22, flexWrap: 'wrap' }}>
              {!native && <button className="btn-link row" style={{ gap: 6 }} onClick={() => navigate({ screen: 'signup' })}><Icon name="building" size={17} />{T('register_school')}</button>}
              <button className="btn-link row" style={{ gap: 6 }} onClick={() => setDemo(true)}><Icon name="sparkle" size={17} />{T('try_demo')}</button>
            </div>
          </div>
          <PhonePreview />
        </div></div>
      </section>

      {/* directory */}
      <section className="section section-alt" id="schools">
        <div className="site-wrap">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
            <div className="section-head" style={{ marginBottom: 0 }}>
              <h2>{T('directory_title')}</h2>
              <p>{T('directory_sub', { n: publicSchools.length })}</p>
            </div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <div className="input-icon has-left" style={{ width: 220 }}><span className="ic"><Icon name="search" size={16} /></span><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder={T('search_schools')} /></div>
              <Select value={city} onChange={e => setCity(e.target.value)} style={{ width: 'auto' }} options={[{ v: 'all', l: T('all_cities') }, ...cities.map(c => ({ v: c, l: c }))]} />
              <Select value={cat} onChange={e => setCat(e.target.value)} style={{ width: 'auto' }} options={[{ v: 'all', l: T('all_cats') }, ...cats.map(c => ({ v: c, l: T('category') + ' ' + c }))]} />
            </div>
          </div>
          {!directoryLoaded ? <div className="spinner dark" style={{ margin: '40px auto' }} /> : list.length ? (
            <div className="grid-auto">{list.map(s => <SchoolCard key={s.id} s={s} onEnroll={setEnrolling} />)}</div>
          ) : <div className="card"><Empty icon="search" title={T('directory_empty')} /></div>}
        </div>
      </section>

      {/* for owners */}
      <section className="section section-dark" id="owners">
        <div className="site-wrap">
          <div className="section-head">
            <span className="eyebrow" style={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.14)', color: '#c7d6ff' }}>{T('owners_eyebrow')}</span>
            <h2 style={{ marginTop: 14 }}>{T('owners_title')}</h2>
            <p>{T('owners_lead')}</p>
          </div>
          <div className="grid-3">
            {features.map(([ic, k, tone]) => (
              <div key={k} className="feature">
                <ToneIcon name={ic} tone={tone} size={42} />
                <h3>{T(k + '_t')}</h3>
                <p>{T(k + '_d')}</p>
              </div>
            ))}
          </div>
          {!native && (
            <div className="row" style={{ gap: 10, marginTop: 30, flexWrap: 'wrap' }}>
              <Button variant="accent" size="lg" icon="building" onClick={() => navigate({ screen: 'signup' })}>{T('register_school')}</Button>
              <Button size="lg" icon="sparkle" onClick={() => setDemo(true)} style={{ background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>{T('try_demo')}</Button>
            </div>
          )}
        </div>
      </section>

      {!native && (
        <>
          {/* how it works */}
          <section className="section">
            <div className="site-wrap">
              <div className="section-head"><h2>{T('how_title')}</h2></div>
              <div className="grid-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="feature">
                    <span className="step-num">{n}</span>
                    <h3>{T(`how_${n}_t`)}</h3>
                    <p>{T(`how_${n}_d`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* pricing */}
          <section className="section section-alt" id="pricing">
            <div className="site-wrap">
              <div className="section-head"><h2>{T('pricing_title')}</h2><p>{T('pricing_sub')}</p></div>
              <div className="grid-3" style={{ paddingTop: 10 }}>
                {PLANS.map(p => (
                  <div key={p.id} className="card" style={{ padding: 22, position: 'relative', borderColor: p.popular ? 'var(--brand)' : undefined, boxShadow: p.popular ? '0 0 0 1px var(--brand), var(--shadow)' : undefined }}>
                    {p.popular && <div style={{ position: 'absolute', top: -11, left: 20 }}><Badge style={{ background: 'var(--accent)', color: '#1f1300' }}>{T('popular')}</Badge></div>}
                    <div style={{ fontWeight: 750, fontSize: 18 }}>{p.id}</div>
                    <div className="muted" style={{ fontWeight: 600 }}>{T('plan_instr', { n: p.instructors })}</div>
                    <div style={{ margin: '16px 0 6px' }}>
                      {SHOW_PRICES
                        ? <><span style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.04em' }}>{euro(p.monthly)}</span> <span className="muted">{T('per_month')}</span></>
                        : <span style={{ fontSize: 20, fontWeight: 750 }}>{T('price_on_request')}</span>}
                    </div>
                    {SHOW_PRICES && <div className="muted" style={{ fontSize: 13 }}>{p.setup ? T('setup_fee', { v: euro(p.setup) }) : T('setup_free')}</div>}
                  </div>
                ))}
              </div>
              <div className="grid-main" style={{ marginTop: 18 }}>
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12 }}>{T('all_plans_include')}</div>
                  <div className="grid-2" style={{ gap: 10 }}>
                    {[1, 2, 3, 4, 5].map(n => <div key={n} className="row" style={{ gap: 8, alignItems: 'flex-start' }}><Icon name="checkCircle" size={18} style={{ color: 'var(--green)' }} />{T('inc_' + n)}</div>)}
                  </div>
                </div>
                <div className="card" style={{ padding: 22, background: 'var(--accent-50)', borderColor: '#f7dca5' }}>
                  <Badge tone="accent">{T('pilot_badge')}</Badge>
                  <div style={{ fontWeight: 800, fontSize: 19, marginTop: 10, letterSpacing: '-.02em' }}>{T('pilot_title')}</div>
                  <p className="muted" style={{ marginTop: 6, lineHeight: 1.55 }}>{T('pilot_text')}</p>
                  <Button variant="primary" icon="arrowR" style={{ marginTop: 14 }} onClick={() => navigate({ screen: 'signup' })}>{T('pilot_cta')}</Button>
                </div>
              </div>
            </div>
          </section>

          {/* app */}
          <section className="section" id="app">
            <div className="site-wrap row" style={{ gap: 40, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 340px' }}>
                <div className="section-head" style={{ marginBottom: 20 }}><h2>{T('app_title')}</h2><p>{T('app_text')}</p></div>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <LinkButton href={APK_URL} variant="primary" size="lg" icon="download" download>{T('download_android')}</LinkButton>
                  <Button size="lg" icon="globe" onClick={() => navigate({ screen: 'login' })}>{T('open_web_app')}</Button>
                </div>
              </div>
              <div className="row" style={{ gap: 14, flex: '1 1 300px', justifyContent: 'center' }}>
                {[['smartphone', 'role_instructor', 'violet'], ['user', 'role_student', 'teal'], ['monitor', 'owner', 'brand']].map(([ic, k, tone]) => (
                  <div key={k} className="feature" style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ display: 'inline-flex' }}><ToneIcon name={ic} tone={tone} size={46} /></div>
                    <h3>{T(k)}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <SiteFooter />
      {enrolling && <EnrollDialog school={enrolling} onClose={() => setEnrolling(null)} />}
      {demo && <DemoPicker onClose={() => setDemo(false)} />}
    </div>
  );
}
