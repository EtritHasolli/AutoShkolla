import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Avatar, Button, LinkButton, Empty, Icon, Badge, PageHeader } from '../components/ui.jsx';
import { sameMonth, telLink, whatsappLink } from '../lib/format.js';

export default function Instructors() {
  const { data, lessons, today, T, openModal, setCalFilterI, setCalView, go } = useApp();
  return (
    <div className="page">
      <PageHeader title={T('instructors')} sub={T('n_instructors', { n: data.instructors.length })}
        actions={<Button variant="primary" icon="plus" onClick={() => openModal({ type: 'instructor' })}>{T('add_instructor')}</Button>} />
      {!data.instructors.length ? (
        <Card><Empty icon="instructors" title={T('no_instructors')} text={T('no_instructors_text')} action={<Button variant="primary" icon="plus" onClick={() => openModal({ type: 'instructor' })}>{T('add_instructor')}</Button>} /></Card>
      ) : (
        <div className="grid-auto">
          {data.instructors.map(i => {
            const v = data.vehicles.find(x => x.id === i.vehicle);
            const todays = lessons.filter(l => l.instructorId === i.id && l.date === today && l.status !== 'cancelled').length;
            const month = lessons.filter(l => l.instructorId === i.id && l.status === 'completed' && sameMonth(l.date, today)).length;
            return (
              <div key={i.id} className="card" style={{ overflow: 'hidden' }}>
                <div className="row" style={{ gap: 12, padding: 16 }}>
                  <Avatar name={i.name} color={i.color} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 700, fontSize: 15.5 }}>{i.name}</div>
                    <div className="row" style={{ gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <Badge tone="brand">{T('category')} {i.cat}</Badge>
                      {i.profileId && <Badge tone="green"><Icon name="smartphone" size={12} />App</Badge>}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" icon="edit" title={T('edit')} onClick={() => openModal({ type: 'instructor', editId: i.id })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
                  {[[i.students, T('students')], [todays, T('lessons_today')], [month, T('lessons_month')]].map(([val, label], k) => (
                    <div key={k} style={{ padding: '12px 6px', textAlign: 'center', borderLeft: k ? '1px solid var(--line-2)' : 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 19 }} className="tnum">{val}</div>
                      <div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div className="row" style={{ gap: 8, padding: 12 }}>
                  <span className="row muted truncate" style={{ gap: 6, flex: 1, fontSize: 13 }}><Icon name="car" size={16} />{v ? `${v.name} · ${v.plate}` : T('no_vehicle')}</span>
                  <Button size="sm" variant="ghost" icon="calendar" title={T('calendar')} onClick={() => { setCalFilterI(i.id); setCalView('week'); go('calendar'); }} />
                  {i.phone && <LinkButton size="sm" href={telLink(i.phone)} icon="phone" title={T('call')} />}
                  {i.phone && <LinkButton size="sm" variant="whatsapp" href={whatsappLink(i.phone)} icon="whatsapp" title="WhatsApp" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
