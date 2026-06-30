import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, KV, Pill, btnGhostStyle, inputStyle, statusColor, statusBg, euro } from './ui.jsx';
import { C, font } from '../data/seed.js';

function ModalShell({ title, children, footer, mobile }) {
  const { closeModal } = useApp();
  const panelStyle = mobile
    ? { width: '100%', maxWidth: 430, maxHeight: '92%', background: C.surf, borderRadius: '22px 22px 0 0', overflow: 'hidden', animation: 'df-sheet .26s cubic-bezier(.2,.8,.2,1)', display: 'flex', flexDirection: 'column', alignSelf: 'flex-end' }
    : { width: '100%', maxWidth: 470, background: C.surf, borderRadius: 18, overflow: 'hidden', animation: 'df-pop .2s', boxShadow: '0 40px 100px -30px rgba(10,20,40,.6)', maxHeight: '90%', display: 'flex', flexDirection: 'column' };

  return (
    <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,24,.5)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center', padding: mobile ? 0 : 24, animation: 'df-fade .18s' }}>
      <div onClick={e => e.stopPropagation()} style={panelStyle}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid ' + C.line, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontFamily: font.disp, fontWeight: 700, fontSize: 17, color: C.ink }}>{title}</div>
          <button onClick={closeModal} style={{ border: 'none', background: C.bg, color: C.mut, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={18} sw={2} />
          </button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid ' + C.line, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>{footer}</div>
      </div>
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function ModalSelect({ value, onChange, opts }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, top: 12, color: C.mut, pointerEvents: 'none' }}>
        <Icon name="chevR" size={14} sw={2.2} />
      </span>
    </div>
  );
}

function LessonViewModal({ mobile }) {
  const { modal, lessons, data, setLessonStatus, closeModal, openStudent, T } = useApp();
  const l = lessons.find(x => x.id === modal.id);
  if (!l) return null;
  const s = data.students.find(x => x.id === l.studentId);
  const i = data.instructors.find(x => x.id === l.instructorId);
  const v = data.vehicles.find(x => x.id === l.vehicleId);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ModalShell title={s.name} mobile={mobile} footer={
      <>
        <button onClick={() => { closeModal(); openStudent(s.id); }} style={btnGhostStyle()}>{T('view_profile')}</button>
        <button onClick={closeModal} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>Done</button>
      </>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Pill text={T(l.status)} color={statusColor(l.status)} bg={statusBg(l.status)} />
        <span style={{ fontFamily: font.mono, fontSize: 13, color: C.ink2, fontWeight: 600 }}>{days[l.day]} · {String(l.hour).padStart(2, '0')}:00</span>
      </div>
      <KV label={T('instructor')} value={i.name} />
      <KV label={T('vehicle')} value={`${v.name} (${v.plate})`} />
      <KV label={T('pickup')} value={l.pickup} />
      <KV label="Type" value={T(l.type)} />
      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['completed', 'check', C.grn], ['no_show', 'x', C.amb], ['cancelled', 'x', C.red], ['scheduled', 'clock', C.pri]].map(([stt, ic, col]) => (
          <button key={stt} onClick={() => setLessonStatus(l.id, stt)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid ' + (l.status === stt ? col : C.line), background: l.status === stt ? col : C.surf, color: l.status === stt ? '#fff' : C.ink2, fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 9 }}>
            <Icon name={ic} size={15} sw={2.2} />{T(stt)}
          </button>
        ))}
      </div>
    </ModalShell>
  );
}

function NewLessonModal({ mobile }) {
  const { modal, setModal, data, days, hours, createLesson, closeModal, T } = useApp();
  const m = modal;
  function setM(p) { setModal(prev => ({ ...prev, ...p })); }

  return (
    <ModalShell title={T('new_lesson')} mobile={mobile} footer={
      <>
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={() => createLesson(m)} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('save')}</button>
      </>
    }>
      <ModalField label={T('student')}>
        <ModalSelect value={m.studentId} onChange={v => setM({ studentId: v })} opts={data.students.map(s => ({ v: s.id, l: s.name }))} />
      </ModalField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ModalField label={T('day')}>
            <ModalSelect value={String(m.day)} onChange={v => setM({ day: v })} opts={days.map((d, idx) => ({ v: String(idx), l: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx] + ' ' + d.getDate() }))} />
          </ModalField>
        </div>
        <div style={{ flex: 1 }}>
          <ModalField label={T('time')}>
            <ModalSelect value={String(m.hour)} onChange={v => setM({ hour: v })} opts={hours.map(hr => ({ v: String(hr), l: String(hr).padStart(2, '0') + ':00' }))} />
          </ModalField>
        </div>
      </div>
      <ModalField label={T('instructor')}>
        <ModalSelect value={m.instructorId} onChange={v => setM({ instructorId: v })} opts={data.instructors.map(i => ({ v: i.id, l: i.name }))} />
      </ModalField>
      <ModalField label={T('vehicle')}>
        <ModalSelect value={m.vehicleId} onChange={v => setM({ vehicleId: v })} opts={data.vehicles.map(v => ({ v: v.id, l: v.name + ' (' + v.plate + ')' }))} />
      </ModalField>
      <ModalField label="Type">
        <div style={{ display: 'flex', gap: 8 }}>
          {[['city', T('city')], ['highway', T('highway')]].map(([v, l]) => (
            <button key={v} onClick={() => setM({ ltype: v })} style={{ flex: 1, border: '1px solid ' + ((m.ltype || 'city') === v ? C.pri : C.line), background: (m.ltype || 'city') === v ? C.priBg : C.surf, color: (m.ltype || 'city') === v ? C.pri : C.ink2, fontSize: 13, fontWeight: 600, padding: '9px', borderRadius: 9 }}>{l}</button>
          ))}
        </div>
      </ModalField>
    </ModalShell>
  );
}

