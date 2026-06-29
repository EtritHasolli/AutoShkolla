import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, Avatar, ProgressBar, EmptyRow, Card, KV, btnGhostStyle, euro, statusColor, statusBg, payColor, payBg } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

function StudentList() {
  const { data, search, payFilter, setPayFilter, openStudent, openModal, T } = useApp();
  const q = search.toLowerCase();
  let list = data.students.filter(s => !q || s.name.toLowerCase().includes(q));
  if (payFilter !== 'all') list = list.filter(s => s.payment === payFilter);

  const cols = '2.2fr 1.4fr 1.6fr 1fr 1fr 40px';
  return (
    <div style={{ animation: 'df-fade .25s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 26px 14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, background: C.surf, border: '1px solid ' + C.line, borderRadius: 9, padding: 3 }}>
          {[['all', T('all')], ['paid', T('paid')], ['partial', T('partial')], ['unpaid', T('unpaid')]].map(([v, l]) => (
            <button key={v} onClick={() => setPayFilter(v)} style={{ border: 'none', background: payFilter === v ? C.pri : 'transparent', color: payFilter === v ? '#fff' : C.mut, fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 7 }}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, color: C.mut, fontWeight: 600 }}>{list.length} {T('students').toLowerCase()}</div>
        <button onClick={() => openModal({ type: 'student' })} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 9 }}>
          <Icon name="plus" size={16} sw={2.2} />{T('add_student')}
        </button>
      </div>
      <div style={{ margin: '0 26px 30px', background: C.surf, border: '1px solid ' + C.line, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '11px 22px', borderBottom: '1px solid ' + C.line, fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          <div>{T('name')}</div><div>{T('instructor')}</div><div>{T('package')}</div><div>{T('readiness')}</div><div>{T('payment')}</div><div />
        </div>
        {list.length ? list.map(s => {
          const i = data.instructors.find(x => x.id === s.instructorId);
          return (
            <button key={s.id} onClick={() => openStudent(s.id)}
              onMouseEnter={e => e.currentTarget.style.background = C.priSoft}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center', padding: '12px 22px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid ' + C.line2, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <Avatar name={s.name} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.mut }}>{s.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: i.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.ink2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.name}</span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: C.mut, marginBottom: 4, fontWeight: 600 }}>
                  <span>{s.used}/{s.total}</span><span>{s.remaining} {T('remaining')}</span>
                </div>
                <ProgressBar val={s.used} max={s.total} color={C.pri} h={6} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 600, color: s.readiness >= 70 ? C.grn : s.readiness >= 45 ? C.amb : C.ink2 }}>{s.readiness}%</span>
              </div>
              <div><Pill text={T(s.payment)} color={payColor(s.payment)} bg={payBg(s.payment)} /></div>
              <div style={{ color: C.soft, display: 'flex', justifyContent: 'flex-end' }}><Icon name="chevR" size={16} sw={2.2} /></div>
            </button>
          );
        }) : <EmptyRow msg="No students found" />}
      </div>
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'transparent', color: active ? C.ink : C.mut, fontSize: 13.5, fontWeight: 600, padding: '12px 4px', borderBottom: '2px solid ' + (active ? C.pri : 'transparent'), marginBottom: -1 }}>
      {label}
    </button>
  );
}

