import React, { useState, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../AppContext.jsx';
import { Dialog, Field, Input, Select, Textarea, Choices, Button, LinkButton, Badge, Avatar, KV, Icon, LogoMark, lessonTone } from './ui.jsx';
import { fmtLong, fmtDate, hh, euro, telLink, whatsappLink, todayISO, addDays, uid } from '../lib/format.js';
import { isStaff } from '../lib/nav.js';
import { LICENCE_CATS, BRAND } from '../lib/brand.js';

const COLORS = ['#2456e6', '#7048e8', '#0e8aa6', '#c27408', '#15935a', '#d6336c', '#475569'];

/* ------------------------------------------------------------- lesson details */
function LessonView() {
  const { modal, lessons, data, T, lang, role, me, school, closeModal, openModal, openStudent, setLessonStatus, today } = useApp();
  const l = lessons.find(x => x.id === modal.id);
  if (!l) return null;
  const s = data.students.find(x => x.id === l.studentId);
  const i = data.instructors.find(x => x.id === l.instructorId);
  const v = data.vehicles.find(x => x.id === l.vehicleId);
  const staff = isStaff(role);
  const canMark = staff || (role === 'instructor' && me.id === l.instructorId);
  const isStudent = role === 'student';
  const when = l.date === today ? T('today').toLowerCase() : l.date === addDays(today, 1) ? T('tomorrow').toLowerCase() : fmtLong(l.date, lang);
  const reminder = s && T('reminder_lesson_text', { name: s.name.split(' ')[0], when, time: hh(l.hour), pickup: l.pickup || '—', school: school?.name || BRAND });
  const contact = isStudent ? i : s;

  return (
    <Dialog title={T('lesson')} onClose={closeModal} footer={
      <>
        {staff && <Button variant="danger-soft" icon="trash" onClick={() => openModal({ type: 'confirm', kind: 'lesson', id: l.id, name: s?.name })}>{T('delete')}</Button>}
        {(staff || role === 'instructor') && <Button icon="edit" onClick={() => openModal({ type: 'lesson', editId: l.id })}>{T('edit')}</Button>}
        <Button variant="primary" onClick={closeModal}>{T('close')}</Button>
      </>
    }>
      <div className="row" style={{ gap: 12, marginBottom: 14 }}>
        <Avatar name={(isStudent ? i?.name : s?.name) || '?'} size={46} color={isStudent ? i?.color : undefined} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }} className="truncate">{(isStudent ? i?.name : s?.name) || '—'}</div>
          <div className="muted" style={{ fontSize: 13 }}>{fmtLong(l.date, lang)} · <span className="mono">{hh(l.hour)}</span></div>
        </div>
        <Badge tone={lessonTone(l.status)} dot>{T(l.status)}</Badge>
      </div>

      <KV label={isStudent ? T('student') : T('instructor')} value={isStudent ? s?.name : (i?.name || T('unassigned'))} />
      <KV label={T('vehicle')} value={v ? `${v.name} · ${v.plate}` : T('no_vehicle')} />
      <KV label={T('lesson_type')} value={T(l.type === 'highway' ? 'highway' : 'city_drive')} />
      <KV label={T('pickup')} value={l.pickup || '—'} />

      {contact?.phone && (
        <div className="row" style={{ gap: 8, marginTop: 14 }}>
          <LinkButton href={telLink(contact.phone)} icon="phone" block>{T('call')}</LinkButton>
          <LinkButton href={whatsappLink(contact.phone, !isStudent && l.status === 'scheduled' ? reminder : '')} variant="whatsapp" icon="whatsapp" block>
            {!isStudent && l.status === 'scheduled' ? T('send_reminder') : T('whatsapp')}
          </LinkButton>
        </div>
      )}

      {canMark && (
        <>
          <div className="field-label" style={{ marginTop: 18 }}>{T('set_status')}</div>
          <div className="grid-2" style={{ gap: 8 }}>
            {[['completed', 'checkCircle'], ['no_show', 'alert'], ['cancelled', 'x'], ['scheduled', 'clock']].map(([st, ic]) => (
              <Button key={st} variant={l.status === st ? 'soft' : st === 'completed' ? 'success' : 'secondary'} icon={ic} onClick={() => setLessonStatus(l.id, st)} disabled={l.status === st}>
                {T(st === 'completed' ? 'mark_completed' : st === 'no_show' ? 'mark_no_show' : st === 'cancelled' ? 'mark_cancel' : 'mark_scheduled')}
              </Button>
            ))}
          </div>
        </>
      )}

      {isStudent && l.status === 'scheduled' && l.date >= today && (
        <Button variant="danger-soft" block icon="x" style={{ marginTop: 16 }} onClick={() => setLessonStatus(l.id, 'cancelled')}>{T('cancel_lesson')}</Button>
      )}

      {!isStudent && s && (
        <Button variant="ghost" block iconRight="chevR" style={{ marginTop: 10 }} onClick={() => openStudent(s.id)}>{T('open_profile')}</Button>
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------- lesson form */
function LessonForm() {
  const { modal, lessons, data, T, lang, role, me, hours, today, calDay, closeModal, createLessons, editLesson, conflictFor } = useApp();
  const editing = modal.editId ? lessons.find(l => l.id === modal.editId) : null;
  const pool = role === 'instructor' ? data.students.filter(s => s.instructorId === me.id) : data.students;
  const nowH = new Date().getHours() + 1;
  const defHour = hours.find(h => h >= nowH) ?? hours[0];
  const firstStudent = data.students.find(s => s.id === modal.studentId) || pool[0];
  const insFor = (s) => (role === 'instructor' ? me.id : null) || modal.instructorId || s?.instructorId || data.instructors[0]?.id || '';
  const vehFor = (iid) => data.instructors.find(i => i.id === iid)?.vehicle || data.vehicles[0]?.id || '';

  const [f, setF] = useState(() => editing ? {
    studentId: editing.studentId, instructorId: editing.instructorId, vehicleId: editing.vehicleId || '',
    date: editing.date, hour: editing.hour, type: editing.type, pickup: editing.pickup, repeat: 1,
  } : (() => {
    const iid = insFor(firstStudent);
    return {
      studentId: firstStudent?.id || '', instructorId: iid, vehicleId: modal.vehicleId || vehFor(iid),
      date: modal.date || (calDay >= today ? calDay : today), hour: modal.hour ?? defHour, type: 'city', pickup: '', repeat: 1,
    };
  })());
  const set = (p) => setF(prev => ({ ...prev, ...p }));

  const conflict = useMemo(() => f.studentId && f.instructorId
    ? conflictFor({ ...f, hour: Number(f.hour), vehicleId: f.vehicleId || null }, editing?.id) : null, [f, conflictFor, editing]);

  if (!data.students.length || !data.instructors.length) {
    return (
      <Dialog title={T('new_lesson')} onClose={closeModal} footer={<Button onClick={closeModal}>{T('close')}</Button>}>
        <p className="muted">{!data.students.length ? T('err_add_student_first') : T('err_add_instructor_first')}</p>
      </Dialog>
    );
  }

  const hourOpts = [...new Set([...hours, Number(f.hour)])].sort((a, b) => a - b).map(h => ({ v: String(h), l: hh(h) }));
  function save() {
    const m = { ...f, hour: Number(f.hour) };
    if (editing) editLesson(editing.id, m); else createLessons(m);
  }

  return (
    <Dialog title={editing ? T('edit') + ' · ' + T('lesson').toLowerCase() : T('new_lesson')} onClose={closeModal} footer={
      <>
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" onClick={save} disabled={!!conflict && Number(f.repeat) === 1}>{T('save')}</Button>
      </>
    }>
      <Field label={T('student')}>
        <Select value={f.studentId} onChange={e => {
          const s = data.students.find(x => x.id === e.target.value);
          const iid = role === 'instructor' ? me.id : (s?.instructorId || f.instructorId);
          set({ studentId: e.target.value, instructorId: iid, vehicleId: iid !== f.instructorId ? vehFor(iid) : f.vehicleId });
        }} options={pool.map(s => ({ v: s.id, l: s.name + (s.remaining <= 0 ? ' ✓' : '') }))} />
      </Field>
      <div className="form-row">
        <Field label={T('date')}><Input type="date" value={f.date} min={editing ? undefined : todayISO()} onChange={e => set({ date: e.target.value })} /></Field>
        <Field label={T('time')}><Select value={String(f.hour)} onChange={e => set({ hour: Number(e.target.value) })} options={hourOpts} /></Field>
      </div>
      {f.date && <div className="field-hint" style={{ marginTop: -8, marginBottom: 12 }}>{fmtLong(f.date, lang)}</div>}
      <div className="form-row">
        <Field label={T('instructor')}>
          <Select value={f.instructorId} disabled={role === 'instructor'} onChange={e => set({ instructorId: e.target.value, vehicleId: vehFor(e.target.value) })}
            options={data.instructors.map(i => ({ v: i.id, l: i.name }))} />
        </Field>
        <Field label={T('vehicle')}>
          <Select value={f.vehicleId} onChange={e => set({ vehicleId: e.target.value })}
            options={[{ v: '', l: T('no_vehicle') }, ...data.vehicles.map(v => ({ v: v.id, l: `${v.name} · ${v.plate}`, disabled: v.status === 'maintenance' && v.id !== f.vehicleId }))]} />
        </Field>
      </div>
      {conflict && (
        <div className="badge tone-red" style={{ display: 'flex', borderRadius: 10, padding: '9px 12px', marginBottom: 14, whiteSpace: 'normal' }}>
          <Icon name="alert" size={16} sw={2} />{T(conflict)}
        </div>
      )}
      <Field label={T('lesson_type')}>
        <Choices value={f.type} onChange={v => set({ type: v })} options={[{ v: 'city', l: T('city_drive') }, { v: 'highway', l: T('highway') }]} />
      </Field>
      <Field label={T('pickup')}><Input value={f.pickup} onChange={e => set({ pickup: e.target.value })} placeholder={T('pickup_ph')} /></Field>
      {!editing && (
        <Field label={T('repeat')}>
          <Select value={String(f.repeat)} onChange={e => set({ repeat: Number(e.target.value) })}
            options={[{ v: '1', l: T('repeat_once') }, ...[2, 3, 4, 6, 8, 10, 12].map(n => ({ v: String(n), l: T('repeat_weeks', { n }) }))]} />
        </Field>
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------ payment form */
function PaymentForm() {
  const { modal, data, T, closeModal, recordPayment } = useApp();
  const owing = [...data.students].sort((a, b) => b.due - a.due);
  const [studentId, setStudentId] = useState(modal.studentId || owing[0]?.id || '');
  const s = data.students.find(x => x.id === studentId);
  const [amount, setAmount] = useState(s?.due ? String(s.due) : '');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  if (!data.students.length) {
    return <Dialog title={T('record_payment')} onClose={closeModal} footer={<Button onClick={closeModal}>{T('close')}</Button>}><p className="muted">{T('err_add_student_first')}</p></Dialog>;
  }
  return (
    <Dialog title={T('record_payment')} onClose={closeModal} footer={
      <>
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" onClick={() => recordPayment({ studentId, amount, method, date, note })}>{T('record_payment')}</Button>
      </>
    }>
      <div className="badge tone-brand" style={{ display: 'flex', borderRadius: 10, padding: '9px 12px', marginBottom: 16, whiteSpace: 'normal', fontWeight: 550 }}>
        <Icon name="info" size={16} sw={2} />{T('manual_payment')}
      </div>
      <Field label={T('student')}>
        <Select value={studentId} onChange={e => { setStudentId(e.target.value); const st = data.students.find(x => x.id === e.target.value); setAmount(st?.due ? String(st.due) : ''); }}
          options={owing.map(st => ({ v: st.id, l: st.name + (st.due > 0 ? ` — ${T('due_amount').toLowerCase()} ${euro(st.due)}` : ' ✓') }))} />
      </Field>
      <div className="form-row">
        <Field label={T('amount') + ' (€)'}><Input type="number" inputMode="decimal" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
        <Field label={T('date')}><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      </div>
      <Field label={T('method')}>
        <Choices value={method} onChange={setMethod} options={[{ v: 'cash', l: T('cash') }, { v: 'bank', l: T('bank') }, { v: 'other', l: T('other') }]} />
      </Field>
      <Field label={T('note')}><Input value={note} onChange={e => setNote(e.target.value)} placeholder={T('optional')} /></Field>
    </Dialog>
  );
}

/* -------------------------------------------------------------------- receipt */
export function Receipt({ payment, student, school, T, lang }) {
  const no = 'R-' + payment.date.replace(/-/g, '').slice(2) + '-' + String(payment.id).replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase();
  return (
    <div className="print-area" style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 20, background: '#fff' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <LogoMark size={40} logo={school?.logo} />
          <div>
            <div style={{ fontWeight: 750, fontSize: 16 }}>{school?.name || BRAND}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{[school?.address, school?.city].filter(Boolean).join(', ')}</div>
            {school?.phone && <div className="muted" style={{ fontSize: 12.5 }}>{school.phone}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{T('receipt_title')}</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{T('receipt_no')} {no}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>{fmtDate(payment.date, lang)}</div>
        </div>
      </div>
      <div style={{ margin: '18px 0', padding: '16px 0', borderTop: '1px dashed var(--line)', borderBottom: '1px dashed var(--line)', textAlign: 'center' }}>
        <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{T('amount')}</div>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em' }} className="tnum">{euro(payment.amount)}</div>
        <div className="muted" style={{ fontSize: 13 }}>{T(payment.method)}</div>
      </div>
      <KV label={T('received_from')} value={student?.name || '—'} />
      {student && <KV label={T('for_package')} value={(student.packageName ? student.packageName + ' · ' : '') + T('n_lessons', { n: student.total })} />}
      {student && <KV label={T('paid_amount')} value={euro(student.paid) + ' / ' + euro(student.price)} />}
      {student && <KV label={T('balance_after')} value={euro(student.due)} valueStyle={{ color: student.due > 0 ? 'var(--red)' : 'var(--green)' }} />}
      {payment.note && <KV label={T('note')} value={payment.note} />}
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 26, fontSize: 12.5 }}>
        <span className="muted">{T('thank_you')}</span>
        <span className="muted" style={{ borderTop: '1px solid var(--soft)', paddingTop: 4, minWidth: 140, textAlign: 'center' }}>{T('signature')}</span>
      </div>
    </div>
  );
}

function ReceiptDialog() {
  const { modal, data, T, lang, school, closeModal } = useApp();
  const p = modal.payment;
  const s = data.students.find(x => x.id === p.studentId);
  const native = Capacitor.isNativePlatform();
  const text = T('receipt_text', { school: school?.name || BRAND, name: s?.name || '', amount: euro(p.amount), date: fmtDate(p.date, lang), method: T(p.method).toLowerCase(), due: euro(s?.due || 0) });
  async function share() {
    const { Share } = await import('@capacitor/share');
    try { await Share.share({ title: T('receipt_title'), text }); } catch { /* cancelled */ }
  }
  return (
    <Dialog title={T('receipt')} onClose={closeModal} footer={
      <>
        {s?.phone && <LinkButton href={whatsappLink(s.phone, text)} variant="whatsapp" icon="whatsapp">{T('whatsapp')}</LinkButton>}
        {native ? <Button icon="external" onClick={share}>{T('share')}</Button> : <Button icon="printer" onClick={() => window.print()}>{T('print')}</Button>}
        <Button variant="primary" onClick={closeModal}>{T('done')}</Button>
      </>
    }>
      <Receipt payment={p} student={s} school={school} T={T} lang={lang} />
    </Dialog>
  );
}

/* ------------------------------------------------------------------ student */
function StudentForm() {
  const { modal, data, T, closeModal, addStudent, updateStudent, openModal } = useApp();
  const editing = modal.editId ? data.students.find(s => s.id === modal.editId) : null;
  const pkgs = data.packages;
  const initialPkg = editing ? (pkgs.find(p => p.name === editing.packageName && p.lessons === editing.total)?.id || 'custom') : (modal.packageId || pkgs.find(p => p.popular)?.id || pkgs[0]?.id || 'custom');
  const [f, setF] = useState(() => ({
    name: editing?.name || '', phone: editing?.phone || '', email: editing?.email || '', cat: editing?.cat || 'B',
    instructorId: editing ? (editing.instructorId || '') : (data.instructors[0]?.id || ''),
    pkg: initialPkg,
    total: editing?.total || pkgs.find(p => p.id === initialPkg)?.lessons || 20,
    price: editing?.price ?? pkgs.find(p => p.id === initialPkg)?.price ?? 0,
    notes: '',
  }));
  const set = (p) => setF(prev => ({ ...prev, ...p }));
  function pickPkg(id) {
    const p = pkgs.find(x => x.id === id);
    set(p ? { pkg: id, total: p.lessons, price: p.price, cat: p.cat || f.cat } : { pkg: 'custom' });
  }
  function save() {
    const p = pkgs.find(x => x.id === f.pkg);
    const payload = { name: f.name, phone: f.phone, email: f.email, cat: f.cat, instructorId: f.instructorId || null, total: Number(f.total), price: Number(f.price), packageName: p ? p.name : '' };
    if (editing) updateStudent(editing.id, payload);
    else addStudent({ ...payload, notes: f.notes });
  }
  const catOpts = [...new Set([...LICENCE_CATS, f.cat])].map(c => ({ v: c, l: T('cat_' + c) !== 'cat_' + c ? T('cat_' + c) : c }));

  return (
    <Dialog title={editing ? T('edit_student') : T('add_student')} onClose={closeModal} footer={
      <>
        {editing && <Button variant="danger-soft" icon="trash" onClick={() => openModal({ type: 'confirm', kind: 'student', id: editing.id, name: editing.name })} style={{ marginRight: 'auto' }}>{T('delete')}</Button>}
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" onClick={save}>{T('save')}</Button>
      </>
    }>
      <Field label={T('full_name')}><Input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="Emri Mbiemri" autoFocus /></Field>
      <div className="form-row">
        <Field label={T('phone')}><Input type="tel" value={f.phone} onChange={e => set({ phone: e.target.value })} placeholder="+383 44 …" /></Field>
        <Field label={T('category')}><Select value={f.cat} onChange={e => set({ cat: e.target.value })} options={catOpts} /></Field>
      </div>
      <Field label={T('email_invite_student')}><Input type="email" value={f.email} onChange={e => set({ email: e.target.value })} placeholder="kandidati@email.com" /></Field>
      <Field label={T('instructor')}>
        <Select value={f.instructorId} onChange={e => set({ instructorId: e.target.value })} options={[{ v: '', l: T('unassigned') }, ...data.instructors.map(i => ({ v: i.id, l: i.name }))]} />
      </Field>
      <Field label={T('package')}>
        <Choices value={f.pkg} onChange={pickPkg} options={[...pkgs.map(p => ({ v: p.id, l: `${p.name} · ${p.lessons}` })), { v: 'custom', l: T('custom') }]} />
      </Field>
      <div className="form-row">
        <Field label={T('lessons_in_package')}><Input type="number" min="1" value={f.total} onChange={e => set({ total: e.target.value, pkg: 'custom' })} /></Field>
        <Field label={T('custom_price')}><Input type="number" min="0" value={f.price} onChange={e => set({ price: e.target.value, pkg: 'custom' })} /></Field>
      </div>
      {!editing && <Field label={T('notes')}><Textarea rows={2} value={f.notes} onChange={e => set({ notes: e.target.value })} placeholder={T('notes_ph')} /></Field>}
    </Dialog>
  );
}

/* --------------------------------------------------------------- instructor */
function InstructorForm() {
  const { modal, data, T, closeModal, saveInstructor, openModal } = useApp();
  const editing = modal.editId ? data.instructors.find(i => i.id === modal.editId) : null;
  const [f, setF] = useState({
    name: editing?.name || '', phone: editing?.phone || '', email: editing?.email || '', cat: editing?.cat || 'B',
    color: editing?.color || COLORS[data.instructors.length % COLORS.length], vehicleId: editing?.vehicle || '',
  });
  const set = (p) => setF(prev => ({ ...prev, ...p }));
  return (
    <Dialog title={editing ? T('edit_instructor') : T('add_instructor')} onClose={closeModal} footer={
      <>
        {editing && <Button variant="danger-soft" icon="trash" onClick={() => openModal({ type: 'confirm', kind: 'instructor', id: editing.id, name: editing.name })} style={{ marginRight: 'auto' }}>{T('delete')}</Button>}
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" onClick={() => saveInstructor(editing?.id, f)}>{T('save')}</Button>
      </>
    }>
      <Field label={T('full_name')}><Input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="Emri Mbiemri" autoFocus /></Field>
      <div className="form-row">
        <Field label={T('phone')}><Input type="tel" value={f.phone} onChange={e => set({ phone: e.target.value })} placeholder="+383 44 …" /></Field>
        <Field label={T('categories')}><Input value={f.cat} onChange={e => set({ cat: e.target.value })} placeholder="B, C" /></Field>
      </div>
      <Field label={T('email_invite_instructor')}><Input type="email" value={f.email} onChange={e => set({ email: e.target.value })} placeholder="instruktori@email.com" /></Field>
      <Field label={T('default_vehicle')}>
        <Select value={f.vehicleId} onChange={e => set({ vehicleId: e.target.value })} options={[{ v: '', l: T('no_vehicle') }, ...data.vehicles.map(v => ({ v: v.id, l: `${v.name} · ${v.plate}` }))]} />
      </Field>
      <Field label={T('calendar_color')}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => set({ color: c })} aria-label={c}
              style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: 0, boxShadow: f.color === c ? '0 0 0 3px #fff, 0 0 0 5px ' + c : 'none' }} />
          ))}
        </div>
      </Field>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ vehicle */
function VehicleForm() {
  const { modal, data, T, closeModal, saveVehicle, openModal } = useApp();
  const editing = modal.editId ? data.vehicles.find(v => v.id === modal.editId) : null;
  const [f, setF] = useState({
    name: editing?.name || '', plate: editing?.plate || '', cat: editing?.cat || 'B', year: editing?.year || '',
    km: editing?.km || '', reg: editing?.reg || '', ins: editing?.ins || '', service: editing?.service || '', status: editing?.status || 'available',
  });
  const set = (p) => setF(prev => ({ ...prev, ...p }));
  const payload = () => ({ ...f, name: f.name.trim(), plate: f.plate.trim().toUpperCase(), year: f.year ? Number(f.year) : null, km: f.km ? Number(f.km) : 0, reg: f.reg || null, ins: f.ins || null, service: f.service || null });
  return (
    <Dialog title={editing ? T('edit_vehicle') : T('add_vehicle')} onClose={closeModal} footer={
      <>
        {editing && <Button variant="danger-soft" icon="trash" onClick={() => openModal({ type: 'confirm', kind: 'vehicle', id: editing.id, name: editing.name })} style={{ marginRight: 'auto' }}>{T('delete')}</Button>}
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" onClick={() => saveVehicle(editing?.id, payload())}>{T('save')}</Button>
      </>
    }>
      <div className="form-row">
        <Field label={T('vehicle_name')}><Input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="VW Golf 7" autoFocus /></Field>
        <Field label={T('plate')}><Input value={f.plate} onChange={e => set({ plate: e.target.value })} placeholder="01-123-AB" /></Field>
      </div>
      <div className="form-row-3">
        <Field label={T('category')}><Select value={f.cat} onChange={e => set({ cat: e.target.value })} options={[...new Set([...LICENCE_CATS, f.cat])].map(c => ({ v: c, l: c }))} /></Field>
        <Field label={T('year')}><Input type="number" value={f.year} onChange={e => set({ year: e.target.value })} placeholder="2020" /></Field>
        <Field label={T('km')}><Input type="number" value={f.km} onChange={e => set({ km: e.target.value })} placeholder="120000" /></Field>
      </div>
      <div className="form-row-3">
        <Field label={T('insurance')}><Input type="date" value={f.ins} onChange={e => set({ ins: e.target.value })} /></Field>
        <Field label={T('registration')}><Input type="date" value={f.reg} onChange={e => set({ reg: e.target.value })} /></Field>
        <Field label={T('next_service')}><Input type="date" value={f.service} onChange={e => set({ service: e.target.value })} /></Field>
      </div>
      <Field label={T('status')}>
        <Choices value={f.status} onChange={v => set({ status: v })} options={['available', 'in_use', 'maintenance'].map(s => ({ v: s, l: T(s) }))} />
      </Field>
    </Dialog>
  );
}

/* --------------------------------------------------------------------- exam */
function ExamForm() {
  const { modal, data, T, closeModal, addExam, updateExam, openModal } = useApp();
  const editing = modal.editId ? data.exams.find(e => e.id === modal.editId) : null;
  const [studentId, setStudentId] = useState(editing?.studentId || modal.studentId || data.students[0]?.id || '');
  const [type, setType] = useState(editing?.type || modal.examType || 'theory');
  const [date, setDate] = useState(editing?.date || addDays(todayISO(), 7));
  const [status, setStatus] = useState(editing?.status || 'scheduled');
  if (!data.students.length) {
    return <Dialog title={T('schedule_exam')} onClose={closeModal} footer={<Button onClick={closeModal}>{T('close')}</Button>}><p className="muted">{T('err_add_student_first')}</p></Dialog>;
  }
  const sname = data.students.find(s => s.id === studentId)?.name;
  return (
    <Dialog title={editing ? T('edit_exam') : T('schedule_exam')} onClose={closeModal} footer={
      <>
        {editing && <Button variant="danger-soft" icon="trash" onClick={() => openModal({ type: 'confirm', kind: 'exam', id: editing.id, name: sname })} style={{ marginRight: 'auto' }}>{T('delete')}</Button>}
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" onClick={() => editing ? updateExam(editing.id, { type, date, status }) : addExam({ studentId, type, date })}>{T('save')}</Button>
      </>
    }>
      <Field label={T('student')}>
        <Select value={studentId} disabled={!!editing} onChange={e => setStudentId(e.target.value)} options={data.students.map(s => ({ v: s.id, l: s.name }))} />
      </Field>
      <Field label={T('type')}>
        <Choices value={type} onChange={setType} options={[{ v: 'theory', l: T('theory_exam') }, { v: 'practical', l: T('practical_exam') }]} />
      </Field>
      <Field label={T('date')}><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      {editing && (
        <Field label={T('result')}>
          <Choices value={status} onChange={setStatus} options={[{ v: 'scheduled', l: T('scheduled') }, { v: 'passed', l: T('passed'), icon: 'check' }, { v: 'failed', l: T('failed'), icon: 'x' }]} />
        </Field>
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------------ package */
function PackageForm() {
  const { modal, data, T, closeModal, savePackages, openModal } = useApp();
  const list = data.packages;
  const editing = modal.editId ? list.find(p => p.id === modal.editId) : null;
  const [f, setF] = useState({
    name: editing?.name || '', cat: editing?.cat || 'B', lessons: editing?.lessons || 30, price: editing?.price || 360,
    features: (editing?.features || []).join('\n'), popular: !!editing?.popular,
  });
  const set = (p) => setF(prev => ({ ...prev, ...p }));
  async function save() {
    if (!f.name.trim()) return;
    const pkg = { id: editing?.id || uid('pk-'), name: f.name.trim(), cat: f.cat, lessons: Number(f.lessons) || 1, price: Number(f.price) || 0, popular: f.popular, features: f.features.split('\n').map(x => x.trim()).filter(Boolean) };
    let next = editing ? list.map(p => p.id === editing.id ? pkg : p) : [...list, pkg];
    if (pkg.popular) next = next.map(p => p.id === pkg.id ? p : { ...p, popular: false });
    await savePackages(next);
    closeModal();
  }
  return (
    <Dialog title={editing ? T('edit_package') : T('add_package')} onClose={closeModal} footer={
      <>
        {editing && <Button variant="danger-soft" icon="trash" onClick={() => openModal({ type: 'confirm', kind: 'package', id: editing.id, name: editing.name })} style={{ marginRight: 'auto' }}>{T('delete')}</Button>}
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" disabled={!f.name.trim()} onClick={save}>{T('save')}</Button>
      </>
    }>
      <div className="form-row">
        <Field label={T('package_name')}><Input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="Standard" autoFocus /></Field>
        <Field label={T('category')}><Select value={f.cat} onChange={e => set({ cat: e.target.value })} options={LICENCE_CATS.map(c => ({ v: c, l: c }))} /></Field>
      </div>
      <div className="form-row">
        <Field label={T('lessons_in_package')}><Input type="number" min="1" value={f.lessons} onChange={e => set({ lessons: e.target.value })} /></Field>
        <Field label={T('custom_price')}><Input type="number" min="0" value={f.price} onChange={e => set({ price: e.target.value })} /></Field>
      </div>
      <Field label={T('package_features')}><Textarea rows={4} value={f.features} onChange={e => set({ features: e.target.value })} placeholder={'30 orë vozitjeje\nMateriale teorike'} /></Field>
      <label className="check"><input type="checkbox" checked={f.popular} onChange={e => set({ popular: e.target.checked })} />{T('mark_popular')}</label>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ confirm */
function ConfirmDialog() {
  const { modal, T, closeModal, deleteStudent, deleteInstructor, deleteVehicle, deletePayment, deleteExam, deleteLesson, deleteCourse, savePackages, data } = useApp();
  const actions = {
    student: deleteStudent, instructor: deleteInstructor, vehicle: deleteVehicle, payment: deletePayment,
    exam: deleteExam, lesson: deleteLesson,
    course: (id) => { deleteCourse(id); closeModal(); },
    package: async (id) => { await savePackages(data.packages.filter(p => p.id !== id)); closeModal(); },
  };
  return (
    <Dialog title={T('delete')} onClose={closeModal} footer={
      <>
        <Button onClick={closeModal}>{T('cancel')}</Button>
        <Button variant="danger" icon="trash" onClick={() => actions[modal.kind](modal.id)}>{T('yes_delete')}</Button>
      </>
    }>
      <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
        {modal.name ? T('confirm_delete', { name: modal.name }) : T('confirm_delete_generic')}
      </p>
    </Dialog>
  );
}

export default function Modal() {
  const { modal } = useApp();
  if (!modal) return null;
  switch (modal.type) {
    case 'lessonView': return <LessonView />;
    case 'lesson': return <LessonForm key={modal.editId || 'new'} />;
    case 'payment': return <PaymentForm />;
    case 'receipt': return <ReceiptDialog />;
    case 'student': return <StudentForm />;
    case 'instructor': return <InstructorForm />;
    case 'vehicle': return <VehicleForm />;
    case 'exam': return <ExamForm />;
    case 'package': return <PackageForm />;
    case 'confirm': return <ConfirmDialog />;
    default: return null;
  }
}
