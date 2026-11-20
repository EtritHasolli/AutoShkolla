import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Button, Field, Input, Select, Switch, SettingRow, Badge, PageHeader, Choices, LinkButton } from '../components/ui.jsx';
import { LangToggle } from '../components/Shell.jsx';
import { KOSOVO_CITIES } from '../data/cities.js';
import { DAY_KEYS, dayShort } from '../lib/format.js';
import { PLANS, LICENCE_CATS } from '../lib/brand.js';

const DEV_VIEWS = [['owner', 'owner'], ['administrator', 'administrator'], ['receptionist', 'receptionist'], ['instructor', 'role_instructor'], ['student', 'role_student'], ['superadmin', 'superadmin']];

export default function Settings() {
  const { school, updateSchool, role, T, lang, isDevAccount, devSwitchView, exportCSV, live } = useApp();
  const canEdit = role === 'owner' || role === 'administrator';
  const [f, setF] = useState(() => ({
    name: school?.name || '', phone: school?.phone || '', city: school?.city || '', address: school?.address || '',
    mapsUrl: school?.mapsUrl || '', hoursStart: school?.hoursStart || '08:00', hoursEnd: school?.hoursEnd || '18:00',
    workingDays: school?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], cats: school?.cats || ['B'],
  }));
  const set = (p) => setF(prev => ({ ...prev, ...p }));
  const [busy, setBusy] = useState(false);
  const plan = PLANS.find(p => p.id === school?.plan);
  const cityOpts = [{ v: '', l: T('select_city') }, ...[...new Set([...KOSOVO_CITIES, f.city].filter(Boolean))].map(c => ({ v: c, l: c }))];

  async function save() { setBusy(true); await updateSchool(f); setBusy(false); }

  return (
    <div className="page page-narrow">
      <PageHeader title={T('settings')} />

      <Card title={T('school_profile')} style={{ marginBottom: 16 }}>
        <Field label={T('school_name')}><Input value={f.name} disabled={!canEdit} onChange={e => set({ name: e.target.value })} /></Field>
        <div className="form-row">
          <Field label={T('phone')}><Input type="tel" value={f.phone} disabled={!canEdit} onChange={e => set({ phone: e.target.value })} /></Field>
          <Field label={T('city')}><Select value={f.city} disabled={!canEdit} onChange={e => set({ city: e.target.value })} options={cityOpts} /></Field>
        </div>
        <Field label={T('address')}><Input value={f.address} disabled={!canEdit} onChange={e => set({ address: e.target.value })} /></Field>
        <Field label={T('maps_link')}><Input value={f.mapsUrl} disabled={!canEdit} onChange={e => set({ mapsUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" /></Field>
        <Field label={T('categories_offered')}>
          <Choices multi chip value={f.cats} onChange={v => canEdit && v.length && set({ cats: v })} options={LICENCE_CATS.map(c => ({ v: c, l: c }))} />
        </Field>
        <div className="form-row">
          <Field label={T('working_hours')}>
            <div className="row" style={{ gap: 8 }}>
              <Input type="time" value={f.hoursStart} disabled={!canEdit} onChange={e => set({ hoursStart: e.target.value })} />
              <span className="muted">–</span>
              <Input type="time" value={f.hoursEnd} disabled={!canEdit} onChange={e => set({ hoursEnd: e.target.value })} />
            </div>
          </Field>
        </div>
        <Field label={T('working_days')}>
          <Choices multi chip value={f.workingDays} onChange={v => canEdit && set({ workingDays: DAY_KEYS.filter(d => v.includes(d)) })} options={DAY_KEYS.map((d, i) => ({ v: d, l: dayShort(i, lang) }))} />
        </Field>
        {canEdit && <Button variant="primary" icon="check" loading={busy} onClick={save}>{T('save')}</Button>}
      </Card>

      <Card title={T('directory')} style={{ marginBottom: 16 }} extra={school?.id && <LinkButton size="sm" variant="ghost" icon="external" href={'#/school/' + school.id}>{T('directory')}</LinkButton>}>
        <SettingRow title={T('listed')} hint={T('listed_hint')}>
          <Switch on={school?.listed !== false} disabled={!canEdit} onChange={v => updateSchool({ listed: v })} />
        </SettingRow>
        <SettingRow title={T('accept_enroll')} hint={T('accept_enroll_hint')}>
          <Switch on={school?.acceptEnrollments !== false} disabled={!canEdit} onChange={v => updateSchool({ acceptEnrollments: v })} />
        </SettingRow>
      </Card>

      <Card title={T('preferences')} style={{ marginBottom: 16 }}>
        <SettingRow title={T('language')}><LangToggle size="md" /></SettingRow>
        <SettingRow title={T('plan')} hint={plan ? T('plan_instr', { n: plan.instructors }) : null}>
          <Badge tone={school?.status === 'trial' ? 'amber' : 'brand'}>{school?.plan || '—'}{school?.status ? ' · ' + T(school.status) : ''}</Badge>
        </SettingRow>
      </Card>

      <Card title={T('data_section')} style={{ marginBottom: 16 }}>
        <p className="muted" style={{ marginBottom: 12 }}>{T('export_hint')}</p>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <Button variant="soft" icon="download" onClick={() => exportCSV('students')}>{T('students')}</Button>
          <Button variant="soft" icon="download" onClick={() => exportCSV('lessons')}>{T('lessons')}</Button>
          <Button variant="soft" icon="download" onClick={() => exportCSV('payments')}>{T('payments')}</Button>
        </div>
      </Card>

      {(isDevAccount || !live) && (
        <Card title={T('view_as')} sub={T('view_as_hint')}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {DEV_VIEWS.map(([v, k]) => <Button key={v} size="sm" variant={role === v ? 'primary' : 'secondary'} onClick={() => devSwitchView(v)}>{T(k)}</Button>)}
          </div>
        </Card>
      )}
    </div>
  );
}
