import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Stat, Button, Avatar, Segmented, PageHeader } from '../components/ui.jsx';
import { euro, monthShort, monthLong, sameMonth, toISO } from '../lib/format.js';

function lastMonths(n) {
  const now = new Date();
  return Array.from({ length: n }, (_, k) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - k), 1);
    return { key: toISO(d).slice(0, 7), m: d.getMonth(), y: d.getFullYear() };
  });
}

// Single-series bar chart: one hue, rounded data-ends on the baseline, hover
// tooltip per bar, only the latest value labelled directly.
function RevenueChart({ rows, lang }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...rows.map(r => r.v));
  const H = 180;
  return (
    <div style={{ position: 'relative', paddingTop: 22 }}>
      <div style={{ position: 'absolute', inset: '22px 0 26px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
        {[0, 1, 2, 3].map(k => <div key={k} style={{ borderTop: '1px solid var(--line-2)' }} />)}
      </div>
      <div className="row" style={{ alignItems: 'flex-end', gap: 2, height: H, position: 'relative' }}>
        {rows.map((r, k) => {
          const last = k === rows.length - 1;
          const h = Math.max(2, Math.round(r.v / max * (H - 6)));
          return (
            <div key={r.key} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)} onClick={() => setHover(k)}
              style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative', cursor: 'default' }}>
              {(last || hover === k) && (
                <div className="tnum" style={{ position: 'absolute', bottom: h + 6, fontSize: 12, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', background: hover === k && !last ? 'var(--surface)' : 'transparent', padding: '1px 6px', borderRadius: 6, boxShadow: hover === k && !last ? 'var(--shadow)' : 'none' }}>
                  {euro(r.v)}
                </div>
              )}
              <div style={{ width: '62%', maxWidth: 48, height: h, background: 'var(--brand)', opacity: hover === null || hover === k ? 1 : 0.55, borderRadius: '4px 4px 0 0', transition: 'height .4s ease, opacity .12s' }} />
            </div>
          );
        })}
      </div>
      <div className="row" style={{ gap: 2, marginTop: 8, borderTop: '1px solid var(--line)', paddingTop: 6 }}>
        {rows.map(r => <div key={r.key} className="muted" style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600 }}>{monthShort(r.m, lang)}</div>)}
      </div>
    </div>
  );
}

export default function Reports() {
  const { data, lessons, T, lang, today, exportCSV } = useApp();
  const [view, setView] = useState('chart');
  const months = lastMonths(6).map(mo => ({ ...mo, v: data.payments.filter(p => p.date.slice(0, 7) === mo.key).reduce((a, p) => a + p.amount, 0) }));
  const ytd = data.payments.filter(p => p.date.slice(0, 4) === today.slice(0, 4)).reduce((a, p) => a + p.amount, 0);
  const pastLessons = lessons.filter(l => l.date <= today);
  const missed = pastLessons.filter(l => l.status === 'cancelled' || l.status === 'no_show').length;
  const cancelPct = pastLessons.length ? Math.round(missed / pastLessons.length * 100) : 0;
  const results = data.exams.filter(e => e.status !== 'scheduled');
  const passPct = results.length ? Math.round(results.filter(e => e.status === 'passed').length / results.length * 100) : null;

  const perf = data.instructors.map(i => ({
    i,
    done: lessons.filter(l => l.instructorId === i.id && l.status === 'completed' && sameMonth(l.date, today)).length,
    missed: lessons.filter(l => l.instructorId === i.id && (l.status === 'no_show' || l.status === 'cancelled') && sameMonth(l.date, today)).length,
  })).sort((a, b) => b.done - a.done);
  const maxDone = Math.max(1, ...perf.map(p => p.done));

  return (
    <div className="page">
      <PageHeader title={T('reports')} actions={
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <Button icon="download" onClick={() => exportCSV('students')}>{T('students')}</Button>
          <Button icon="download" onClick={() => exportCSV('lessons')}>{T('lessons')}</Button>
          <Button icon="download" onClick={() => exportCSV('payments')}>{T('payments')}</Button>
        </div>
      } />

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Stat label={T('kpi_revenue_month')} value={euro(months[5].v)} sub={T('kpi_vs_last', { v: euro(months[4].v) })} icon="euro" tone="green" />
        <Stat label={T('revenue_ytd')} value={euro(ytd)} icon="trend" tone="brand" />
        <Stat label={T('cancel_rate')} value={cancelPct + '%'} sub={missed + ' / ' + pastLessons.length + ' ' + T('lessons').toLowerCase()} icon="x" tone={cancelPct > 15 ? 'red' : 'amber'} />
        <Stat label={T('pass_rate')} value={passPct == null ? '—' : passPct + '%'} sub={results.length + ' ' + T('exams').toLowerCase()} icon="exams" tone="violet" />
      </div>

      <div className="grid-main">
        <Card title={T('monthly_revenue')} extra={<Segmented size="sm" value={view} onChange={setView} options={[{ v: 'chart', l: '', icon: 'reports' }, { v: 'table', l: '', icon: 'list' }]} />}>
          {view === 'chart' ? <RevenueChart rows={months} lang={lang} /> : (
            <table className="table">
              <tbody>{[...months].reverse().map(r => <tr key={r.key}><td style={{ textTransform: 'capitalize' }}>{monthLong(r.m, lang)} {r.y}</td><td className="tnum" style={{ textAlign: 'right', fontWeight: 600 }}>{euro(r.v)}</td></tr>)}</tbody>
            </table>
          )}
        </Card>

        <Card title={T('instr_perf')} sub={T('lessons_completed')}>
          <div className="stack" style={{ gap: 14 }}>
            {perf.map(p => (
              <div key={p.i.id}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="row truncate" style={{ gap: 8, fontWeight: 600 }}><Avatar name={p.i.name} color={p.i.color} size={24} />{p.i.name}</span>
                  <span className="tnum" style={{ fontWeight: 700 }}>{p.done}{p.missed ? <span className="muted" style={{ fontWeight: 500, fontSize: 12 }}> · {p.missed} ✕</span> : null}</span>
                </div>
                <div className="progress" style={{ height: 8 }}><span style={{ width: (p.done / maxDone * 100) + '%', background: 'var(--brand)', borderRadius: '0 4px 4px 0' }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={T('export_all')} style={{ marginTop: 16 }}>
        <p className="muted" style={{ marginBottom: 12 }}>{T('export_hint')}</p>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <Button variant="soft" icon="download" onClick={() => exportCSV('students')}>{T('students')} (CSV)</Button>
          <Button variant="soft" icon="download" onClick={() => exportCSV('lessons')}>{T('lessons')} (CSV)</Button>
          <Button variant="soft" icon="download" onClick={() => exportCSV('payments')}>{T('payments')} (CSV)</Button>
        </div>
      </Card>
    </div>
  );
}
