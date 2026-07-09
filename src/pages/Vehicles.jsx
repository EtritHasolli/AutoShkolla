import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

function daysTo(date) { return Math.round((new Date(date) - Date.now()) / 86400000); }

export default function Vehicles() {
  const { data, openModal, T } = useApp();
  const statusMap = {
    available: [C.grn, C.grnBg, T('available')],
    in_use: [C.pri, C.priBg, T('in_use')],
    maintenance: [C.amb, C.ambBg, T('maintenance')],
  };

  function Expiry({ label, date }) {
    if (!date) {
      return (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.soft, marginTop: 2 }}>—</div>
        </div>
      );
    }
    const d = daysTo(date);
    return (
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: d < 14 ? C.red : d < 30 ? C.amb : C.ink, marginTop: 2 }}>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
        <div style={{ fontSize: 11, color: d < 14 ? C.red : C.soft, fontWeight: 600 }}>{d < 0 ? 'expired' : d + ' days'}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '22px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => openModal({ type: 'vehicle' })} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 9 }}>
          <Icon name="plus" size={16} sw={2.2} /> Add vehicle
        </button>
      </div>
      <div className="df-grid-2">
        {data.vehicles.map(v => {
          const sm = statusMap[v.status];
          return (
            <div key={v.id} style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid ' + C.line2 }}>
                <div style={{ width: 48, height: 48, borderRadius: 11, background: C.priBg, color: C.pri, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="car2" size={26} sw={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: font.disp, fontSize: 16.5, fontWeight: 700, color: C.ink }}>{v.name}</div>
                  <div style={{ fontFamily: font.mono, fontSize: 12.5, color: C.mut, marginTop: 1 }}>{v.plate} · {v.year} · {v.km.toLocaleString('de-DE')} km</div>
                </div>
                <Pill text={sm[2]} color={sm[0]} bg={sm[1]} />
              </div>
              <div style={{ display: 'flex', gap: 12, padding: '16px 20px' }}>
                <Expiry label="Insurance" date={v.ins} />
                <Expiry label="Registration" date={v.reg} />
                <Expiry label="Next service" date={v.service} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
