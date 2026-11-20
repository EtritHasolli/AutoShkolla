import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Button, Empty, Badge, ToneIcon, PageHeader, vehicleTone } from '../components/ui.jsx';
import { fmtDate, daysUntil } from '../lib/format.js';

function Deadline({ label, date }) {
  const { T, lang } = useApp();
  if (!date) return <div style={{ flex: 1, minWidth: 0 }}><div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{label}</div><div className="soft" style={{ fontWeight: 600, marginTop: 2 }}>—</div></div>;
  const d = daysUntil(date);
  const tone = d < 0 || d <= 7 ? 'red' : d <= 30 ? 'amber' : null;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ fontWeight: 650, marginTop: 2, color: tone ? `var(--${tone})` : 'var(--ink)' }}>{fmtDate(date, lang)}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: tone ? `var(--${tone})` : 'var(--soft)' }}>{d < 0 ? T('expired') : T('days_left', { n: d })}</div>
    </div>
  );
}

export default function Vehicles() {
  const { data, lessons, today, T, openModal } = useApp();
  return (
    <div className="page">
      <PageHeader title={T('vehicles')} actions={<Button variant="primary" icon="plus" onClick={() => openModal({ type: 'vehicle' })}>{T('add_vehicle')}</Button>} />
      {!data.vehicles.length ? (
        <Card><Empty icon="car" title={T('no_vehicles')} text={T('no_vehicles_text')} action={<Button variant="primary" icon="plus" onClick={() => openModal({ type: 'vehicle' })}>{T('add_vehicle')}</Button>} /></Card>
      ) : (
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {data.vehicles.map(v => {
            const driver = data.instructors.find(i => i.vehicle === v.id);
            const todayCount = lessons.filter(l => l.vehicleId === v.id && l.date === today && l.status !== 'cancelled').length;
            return (
              <div key={v.id} className="card card-hover" onClick={() => openModal({ type: 'vehicle', editId: v.id })}>
                <div className="row" style={{ gap: 12, padding: 16, borderBottom: '1px solid var(--line-2)' }}>
                  <ToneIcon name="car" tone="brand" size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 700, fontSize: 15.5 }}>{v.name}</div>
                    <div className="mono muted truncate" style={{ fontSize: 12.5 }}>{v.plate}{v.year ? ' · ' + v.year : ''}{v.km ? ' · ' + Number(v.km).toLocaleString('de-DE') + ' km' : ''}</div>
                  </div>
                  <Badge tone={vehicleTone(v.status)} dot>{T(v.status)}</Badge>
                </div>
                <div className="row" style={{ gap: 12, padding: '14px 16px', alignItems: 'flex-start' }}>
                  <Deadline label={T('insurance')} date={v.ins} />
                  <Deadline label={T('registration')} date={v.reg} />
                  <Deadline label={T('next_service')} date={v.service} />
                </div>
                <div className="row muted" style={{ gap: 6, padding: '0 16px 14px', fontSize: 12.5 }}>
                  {driver ? driver.name : T('unassigned')} · {T('n_lessons', { n: todayCount })} {T('today').toLowerCase()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