function ProfOverview({ s, i, v }) {
  const { T } = useApp();
  const ringPct = Math.round(s.used / s.total * 100);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title={T('package')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: `conic-gradient(${C.pri} ${ringPct}%, ${C.line} 0)` }} />
              <div style={{ position: 'absolute', inset: 9, borderRadius: '50%', background: C.surf, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.ink }}>{s.remaining}</div>
                <div style={{ fontSize: 10.5, color: C.mut, fontWeight: 600 }}>{T('remaining')}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: font.disp, fontSize: 18, fontWeight: 700, color: C.ink }}>{s.total} {T('lessons').toLowerCase()}</div>
              <div style={{ fontSize: 13, color: C.mut, margin: '2px 0 12px' }}>{s.used} {T('used')} · {s.remaining} {T('remaining')}</div>
              <ProgressBar val={s.used} max={s.total} color={C.pri} h={8} />
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[[T('instructor'), i.name, i.color], [T('vehicle'), v ? v.name : '—', C.teal], ['Category', 'B — Car', C.vio], ['Joined', new Date(s.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), C.amb]].map((r, idx) => (
              <div key={idx} style={{ padding: '14px 16px', borderBottom: idx < 2 ? '1px solid ' + C.line2 : 'none', borderRight: idx % 2 === 0 ? '1px solid ' + C.line2 : 'none' }}>
                <div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{r[0]}</div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, marginTop: 3 }}>{r[1]}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Notes">
          <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.6 }}>Confident in city driving. Needs more practice with reverse parking and roundabouts before practical exam. Prefers morning lessons.</div>
        </Card>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title={T('readiness')}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: font.disp, fontSize: 34, fontWeight: 700, color: s.readiness >= 70 ? C.grn : C.amb }}>{s.readiness}%</span>
            {s.readiness >= 70 ? <Pill text={T('exam_ready')} color={C.grn} bg={C.grnBg} /> : <Pill text="In progress" color={C.amb} bg={C.ambBg} />}
          </div>
          <ProgressBar val={s.readiness} max={100} color={s.readiness >= 70 ? C.grn : C.amb} h={9} />
        </Card>
        <Card title={T('payment')}>
          <KV label={T('total_due')} value={euro(s.price)} />
          <KV label={T('paid')} value={euro(s.paid)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 2px', fontSize: 14 }}>
            <span style={{ color: C.mut, fontWeight: 600 }}>{T('remaining')}</span>
            <span style={{ fontFamily: font.mono, fontWeight: 700, color: s.due > 0 ? C.red : C.grn }}>{euro(s.due)}</span>
          </div>
        </Card>
        <Card title="Exam status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['theory', s.theory], ['practical', s.practical]].map(([k, val]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13.5, color: C.ink2, fontWeight: 600 }}>{T(k)}</span>
                <Pill text={val === 'passed' ? T('passed') : val === 'scheduled' ? T('scheduled') : 'Not taken'} color={val === 'passed' ? C.grn : val === 'scheduled' ? C.pri : C.mut} bg={val === 'passed' ? C.grnBg : val === 'scheduled' ? C.priBg : C.line2} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfProgress({ s }) {
  const { data, T } = useApp();
  const labels = { parking: T('skill_parking'), reverse: T('skill_reverse'), highway: T('skill_highway'), clutch: T('skill_clutch'), roundabout: T('skill_roundabout'), lane: T('skill_lane') };
  const avg = (Object.values(s.progress).reduce((a, b) => a + b, 0) / 6).toFixed(1);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
      <Card title={T('progress') + ' — skill scoring (1–5)'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {data.skills.map(sk => {
            const val = s.progress[sk];
            return (
              <div key={sk}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{labels[sk]}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => <span key={n} style={{ width: 18, height: 8, borderRadius: 3, background: n <= val ? (val >= 4 ? C.grn : val >= 3 ? C.pri : C.amb) : C.line }} />)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title={T('exam_ready')}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontFamily: font.disp, fontSize: 46, fontWeight: 700, color: s.readiness >= 70 ? C.grn : C.amb }}>{s.readiness}%</div>
            <div style={{ marginTop: 6 }}>{s.readiness >= 70 ? <Pill text={'✓ ' + T('exam_ready')} color={C.grn} bg={C.grnBg} /> : <Pill text="Needs practice" color={C.amb} bg={C.ambBg} />}</div>
            <div style={{ fontSize: 12.5, color: C.mut, marginTop: 12, lineHeight: 1.5 }}>Average skill score {avg} / 5 across {data.skills.length} areas</div>
          </div>
        </Card>
        <Card title="Weakest areas">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.skills.map(sk => ({ sk, v: s.progress[sk] })).sort((a, b) => a.v - b.v).slice(0, 3).map(({ sk, v }) => (
              <div key={sk} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: C.ink2, fontWeight: 600 }}>{labels[sk]}</span>
                <span style={{ color: v <= 2 ? C.red : C.amb, fontWeight: 700, fontFamily: font.mono }}>{v}/5</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfPayments({ s }) {
  const { data, T, openModal } = useApp();
  const hist = data.payments.filter(p => p.studentId === s.id);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 14 }}>
        {[[T('total_due'), euro(s.price), C.ink], [T('paid'), euro(s.paid), C.grn], [T('remaining'), euro(s.due), s.due > 0 ? C.red : C.grn]].map((r, idx) => (
          <div key={idx} style={{ flex: 1, background: C.surf, border: '1px solid ' + C.line, borderRadius: 13, padding: '16px 18px' }}>
            <div style={{ fontSize: 12.5, color: C.mut, fontWeight: 600 }}>{r[0]}</div>
            <div style={{ fontFamily: font.disp, fontSize: 26, fontWeight: 700, color: r[2], marginTop: 6 }}>{r[1]}</div>
          </div>
        ))}
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Card title="Payment history" extra={<button onClick={() => openModal({ type: 'payment', studentId: s.id })} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: C.pri, color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '8px 13px', borderRadius: 9 }}><Icon name="plus" size={15} sw={2.2} />{T('record')}</button>}>
          {hist.length ? hist.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid ' + C.line2 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: C.grnBg, color: C.grn, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="euro" size={17} sw={2} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{euro(p.amount)} · {T(p.method)}</div>
                <div style={{ fontSize: 12, color: C.mut }}>{p.note}</div>
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 12.5, color: C.mut }}>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
            </div>
          )) : <EmptyRow msg="No payments recorded" />}
        </Card>
      </div>
    </div>
  );
}

