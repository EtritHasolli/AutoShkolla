import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

export default function Instructors() {
  const { data, lessons, todayIdx, showToast, T } = useApp();
  return (
    <div style={{ padding: '22px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => showToast('Add instructor (demo)')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 9 }}>
          <Icon name="plus" size={16} sw={2.2} /> Add instructor
        </button>
      </div>
      <div className="df-grid-2">
        {data.instructors.map(i => {
          const v = data.vehicles.find(x => x.id === i.vehicle);
          const todays = lessons.filter(l => l.instructorId === i.id && l.day === todayIdx);
          const myStu = data.students.filter(s => s.instructorId === i.id);
          const initials = i.name.split(' ').map(w => w[0]).join('');
          return (
            <div key={i.id} style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid ' + C.line2 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: i.color + '1f', color: i.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19, fontFamily: font.disp }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: font.disp, fontSize: 16.5, fontWeight: 700, color: C.ink }}>{i.name}</div>
                  <div style={{ fontSize: 12.5, color: C.mut, display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span>Cat. {i.cat}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: C.amb }}><Icon name="star" size={13} sw={2} />{i.rating}</span>
                  </div>
                </div>
                <a href="tel:" onClick={e => { e.preventDefault(); showToast(T('call') + ' ' + i.phone); }} style={{ width: 38, height: 38, borderRadius: 10, background: C.grnBg, color: C.grn, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                  <Icon name="phone" size={18} sw={1.9} />
                </a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center' }}>
                {[[myStu.length, T('students')], [todays.length, T('today')], [v ? v.plate : '—', T('vehicle')]].map((r, idx) => (
                  <div key={idx} style={{ padding: '14px 8px', borderRight: idx < 2 ? '1px solid ' + C.line2 : 'none' }}>
                    <div style={{ fontFamily: font.disp, fontSize: 18, fontWeight: 700, color: C.ink }}>{r[0]}</div>
                    <div style={{ fontSize: 11, color: C.mut, fontWeight: 600, marginTop: 2 }}>{r[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
