import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, KV, Pill, btnGhostStyle, inputStyle, statusColor, statusBg, euro } from './ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

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
  if (!s || !i) return null;
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
      <KV label={T('vehicle')} value={v ? `${v.name} (${v.plate})` : '—'} />
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

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function PaymentModal({ mobile }) {
  const { modal, data, closeModal, recordPayment, T } = useApp();
  const m = modal;
  const [studentId, setStudentId] = useState(m.studentId || data.students[0]?.id || '');
  const [method, setMethod] = useState(m.method || 'cash');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const s = data.students.find(x => x.id === studentId);
  const [amount, setAmount] = useState(s ? s.due || 100 : 100);

  if (!data.students.length) {
    return (
      <ModalShell title={T('record_payment')} mobile={mobile} footer={<button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>}>
        <div style={{ fontSize: 13.5, color: C.mut }}>Add a student first — payments are recorded against a student.</div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={T('record_payment')} mobile={mobile} footer={
      <>
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={() => recordPayment({ studentId, amount, date, method, note })} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('record')}</button>
      </>
    }>
      <div style={{ background: C.priSoft, border: '1px solid ' + C.priBg, borderRadius: 10, padding: '9px 12px', fontSize: 12, color: C.priD, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon name="euro" size={15} sw={2} />{T('manual_payment')}
      </div>
      <ModalField label={T('student')}>
        <div style={{ position: 'relative' }}>
          <select value={studentId} onChange={e => { setStudentId(e.target.value); const st = data.students.find(x => x.id === e.target.value); if (st) setAmount(st.due || 100); }} style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
            {data.students.map(st => <option key={st.id} value={st.id}>{st.name} — {T('remaining')} {euro(st.due)}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, top: 12, color: C.mut, pointerEvents: 'none' }}><Icon name="chevR" size={14} sw={2.2} /></span>
        </div>
      </ModalField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ModalField label={T('amount')}>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle()} />
          </ModalField>
        </div>
        <div style={{ flex: 1 }}>
          <ModalField label={T('date')}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle()} />
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
        <input placeholder="…" value={note} onChange={e => setNote(e.target.value)} style={inputStyle()} />
      </ModalField>
    </ModalShell>
  );
}

