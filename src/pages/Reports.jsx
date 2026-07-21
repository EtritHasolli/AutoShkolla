import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, ProgressBar, btnGhostStyle, euro } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

function monthlyRevenue(payments) {
  const now = new Date();
  const byMonth = {};
  payments.forEach(p => {
    const d = new Date(p.date);
    const key = d.getFullYear() + '-' + d.getMonth();
    byMonth[key] = (byMonth[key] || 0) + p.amount;
  });
  const out = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const key = d.getFullYear() + '-' + d.getMonth();
    out.push([d.toLocaleString('en', { month: 'short' }), byMonth[key] || 0]);
  }
  return out;
}

function toCSV(rows) {
  return rows.map(r => r.map(c => {
    const s = String(c ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { data, lessons, showToast, T } = useApp();
  const months = monthlyRevenue(data.payments);
  const maxRev = Math.max(1, ...months.map(m => m[1]));

  function exportCSV() {
    const rows = [['Student', 'Instructor', 'Package', 'Paid', 'Due', 'Payment status']];
    data.students.forEach(s => {
      const i = data.instructors.find(x => x.id === s.instructorId);
      rows.push([s.name, i ? i.name : '—', s.total, s.paid, s.due, s.payment]);
    });
    downloadFile(toCSV(rows), 'driveflow-report.csv', 'text/csv;charset=utf-8;');
    showToast(T('export') + ' CSV ✓');
  }

  function exportPDF() {
    showToast('PDF export not available yet — use CSV');
  }
  const instrPerf = data.instructors.map(i => ({
    i, lessons: lessons.filter(l => l.instructorId === i.id).length,
    students: data.students.filter(s => s.instructorId === i.id).length,
  }));
  const maxL = Math.max(1, ...instrPerf.map(p => p.lessons));
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
        <button onClick={exportCSV} style={{ ...btnGhostStyle(), marginRight: 8 }}>
          <Icon name="doc" size={16} sw={1.8} />{T('export')} CSV
        </button>
        <button onClick={exportPDF} style={btnGhostStyle()}>
          <Icon name="doc" size={16} sw={1.8} />{T('export')} PDF
        </button>
      </div>

      <div className="df-grid-main">
        <Card title={T('monthly_revenue')}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 200, padding: '10px 4px 0' }}>
            {months.map(([m, val], idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: font.mono, fontSize: 11.5, fontWeight: 600, color: C.ink2 }}>{euro(val)}</div>
                <div style={{ width: '100%', maxWidth: 46, height: Math.max(2, val / maxRev * 150) + 'px', background: idx === months.length - 1 ? C.pri : C.priBg, borderRadius: '7px 7px 0 0', transition: 'height .5s' }} />
                <div style={{ fontSize: 12, color: C.mut, fontWeight: 600 }}>{m}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title={T('cancel_rate')}>
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <div style={{ fontFamily: font.disp, fontSize: 40, fontWeight: 700, color: (totalL ? cancelled / totalL : 0) > 0.15 ? C.red : C.amb }}>{totalL ? Math.round(cancelled / totalL * 100) : 0}%</div>
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