function PaymentModal({ mobile }) {
  const { modal, setModal, data, closeModal, showToast, T } = useApp();
  const m = modal;
  const [method, setMethod] = useState(m.method || 'cash');
  const s = m.studentId ? data.students.find(x => x.id === m.studentId) : null;

  return (
    <ModalShell title={T('record_payment')} mobile={mobile} footer={
      <>
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={() => { closeModal(); showToast(T('record_payment') + ' ✓'); }} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('record')}</button>
      </>
    }>
      <div style={{ background: C.priSoft, border: '1px solid ' + C.priBg, borderRadius: 10, padding: '9px 12px', fontSize: 12, color: C.priD, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon name="euro" size={15} sw={2} />{T('manual_payment')}
      </div>
      <ModalField label={T('student')}>
        <div style={{ position: 'relative' }}>
          <select defaultValue={m.studentId || data.students[0].id} onChange={e => setModal(prev => ({ ...prev, studentId: e.target.value }))} style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
            {data.students.map(st => <option key={st.id} value={st.id}>{st.name} — {T('remaining')} {euro(st.due)}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, top: 12, color: C.mut, pointerEvents: 'none' }}><Icon name="chevR" size={14} sw={2.2} /></span>
        </div>
      </ModalField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ModalField label={T('amount')}>
            <input type="number" defaultValue={s ? s.due : 100} style={inputStyle()} />
          </ModalField>
        </div>
        <div style={{ flex: 1 }}>
          <ModalField label={T('date')}>
            <input type="date" defaultValue="2026-06-29" style={inputStyle()} />
          </ModalField>
        </div>
      </div>
      <ModalField label={T('method')}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['cash', T('cash')], ['bank', T('bank')], ['other', T('other')]].map(([v, l]) => (
            <button key={v} onClick={() => setMethod(v)} style={{ flex: 1, border: '1px solid ' + (method === v ? C.grn : C.line), background: method === v ? C.grnBg : C.surf, color: method === v ? C.grn : C.ink2, fontSize: 12.5, fontWeight: 600, padding: '9px 4px', borderRadius: 9 }}>{l}</button>
          ))}
        </div>
      </ModalField>
      <ModalField label={T('note')}>
        <input placeholder="…" style={inputStyle()} />
      </ModalField>
    </ModalShell>
  );
}

function AddStudentModal({ mobile }) {
  const { modal, setModal, data, closeModal, showToast, T } = useApp();
  const m = modal;
  const [pkg, setPkg] = useState(m.pkg || '30');

  return (
    <ModalShell title={T('add_student')} mobile={mobile} footer={
      <>
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={() => { closeModal(); showToast(T('add_student') + ' ✓'); }} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('save')}</button>
      </>
    }>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><ModalField label={T('name')}><input placeholder="Emri Mbiemri" style={inputStyle()} /></ModalField></div>
        <div style={{ flex: 1 }}><ModalField label={T('phone')}><input placeholder="+383 4…" style={inputStyle()} /></ModalField></div>
      </div>
      <ModalField label={T('instructor')}>
        <div style={{ position: 'relative' }}>
          <select defaultValue={m.instructorId || data.instructors[0].id} style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
            {data.instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, top: 12, color: C.mut, pointerEvents: 'none' }}><Icon name="chevR" size={14} sw={2.2} /></span>
        </div>
      </ModalField>
      <ModalField label={T('package')}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['20', '20'], ['30', '30'], ['40', '40']].map(([v, l]) => (
            <button key={v} onClick={() => setPkg(v)} style={{ flex: 1, border: '1px solid ' + (pkg === v ? C.pri : C.line), background: pkg === v ? C.priBg : C.surf, color: pkg === v ? C.pri : C.ink2, fontSize: 13, fontWeight: 600, padding: '10px', borderRadius: 9 }}>{l} {T('lessons').toLowerCase()}</button>
          ))}
        </div>
      </ModalField>
      <ModalField label="Category">
        <div style={{ position: 'relative' }}>
          <select defaultValue="B" style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
            <option value="B">B — Car</option>
            <option value="A">A — Motorcycle</option>
            <option value="C">C — Truck</option>
          </select>
          <span style={{ position: 'absolute', right: 11, top: 12, color: C.mut, pointerEvents: 'none' }}><Icon name="chevR" size={14} sw={2.2} /></span>
        </div>
      </ModalField>
    </ModalShell>
  );
}

export default function Modal() {
  const { modal } = useApp();
  if (!modal) return null;
  const mobile = window.innerWidth < 640;
  if (modal.type === 'lessonView') return <LessonViewModal mobile={mobile} />;
  if (modal.type === 'lesson') return <NewLessonModal mobile={mobile} />;
  if (modal.type === 'payment') return <PaymentModal mobile={mobile} />;
  if (modal.type === 'student') return <AddStudentModal mobile={mobile} />;
  return null;
}