function AddStudentModal({ mobile }) {
  const { modal, data, closeModal, addStudent, updateStudent, openModal, T } = useApp();
  const m = modal;
  const editing = data.students.find(x => x.id === m.editId);
  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [email, setEmail] = useState(editing?.email || '');
  const [instructorId, setInstructorId] = useState(editing?.instructorId || m.instructorId || data.instructors[0]?.id || '');
  const [pkg, setPkg] = useState(editing ? String(editing.total) : (m.pkg || '30'));
  const [cat, setCat] = useState(editing?.cat || 'B');
  // Recompute from the package selector whenever it differs from the record's
  // original total (so changing the package in edit mode updates price too);
  // otherwise keep the record's own price (it may have been customized).
  const price = editing && Number(pkg) === editing.total
    ? editing.price
    : (pkg === '20' ? 260 : pkg === '30' ? 360 : 460);

  function save() {
    const payload = { name: name.trim(), phone, email: email.trim(), instructorId: instructorId || null, total: Number(pkg), price, cat };
    if (editing) updateStudent(editing.id, payload);
    else addStudent(payload);
  }

  return (
    <ModalShell title={editing ? T('edit') + ' — ' + T('students')  : T('add_student')} mobile={mobile} footer={
      <>
        {editing && (
          <button onClick={() => openModal({ type: 'confirmDelete', kind: 'student', id: editing.id, name: editing.name })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid ' + C.redBg, background: C.redBg, color: C.red, fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, marginRight: 'auto' }}>
            <Icon name="trash" size={15} sw={2} />{T('delete')}
          </button>
        )}
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={save} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('save')}</button>
      </>
    }>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><ModalField label={T('name')}><input value={name} onChange={e => setName(e.target.value)} placeholder="Emri Mbiemri" style={inputStyle()} /></ModalField></div>
        <div style={{ flex: 1 }}><ModalField label={T('phone')}><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+383 4…" style={inputStyle()} /></ModalField></div>
      </div>
      <ModalField label="Email (student can sign in with it)">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="student@email.com" style={inputStyle()} />
      </ModalField>
      <ModalField label={T('instructor')}>
        <div style={{ position: 'relative' }}>
          <select value={instructorId} onChange={e => setInstructorId(e.target.value)} style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
            {!data.instructors.length && <option value="">No instructors yet</option>}
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
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
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

const INSTRUCTOR_COLORS = ['#0f9d6b', '#0b8ea6', '#6d5cd6', '#c07d12', '#2563c9', '#e0463f'];

function AddInstructorModal({ mobile }) {
  const { modal, data, closeModal, addInstructor, updateInstructor, openModal, T } = useApp();
  const editing = data.instructors.find(x => x.id === modal.editId);
  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [email, setEmail] = useState(editing?.email || '');
  const [cat, setCat] = useState(editing?.cat || 'B');
  const [color, setColor] = useState(editing?.color || INSTRUCTOR_COLORS[0]);
  const [vehicleId, setVehicleId] = useState(editing?.vehicle || data.vehicles[0]?.id || '');

  function save() {
    const payload = { name: name.trim(), phone, email: email.trim(), cat, color, vehicleId: vehicleId || null };
    if (editing) updateInstructor(editing.id, payload);
    else addInstructor(payload);
  }

  return (
    <ModalShell title={editing ? T('edit') + ' — ' + T('instructors') : T('instructors')} mobile={mobile} footer={
      <>
        {editing && (
          <button onClick={() => openModal({ type: 'confirmDelete', kind: 'instructor', id: editing.id, name: editing.name })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid ' + C.redBg, background: C.redBg, color: C.red, fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, marginRight: 'auto' }}>
            <Icon name="trash" size={15} sw={2} />{T('delete')}
          </button>
        )}
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={save} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('save')}</button>
      </>
    }>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><ModalField label={T('name')}><input value={name} onChange={e => setName(e.target.value)} placeholder="Emri Mbiemri" style={inputStyle()} /></ModalField></div>
        <div style={{ flex: 1 }}><ModalField label={T('phone')}><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+383 4…" style={inputStyle()} /></ModalField></div>
      </div>
      <ModalField label="Email (instructor can sign in with it)">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="instructor@email.com" style={inputStyle()} />
      </ModalField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ModalField label="Categories">
            <input value={cat} onChange={e => setCat(e.target.value)} placeholder="B or B,C" style={inputStyle()} />
          </ModalField>
        </div>
        <div style={{ flex: 1 }}>
          <ModalField label="Calendar color">
            <div style={{ display: 'flex', gap: 7, paddingTop: 6 }}>
              {INSTRUCTOR_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: color === c ? '3px solid ' + C.ink : '3px solid transparent', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
          </ModalField>
        </div>
      </div>
      <ModalField label={T('vehicle')}>
        <div style={{ position: 'relative' }}>
          <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer', fontWeight: 600, paddingRight: 32 }}>
            <option value="">—</option>
            {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, top: 12, color: C.mut, pointerEvents: 'none' }}><Icon name="chevR" size={14} sw={2.2} /></span>
        </div>
      </ModalField>
    </ModalShell>
  );
}

function AddVehicleModal({ mobile }) {
  const { modal, data, closeModal, addVehicle, updateVehicle, openModal, T } = useApp();
  const editing = data.vehicles.find(x => x.id === modal.editId);
  const [name, setName] = useState(editing?.name || '');
  const [plate, setPlate] = useState(editing?.plate || '');
  const [cat, setCat] = useState(editing?.cat || 'B');
  const [year, setYear] = useState(editing?.year || '');
  const [reg, setReg] = useState(editing?.reg || '');
  const [ins, setIns] = useState(editing?.ins || '');
  const [km, setKm] = useState(editing?.km || '');
  const [status, setStatus] = useState(editing?.status || 'available');
  const [service, setService] = useState(editing?.service || '');

  function save() {
    const payload = { name: name.trim(), plate: plate.trim(), cat, year: year ? Number(year) : null, reg: reg || null, ins: ins || null, km: km ? Number(km) : 0, status, service: service || null };
    if (editing) updateVehicle(editing.id, payload);
    else addVehicle(payload);
  }

  return (
    <ModalShell title={editing ? T('edit') + ' — ' + T('vehicles') : T('vehicles')} mobile={mobile} footer={
      <>
        {editing && (
          <button onClick={() => openModal({ type: 'confirmDelete', kind: 'vehicle', id: editing.id, name: editing.name })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid ' + C.redBg, background: C.redBg, color: C.red, fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, marginRight: 'auto' }}>
            <Icon name="trash" size={15} sw={2} />{T('delete')}
          </button>
        )}
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={save} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('save')}</button>
      </>
    }>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><ModalField label={T('name')}><input value={name} onChange={e => setName(e.target.value)} placeholder="VW Golf 7" style={inputStyle()} /></ModalField></div>
        <div style={{ flex: 1 }}><ModalField label="Plate"><input value={plate} onChange={e => setPlate(e.target.value)} placeholder="01-123-AB" style={inputStyle()} /></ModalField></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><ModalField label="Category"><input value={cat} onChange={e => setCat(e.target.value)} style={inputStyle()} /></ModalField></div>
        <div style={{ flex: 1 }}><ModalField label="Year"><input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="2020" style={inputStyle()} /></ModalField></div>
        <div style={{ flex: 1 }}><ModalField label="Km"><input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder="120000" style={inputStyle()} /></ModalField></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><ModalField label="Registration until"><input type="date" value={reg} onChange={e => setReg(e.target.value)} style={inputStyle()} /></ModalField></div>
        <div style={{ flex: 1 }}><ModalField label="Insurance until"><input type="date" value={ins} onChange={e => setIns(e.target.value)} style={inputStyle()} /></ModalField></div>
      </div>
      <ModalField label="Next service"><input type="date" value={service} onChange={e => setService(e.target.value)} style={inputStyle()} /></ModalField>
      <ModalField label={T('status')}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['available', T('available')], ['in_use', T('in_use')], ['maintenance', T('maintenance')]].map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)} style={{ flex: 1, border: '1px solid ' + (status === v ? C.pri : C.line), background: status === v ? C.priBg : C.surf, color: status === v ? C.pri : C.ink2, fontSize: 12, fontWeight: 600, padding: '9px 4px', borderRadius: 9 }}>{l}</button>
          ))}
        </div>
      </ModalField>
    </ModalShell>
  );
}

