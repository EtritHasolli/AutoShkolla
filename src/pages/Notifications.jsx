import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, btnGhostStyle } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

export default function Notifications() {
  const { notifs, markAllNotifsRead, T } = useApp();
  const iconFor = {
    reminder: ['clock', C.pri, C.priBg],
    payment: ['euro', C.amb, C.ambBg],
    cancel: ['x', C.red, C.redBg],
    alert: ['alert', C.amb, C.ambBg],
  };
  const tplCols = { sent: [C.grn, C.grnBg], pending: [C.amb, C.ambBg], failed: [C.red, C.redBg] };
  const templates = [
    ['Lesson reminder', 'Sent 24h before each lesson', 'reminder'],
    ['Payment reminder', 'When balance is overdue', 'payment'],
    ['Cancellation notice', 'When a lesson is cancelled', 'cancel'],
    ['Exam reminder', '3 days before exam', 'reminder'],
  ];

  function Card({ title, children, extra }) {
    return (
      <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid ' + C.line2 }}>
          <div style={{ fontFamily: font.disp, fontWeight: 600, fontSize: 14.5, color: C.ink }}>{title}</div>{extra}
        </div>
        <div style={{ padding: '16px 18px' }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '22px 26px 40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start', animation: 'df-fade .25s' }}>
      <Card title={T('notifications')} extra={
        <button onClick={markAllNotifsRead} style={{ ...btnGhostStyle(), fontSize: 12 }}>Mark all read</button>
      }>
        {notifs.map(n => {
          const ic = iconFor[n.type];
          const tc = tplCols[n.status];
          return (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '13px 0', borderBottom: '1px solid ' + C.line2, opacity: n.read ? 0.7 : 1 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: ic[2], color: ic[1], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={ic[0]} size={18} sw={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{n.title}</span>
                  {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.pri }} />}
                </div>
                <div style={{ fontSize: 13, color: C.ink2, marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: 11.5, color: C.soft, marginTop: 3 }}>{n.time}</div>
              </div>
              <Pill text={n.status} color={tc[0]} bg={tc[1]} />
            </div>
          );
        })}
      </Card>
      <Card title="Templates">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.map((t, idx) => {
            const ic = iconFor[t[2]];
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 13px', border: '1px solid ' + C.line, borderRadius: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: ic[2], color: ic[1], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic[0]} size={17} sw={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{t[0]}</div>
                  <div style={{ fontSize: 11.5, color: C.mut }}>{t[1]}</div>
                </div>
                <div style={{ width: 34, height: 18, borderRadius: 10, background: C.grn, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 2, top: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
