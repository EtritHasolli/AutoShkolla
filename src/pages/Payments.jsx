import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, Avatar, EmptyRow, euro, payColor, payBg } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

function StudentPayments() {
  const { me, data, T } = useApp();
  const s = me;
  const hist = data.payments.filter(p => p.studentId === s.id);
  return (
    <div style={{ padding: '22px 26px 90px', animation: 'df-fade .25s', maxWidth: 640 }}>
      <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '20px 22px', marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, color: C.mut, fontWeight: 600 }}>{T('remaining')}</div>
        <div style={{ fontFamily: font.disp, fontSize: 36, fontWeight: 700, color: s.due > 0 ? C.red : C.grn, margin: '4px 0 16px' }}>{euro(s.due)}</div>
        <div style={{ display: 'flex', gap: 28 }}>
          <div><div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{T('total_due')}</div><div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 2 }}>{euro(s.price)}</div></div>
          <div><div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{T('paid')}</div><div style={{ fontSize: 16, fontWeight: 700, color: C.grn, marginTop: 2 }}>{euro(s.paid)}</div></div>
        </div>
      </div>

      <div style={{ background: C.priSoft, border: '1px solid ' + C.priBg, borderRadius: 12, padding: '11px 14px', fontSize: 12.5, color: C.priD, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="euro" size={15} sw={2} /> Pay in cash at the school office
      </div>

      <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>History</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hist.length ? hist.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surf, border: '1px solid ' + C.line, borderRadius: 13, padding: '12px 16px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.grnBg, color: C.grn, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="euro" size={19} sw={2} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{euro(p.amount)}</div>
              <div style={{ fontSize: 12.5, color: C.mut }}>{T(p.method)} · {p.note}</div>
            </div>
            <div style={{ fontSize: 12, color: C.mut, fontFamily: font.mono }}>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
          </div>
        )) : <EmptyRow msg="No payments yet" />}
      </div>
    </div>
  );
}

export default function Payments() {
  const { data, role, payFilter, setPayFilter, openModal, openStudent, setStudentTab, T } = useApp();
  if (role === 'student') return <StudentPayments />;
  const collected = data.payments.reduce((a, p) => a + p.amount, 0);
  const outstanding = data.students.reduce((a, s) => a + s.due, 0);
  const expected = data.students.reduce((a, s) => a + s.price, 0);
  let list = data.students;
  if (payFilter !== 'all') list = list.filter(s => s.payment === payFilter);

  return (
    <div style={{ padding: '22px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ background: C.priSoft, border: '1px solid ' + C.priBg, borderRadius: 11, padding: '10px 14px', fontSize: 12.5, color: C.priD, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="euro" size={16} sw={2} />{T('manual_payment')}
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        {[[T('collected'), euro(collected), C.grn, 'euro'], [T('outstanding'), euro(outstanding), C.red, 'alert'], ['Expected total', euro(expected), C.pri, 'reports']].map((r, idx) => (
          <div key={idx} style={{ flex: 1, minWidth: 180, background: C.surf, border: '1px solid ' + C.line, borderRadius: 14, padding: '17px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: C.mut, fontWeight: 600 }}>{r[0]}</span>
              <span style={{ color: r[2] }}><Icon name={r[3]} size={17} sw={2} /></span>
            </div>
            <div style={{ fontFamily: font.disp, fontSize: 27, fontWeight: 700, color: r[2], marginTop: 10 }}>{r[1]}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6, background: C.surf, border: '1px solid ' + C.line, borderRadius: 9, padding: 3 }}>
          {[['all', T('all')], ['paid', T('paid')], ['partial', T('partial')], ['unpaid', T('unpaid')]].map(([v, l]) => (
            <button key={v} onClick={() => setPayFilter(v)} style={{ border: 'none', background: payFilter === v ? C.pri : 'transparent', color: payFilter === v ? '#fff' : C.mut, fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 7 }}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => openModal({ type: 'payment' })} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 9 }}>
          <Icon name="plus" size={16} sw={2.2} />{T('record_payment')}
        </button>
      </div>
      <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 14, overflow: 'hidden' }}>
       <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 620 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1fr', gap: 12, padding: '11px 20px', borderBottom: '1px solid ' + C.line, fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          <div>{T('student')}</div><div>{T('package')}</div><div>{T('paid')}</div><div>{T('remaining')}</div><div>{T('status')}</div>
        </div>
        {list.map(s => (
          <button key={s.id} onClick={() => { openStudent(s.id); setStudentTab('payments'); }}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', padding: '12px 20px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid ' + C.line2, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <Avatar name={s.name} size={34} />
              <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.name}</span>
            </div>
            <span style={{ fontSize: 13, color: C.ink2 }}>{s.total} {T('lessons').toLowerCase()}</span>
            <span style={{ fontFamily: font.mono, fontSize: 13.5, color: C.grn, fontWeight: 600 }}>{euro(s.paid)}</span>
            <span style={{ fontFamily: font.mono, fontSize: 13.5, color: s.due > 0 ? C.red : C.mut, fontWeight: 600 }}>{euro(s.due)}</span>
            <div><Pill text={T(s.payment)} color={payColor(s.payment)} bg={payBg(s.payment)} /></div>
          </button>
        ))}
        </div>
       </div>
      </div>
    </div>
  );
}