function AddExamModal({ mobile }) {
  const { modal, data, closeModal, addExam, setExamStatus, openModal, T } = useApp();
  const editing = data.exams.find(x => x.id === modal.editId);
  const [studentId, setStudentId] = useState(editing?.studentId || modal.studentId || data.students[0]?.id || '');
  const [type, setType] = useState(editing?.type || 'theory');
  const [date, setDate] = useState(editing?.date || todayISO());
  const [status, setStatus] = useState(editing?.status || 'scheduled');

  if (!data.students.length) {
    return (
      <ModalShell title={T('exams')} mobile={mobile} footer={<button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>}>
        <div style={{ fontSize: 13.5, color: C.mut }}>Add a student first — exams are scheduled for a student.</div>
      </ModalShell>
    );
  }

  function save() {
    if (editing) { setExamStatus(editing.id, status); closeModal(); }
    else addExam({ studentId, type, date });
  }

  return (
    <ModalShell title={editing ? T('edit') + ' — ' + T('exams') : T('exams')} mobile={mobile} footer={
      <>
        {editing && (
          <button onClick={() => openModal({ type: 'confirmDelete', kind: 'exam', id: editing.id, name: data.students.find(s => s.id === editing.studentId)?.name || '' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid ' + C.redBg, background: C.redBg, color: C.red, fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, marginRight: 'auto' }}>
            <Icon name="trash" size={15} sw={2} />{T('delete')}
          </button>
        )}
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={save} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('save')}</button>
      </>
    }>
      <ModalField label={T('student')}>
        <div style={{ position: 'relative' }}>
          <select value={studentId} onChange={e => setStudentId(e.target.value)} disabled={!!editing} style={{ ...inputStyle(), appearance: 'none', cursor: editing ? 'default' : 'pointer', fontWeight: 600, paddingRight: 32, opacity: editing ? 0.7 : 1 }}>
            {data.students.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, top: 12, color: C.mut, pointerEvents: 'none' }}><Icon name="chevR" size={14} sw={2.2} /></span>
        </div>
      </ModalField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ModalField label="Type">
            <div style={{ display: 'flex', gap: 8 }}>
              {[['theory', T('theory')], ['practical', T('practical')]].map(([v, l]) => (
                <button key={v} disabled={!!editing} onClick={() => setType(v)} style={{ flex: 1, border: '1px solid ' + (type === v ? C.pri : C.line), background: type === v ? C.priBg : C.surf, color: type === v ? C.pri : C.ink2, fontSize: 12.5, fontWeight: 600, padding: '9px 4px', borderRadius: 9, opacity: editing ? 0.7 : 1 }}>{l}</button>
              ))}
            </div>
          </ModalField>
        </div>
        <div style={{ flex: 1 }}>
          <ModalField label={T('date')}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={!!editing} style={{ ...inputStyle(), opacity: editing ? 0.7 : 1 }} />
          </ModalField>
        </div>
      </div>
      {editing && (
        <ModalField label={T('status')}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['scheduled', T('scheduled')], ['passed', T('passed')], ['failed', T('failed')]].map(([v, l]) => (
              <button key={v} onClick={() => setStatus(v)} style={{ flex: 1, border: '1px solid ' + (status === v ? statusColor(v) : C.line), background: status === v ? statusBg(v) : C.surf, color: status === v ? statusColor(v) : C.ink2, fontSize: 12.5, fontWeight: 600, padding: '9px 4px', borderRadius: 9 }}>{l}</button>
            ))}
          </div>
        </ModalField>
      )}
    </ModalShell>
  );
}

