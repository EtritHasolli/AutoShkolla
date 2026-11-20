import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Stat, Badge, Avatar, Button, LinkButton, Empty, Icon, Segmented, PageHeader, payTone } from '../components/ui.jsx';
import { euro, fmtDate, sameMonth, whatsappLink } from '../lib/format.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import { BRAND } from '../lib/brand.js';

function StudentPayments() {
  const { me, data, T, lang, openModal } = useApp();
  if (me.missing) return null;
  const hist = data.payments.filter(p => p.studentId === me.id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="page page-narrow">
      <Card style={{ marginBottom: 14 }}>
        <div className="muted" style={{ fontWeight: 600, fontSize: 13 }}>{T('balance_after')}</div>
        <div className="tnum" style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.03em', color: me.due > 0 ? 'var(--red)' : 'var(--green)' }}>{euro(me.due)}</div>
        <div className="row" style={{ gap: 28, marginTop: 6 }}>
          <div><div className="muted" style={{ fontSize: 12 }}>{T('price')}</div><div style={{ fontWeight: 700 }}>{euro(me.price)}</div></div>
          <div><div className="muted" style={{ fontSize: 12 }}>{T('paid_amount')}</div><div style={{ fontWeight: 700, color: 'var(--green)' }}>{euro(me.paid)}</div></div>
        </div>
      </Card>
      <div className="badge tone-brand" style={{ display: 'flex', borderRadius: 12, padding: '10px 14px', marginBottom: 16, whiteSpace: 'normal' }}><Icon name="info" size={16} />{T('pay_at_office')}</div>
      <Card flush title={T('payment_history')}>
        {hist.length ? hist.map(p => (
          <button key={p.id} className="row-item" onClick={() => openModal({ type: 'receipt', payment: p })}>
            <span className="ic-tile tone-green"><Icon name="euro" size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-title tnum">{euro(p.amount)}</div>
              <div className="row-sub">{T(p.method)}{p.note ? ' · ' + p.note : ''}</div>
            </div>
            <span className="muted" style={{ fontSize: 12.5 }}>{fmtDate(p.date, lang)}</span>
            <Icon name="receipt" size={17} style={{ color: 'var(--soft)' }} />
          </button>
        )) : <Empty icon="payments" title={T('no_payments')} />}
      </Card>
    </div>
  );
}

export default function Payments() {
  const { data, role, T, lang, today, school, payFilter, setPayFilter, openModal, openStudent } = useApp();
  const mobile = useIsMobile(860);
  const [tab, setTab] = useState('students');
  if (role === 'student') return <StudentPayments />;

  const month = data.payments.filter(p => sameMonth(p.date, today)).reduce((a, p) => a + p.amount, 0);
  const collected = data.payments.reduce((a, p) => a + p.amount, 0);
  const outstanding = data.students.reduce((a, s) => a + s.due, 0);
  const expected = data.students.reduce((a, s) => a + s.price, 0);
  let list = data.students;
  if (payFilter !== 'all') list = list.filter(s => s.payment === payFilter);
  list = [...list].sort((a, b) => b.due - a.due || a.name.localeCompare(b.name));
  const recent = [...data.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60);
  const sOf = (id) => data.students.find(s => s.id === id);
  const remind = (s) => whatsappLink(s.phone, T('reminder_payment_text', { name: s.name.split(' ')[0], amount: euro(s.due), school: school?.name || BRAND }));

  return (
    <div className="page">
      <PageHeader title={T('payments')} sub={T('manual_payment')} actions={<Button variant="primary" icon="plus" onClick={() => openModal({ type: 'payment' })}>{T('record_payment')}</Button>} />
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Stat label={T('collected_month')} value={euro(month)} icon="euro" tone="green" />
        <Stat label={T('collected_total')} value={euro(collected)} icon="trend" tone="brand" />
        <Stat label={T('outstanding')} value={euro(outstanding)} icon="alert" tone="red" valueColor={outstanding > 0 ? 'var(--red)' : undefined} />
        <Stat label={T('expected_total')} value={euro(expected)} icon="packages" tone="violet" />
      </div>

      <div className="toolbar">
        <Segmented value={tab} onChange={setTab} options={[{ v: 'students', l: T('by_student') }, { v: 'recent', l: T('recent_payments') }]} />
        {tab === 'students' && <div style={{ overflowX: 'auto', maxWidth: '100%' }}><Segmented size="sm" value={payFilter} onChange={setPayFilter} options={[{ v: 'all', l: T('all') }, { v: 'unpaid', l: T('unpaid') }, { v: 'partial', l: T('partial') }, { v: 'paid', l: T('paid') }]} /></div>}
      </div>

      {tab === 'students' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          {!list.length ? <Empty icon="students" title={T('no_match')} /> : mobile ? list.map(s => (
            <div key={s.id} className="row-item clickable" style={{ cursor: 'pointer' }} onClick={() => openStudent(s.id, 'payments')}>
              <Avatar name={s.name} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-title">{s.name}</div>
                <div className="row-sub">{euro(s.paid)} / {euro(s.price)}</div>
              </div>
              <Badge tone={payTone(s.payment)}>{s.due > 0 ? euro(s.due) : T('paid')}</Badge>
            </div>
          )) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{T('student')}</th><th>{T('package')}</th><th>{T('paid_amount')}</th><th>{T('due_amount')}</th><th>{T('status')}</th><th /></tr></thead>
                <tbody>
                  {list.map(s => (
                    <tr key={s.id} className="clickable" onClick={() => openStudent(s.id, 'payments')}>
                      <td><div className="row" style={{ gap: 10 }}><Avatar name={s.name} size={32} /><span style={{ fontWeight: 600, color: 'var(--ink)' }}>{s.name}</span></div></td>
                      <td>{s.packageName ? s.packageName + ' · ' : ''}{T('n_lessons', { n: s.total })}</td>
                      <td className="tnum" style={{ color: 'var(--green)', fontWeight: 600 }}>{euro(s.paid)}</td>
                      <td className="tnum" style={{ color: s.due > 0 ? 'var(--red)' : 'var(--soft)', fontWeight: 600 }}>{euro(s.due)}</td>
                      <td><Badge tone={payTone(s.payment)} dot>{T(s.payment)}</Badge></td>
                      <td style={{ width: 110 }} onClick={e => e.stopPropagation()}>
                        <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                          {s.due > 0 && s.phone && <LinkButton size="sm" variant="whatsapp" icon="whatsapp" href={remind(s)} title={T('send_reminder')} />}
                          <Button size="sm" variant="ghost" icon="plus" title={T('record_payment')} onClick={() => openModal({ type: 'payment', studentId: s.id })} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <Card flush>
          {recent.length ? recent.map(p => {
            const s = sOf(p.studentId);
            return (
              <div key={p.id} className="row-item">
                <span className="ic-tile tone-green"><Icon name="euro" size={18} /></span>
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => s && openStudent(s.id, 'payments')}>
                  <div className="row-title">{s?.name || '—'}</div>
                  <div className="row-sub">{fmtDate(p.date, lang)} · {T(p.method)}{p.note ? ' · ' + p.note : ''}</div>
                </div>
                <div className="tnum" style={{ fontWeight: 700 }}>{euro(p.amount)}</div>
                <Button size="sm" variant="ghost" icon="receipt" title={T('receipt')} onClick={() => openModal({ type: 'receipt', payment: p })} />
              </div>
            );
          }) : <Empty icon="payments" title={T('no_payments')} />}
        </Card>
      )}
    </div>
  );
}
