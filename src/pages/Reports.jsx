import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, ProgressBar, btnGhostStyle, euro } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

export default function Reports() {
  const { data, lessons, showToast, T } = useApp();
  const months = [['Feb', 2400], ['Mar', 3100], ['Apr', 2800], ['May', 3600], ['Jun', 1780]];
  const maxRev = Math.max(...months.map(m => m[1]));
  const instrPerf = data.instructors.map(i => ({
    i, lessons: lessons.filter(l => l.instructorId === i.id).length,
    students: data.students.filter(s => s.instructorId === i.id).length,
  }));
  const maxL = Math.max(...instrPerf.map(p => p.lessons));
  const totalL = lessons.length;
  const cancelled = lessons.filter(l => l.status === 'cancelled' || l.status === 'no_show').length;

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

  function KVRow({ label, value }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + C.line2, fontSize: 13.5 }}>
        <span style={{ color: C.mut, fontWeight: 500 }}>{label}</span>
        <span style={{ color: C.ink, fontWeight: 600 }}>{value}</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '22px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => showToast(T('export') + ' CSV (demo)')} style={{ ...btnGhostStyle(), marginRight: 8 }}>
          <Icon name="doc" size={16} sw={1.8} />{T('export')} CSV
        </button>
        <button onClick={() => showToast(T('export') + ' PDF (demo)')} style={btnGhostStyle()}>
          <Icon name="doc" size={16} sw={1.8} />{T('export')} PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        <Card title={T('monthly_revenue')}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 200, padding: '10px 4px 0' }}>
            {months.map(([m, val]) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: font.mono, fontSize: 11.5, fontWeight: 600, color: C.ink2 }}>€{(val / 1000).toFixed(1)}k</div>
                <div style={{ width: '100%', maxWidth: 46, height: (val / maxRev * 150) + 'px', background: m === 'Jun' ? C.pri : C.priBg, borderRadius: '7px 7px 0 0', transition: 'height .5s' }} />
                <div style={{ fontSize: 12, color: C.mut, fontWeight: 600 }}>{m}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title={T('cancel_rate')}>
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <div style={{ fontFamily: font.disp, fontSize: 40, fontWeight: 700, color: cancelled / totalL > 0.15 ? C.red : C.amb }}>{Math.round(cancelled / totalL * 100)}%</div>
              <div style={{ fontSize: 12.5, color: C.mut, marginTop: 4 }}>{cancelled} {T('of')} {totalL} {T('lessons').toLowerCase()}</div>
            </div>
          </Card>
          <Card title="Totals">
            <KVRow label={T('students')} value={data.students.length} />
            <KVRow label={'Active ' + T('lessons').toLowerCase()} value={lessons.filter(l => l.status === 'scheduled').length} />
            <KVRow label={T('vehicles')} value={data.vehicles.length} />
          </Card>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title={T('instr_perf')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {instrPerf.map(p => (
              <div key={p.i.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 140, fontSize: 13.5, fontWeight: 600, color: C.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.i.color }} />{p.i.name}
                </div>
                <div style={{ flex: 1 }}><ProgressBar val={p.lessons} max={maxL} color={p.i.color} h={9} /></div>
                <div style={{ width: 120, textAlign: 'right', fontSize: 12.5, color: C.mut, fontFamily: font.mono }}>{p.lessons} {T('lessons').toLowerCase()} · ☆{p.i.rating}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