function ConfirmDeleteModal({ mobile }) {
  const { modal, closeModal, deleteStudent, deleteInstructor, deleteVehicle, deletePayment, deleteExam, T } = useApp();
  const { kind, id, name } = modal;
  const actions = {
    student: deleteStudent, instructor: deleteInstructor, vehicle: deleteVehicle,
    payment: deletePayment, exam: deleteExam,
  };
  const labels = {
    student: T('students'), instructor: T('instructors'), vehicle: T('vehicles'),
    payment: T('payment'), exam: T('exams'),
  };

  return (
    <ModalShell title={T('delete') + ' ' + labels[kind]} mobile={mobile} footer={
      <>
        <button onClick={closeModal} style={btnGhostStyle()}>{T('cancel')}</button>
        <button onClick={() => actions[kind](id)} style={{ border: 'none', background: C.red, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10 }}>{T('delete')}</button>
      </>
    }>
      <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.6 }}>
        {name ? <>Delete <strong>{name}</strong>? This cannot be undone.</> : 'Delete this record? This cannot be undone.'}
      </div>
    </ModalShell>
  );
}

export default function Modal() {
  const { modal } = useApp();
  const mobile = useIsMobile(640);
  if (!modal) return null;
  if (modal.type === 'lessonView') return <LessonViewModal mobile={mobile} />;
  if (modal.type === 'lesson') return <NewLessonModal mobile={mobile} />;
  if (modal.type === 'payment') return <PaymentModal mobile={mobile} />;
  if (modal.type === 'student') return <AddStudentModal mobile={mobile} />;
  if (modal.type === 'instructor') return <AddInstructorModal mobile={mobile} />;
  if (modal.type === 'vehicle') return <AddVehicleModal mobile={mobile} />;
  if (modal.type === 'exam') return <AddExamModal mobile={mobile} />;
  if (modal.type === 'confirmDelete') return <ConfirmDeleteModal mobile={mobile} />;
  return null;
}