function ProfLessons({ s }) {
  const { lessons, data, T } = useApp();
  const ls = lessons.filter(l => l.studentId === s.id).sort((a, b) => a.day - b.day || a.hour - b.hour);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <Card title={T('lessons') + ' history'}>
      {ls.length ? ls.map(l => {
        const i = data.instructors.find(x => x.id === l.instructorId);
        const v = data.vehicles.find(x => x.id === l.vehicleId);
        return (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid ' + C.line2 }}>
            <div style={{ fontFamily: font.mono, fontSize: 12.5, color: C.ink2, fontWeight: 600, width: 80 }}>{days[l.day]} {String(l.hour).padStart(2, '0')}:00</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{T(l.type)} · {i.name}</div>
              <div style={{ fontSize: 12, color: C.mut }}>{v.name} · {T('pickup')}: {l.pickup}</div>
            </div>
            <Pill text={T(l.status)} color={statusColor(l.status)} bg={statusBg(l.status)} />
          </div>
        );
      }) : <EmptyRow msg="No lessons yet" />}
    </Card>
  );
}

function ProfDocs({ s }) {
  const docs = [['ID card', 'id_card.pdf'], ['Medical certificate', 'medical_cert.pdf'], ['Application form', 'application.pdf'], ['Photo', 'photo.jpg']];
  return (
    <Card title="Documents">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {docs.map(([name, file], idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', border: '1px solid ' + C.line, borderRadius: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: C.priBg, color: C.pri, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="doc" size={19} sw={1.8} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{name}</div>
              <div style={{ fontSize: 11.5, color: C.mut, fontFamily: font.mono }}>{file}</div>
            </div>
            <Pill text="✓" color={C.grn} bg={C.grnBg} />
          </div>
        ))}
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 14px', border: '1px dashed ' + C.line, borderRadius: 11, background: 'transparent', color: C.mut, fontSize: 13, fontWeight: 600 }}>
          <Icon name="plus" size={17} sw={2} /> Upload document
        </button>
      </div>
    </Card>
  );
}

function StudentProfile() {
  const { data, selStudent, setSelStudent, studentTab, setStudentTab, openModal, T, todayIdx } = useApp();
  const s = data.students.find(x => x.id === selStudent);
  const i = data.instructors.find(x => x.id === s.instructorId);
  const v = data.vehicles.find(x => x.id === i.vehicle);

  const tabs = [['overview', 'Overview'], ['progress', T('progress')], ['payments', T('payments')], ['lessons', T('lessons')], ['documents', 'Documents']];

  return (
    <div style={{ padding: '22px 26px 40px' }}>
      <button onClick={() => setSelStudent(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', color: C.mut, fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 14 }}>
        <Icon name="chevL" size={16} sw={2.2} />{T('students')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <Avatar name={s.name} size={64} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: font.disp, fontSize: 23, fontWeight: 700, color: C.ink, letterSpacing: '-.02em' }}>{s.name}</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 5, flexWrap: 'wrap', color: C.mut, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="phone" size={14} sw={1.8} />{s.phone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="students" size={14} sw={1.8} />{i.name}</span>
            <span>Cat. {s.cat}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button onClick={() => openModal({ type: 'payment', studentId: s.id })} style={btnGhostStyle()}>
            <Icon name="euro" size={16} sw={2} />{T('record_payment')}
          </button>
          <button onClick={() => openModal({ type: 'lesson', day: todayIdx, hour: 9, studentId: s.id, instructorId: i.id, vehicleId: i.vehicle, ltype: 'city' })}
            style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10 }}>
            <Icon name="plus" size={16} sw={2.2} />{T('schedule_lesson')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 22, borderBottom: '1px solid ' + C.line, marginTop: 18 }}>
        {tabs.map(([k, l]) => <TabBtn key={k} label={l} active={studentTab === k} onClick={() => setStudentTab(k)} />)}
      </div>

      <div style={{ marginTop: 20 }}>
        {studentTab === 'overview' && <ProfOverview s={s} i={i} v={v} />}
        {studentTab === 'progress' && <ProfProgress s={s} />}
        {studentTab === 'payments' && <ProfPayments s={s} />}
        {studentTab === 'lessons' && <ProfLessons s={s} />}
        {studentTab === 'documents' && <ProfDocs s={s} />}
      </div>
    </div>
  );
}

export default function Students() {
  const { selStudent } = useApp();
  return selStudent ? <StudentProfile /> : <StudentList />;
}
