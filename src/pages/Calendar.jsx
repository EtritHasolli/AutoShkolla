import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Badge, Button, Empty, Icon, Select, Segmented, Avatar, lessonTone } from '../components/ui.jsx';
import { hh, fmtDay, fmtLong, fmtRange, addDays, weekStart, dayShort, parseISO, weekdayIdx } from '../lib/format.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import { isStaff } from '../lib/nav.js';

function Chip({ l, compact, onOpen, draggable, onDragStart, onDragEnd }) {
  const { data, T } = useApp();
  const s = data.students.find(x => x.id === l.studentId);
  const i = data.instructors.find(x => x.id === l.instructorId);
  const v = data.vehicles.find(x => x.id === l.vehicleId);
  const color = i?.color || '#64748b';
  const off = l.status === 'cancelled' || l.status === 'no_show';
  return (
    <div className="chip-lesson" draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}
      onClick={(e) => { e.stopPropagation(); onOpen(l.id); }}
      style={{ background: color + '14', borderLeftColor: color, opacity: off ? 0.55 : 1, marginBottom: 3 }}>
      <div className="row" style={{ gap: 4 }}>
        {l.status === 'completed' && <Icon name="check" size={12} sw={3} style={{ color: 'var(--green)' }} />}
        {l.status === 'no_show' && <Icon name="alert" size={12} sw={2.4} style={{ color: 'var(--amber)' }} />}
        <span className="truncate" style={{ fontWeight: 650, color: 'var(--ink)', textDecoration: l.status === 'cancelled' ? 'line-through' : 'none' }}>{s?.name || '—'}</span>
      </div>
      {!compact && <div className="truncate" style={{ color, fontWeight: 600, fontSize: 11, marginTop: 1 }}>{(i?.name.split(' ')[0] || T('unassigned')) + (v ? ' · ' + v.plate : '')}</div>}
    </div>
  );
}

function StudentAgenda() {
  const { lessons, me, data, T, lang, today, openModal } = useApp();
  const mine = lessons.filter(l => l.studentId === me.id).sort((a, b) => (a.date + String(a.hour).padStart(2, '0')).localeCompare(b.date + String(b.hour).padStart(2, '0')));
  const upcoming = mine.filter(l => l.date >= today && l.status === 'scheduled');
  const past = mine.filter(l => !(l.date >= today && l.status === 'scheduled')).reverse();
  const Row = ({ l }) => {
    const i = data.instructors.find(x => x.id === l.instructorId);
    return (
      <button className="row-item" onClick={() => openModal({ type: 'lessonView', id: l.id })}>
        <div style={{ width: 50, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{dayShort(weekdayIdx(l.date), lang)}</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{parseISO(l.date).getDate()}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-title">{hh(l.hour)} · {i?.name || T('unassigned')}</div>
          <div className="row-sub">{l.pickup || T(l.type === 'highway' ? 'highway' : 'city_drive')}</div>
        </div>
        <Badge tone={lessonTone(l.status)} dot>{T(l.status)}</Badge>
      </button>
    );
  };
  return (
    <div className="page page-narrow">
      <Card flush title={T('upcoming')} style={{ marginBottom: 16 }}>
        {upcoming.length ? upcoming.map(l => <Row key={l.id} l={l} />) : <Empty icon="calendar" title={T('no_lessons_student')} />}
      </Card>
      {past.length > 0 && <Card flush title={T('lesson_history')}>{past.map(l => <Row key={l.id} l={l} />)}</Card>}
    </div>
  );
}

export default function Calendar() {
  const ctx = useApp();
  const { lessons: all, role, me, data, T, lang, today, hours, workDays, calWeek, setCalWeek, calDay, setCalDay, calView, setCalView,
    calFilterI, setCalFilterI, calFilterV, setCalFilterV, openModal, moveLesson, editLesson } = ctx;
  const mobile = useIsMobile(1023);
  const [dragId, setDragId] = useState(null);
  const [dropKey, setDropKey] = useState(null);
  if (role === 'student') return <StudentAgenda />;
  if (role === 'instructor' && me.missing) return null;

  const staff = isStaff(role);
  const canAdd = staff || role === 'instructor';
  const lessons = all.filter(l => (role !== 'instructor' || l.instructorId === me.id)
    && (calFilterI === 'all' || l.instructorId === calFilterI) && (calFilterV === 'all' || l.vehicleId === calFilterV));
  const weekDates = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(calWeek, i));
  const shownIdx = [0, 1, 2, 3, 4, 5, 6].filter(i => workDays.includes(i) || lessons.some(l => l.date === weekDates[i]));
  const at = (date, hour) => lessons.filter(l => l.date === date && l.hour === hour);
  const open = (id) => openModal({ type: 'lessonView', id });
  const add = (date, hour, extra = {}) => canAdd && openModal({ type: 'lesson', date, hour, ...extra });
  const shiftWeek = (n) => { setCalWeek(addDays(calWeek, n * 7)); setCalDay(addDays(calDay, n * 7)); };
  const goToday = () => { setCalWeek(weekStart(today)); setCalDay(today); };
  const view = mobile ? 'agenda' : calView;
  const dayHours = [...new Set([...hours, ...lessons.filter(l => l.date === calDay).map(l => l.hour)])].sort((a, b) => a - b);
  const weekHours = [...new Set([...hours, ...lessons.filter(l => weekDates.includes(l.date)).map(l => l.hour)])].sort((a, b) => a - b);
  const columns = view === 'day' && staff
    ? data.instructors.filter(i => calFilterI === 'all' || i.id === calFilterI)
    : null;

  const dnd = (key, onDrop) => ({
    onDragOver: (e) => { if (dragId) { e.preventDefault(); setDropKey(key); } },
    onDragLeave: () => setDropKey(k => (k === key ? null : k)),
    onDrop: (e) => { e.preventDefault(); setDropKey(null); if (dragId) onDrop(dragId); setDragId(null); },
  });
  const chipDrag = (l) => staff ? { draggable: true, onDragStart: (e) => { e.dataTransfer.effectAllowed = 'move'; setDragId(l.id); }, onDragEnd: () => { setDragId(null); setDropKey(null); } } : {};

  const toolbar = (
    <div className="row" style={{ gap: 10, flexWrap: 'wrap', padding: mobile ? '12px 16px' : '14px 28px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
      <div className="row" style={{ gap: 4 }}>
        <Button size="sm" variant="secondary" icon="chevL" onClick={() => mobile || view === 'day' ? (() => { const d = addDays(calDay, -1); setCalDay(d); setCalWeek(weekStart(d)); })() : shiftWeek(-1)} aria-label="prev" />
        <Button size="sm" variant="secondary" onClick={goToday}>{T('go_today')}</Button>
        <Button size="sm" variant="secondary" icon="chevR" onClick={() => mobile || view === 'day' ? (() => { const d = addDays(calDay, 1); setCalDay(d); setCalWeek(weekStart(d)); })() : shiftWeek(1)} aria-label="next" />
      </div>
      <div style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: '-.01em' }}>
        {view === 'week' ? fmtRange(weekDates[0], weekDates[6], lang) : fmtLong(calDay, lang)}
      </div>
      <div className="spacer" />
      {!mobile && <Segmented size="sm" value={calView} onChange={setCalView} options={[{ v: 'week', l: T('week') }, { v: 'day', l: T('day') }]} />}
      {staff && !mobile && (
        <>
          <Select value={calFilterI} onChange={e => setCalFilterI(e.target.value)} style={{ width: 'auto', height: 32, fontSize: 13 }} options={[{ v: 'all', l: T('all_instructors') }, ...data.instructors.map(i => ({ v: i.id, l: i.name }))]} />
          <Select value={calFilterV} onChange={e => setCalFilterV(e.target.value)} style={{ width: 'auto', height: 32, fontSize: 13 }} options={[{ v: 'all', l: T('all_vehicles') }, ...data.vehicles.map(v => ({ v: v.id, l: v.name }))]} />
        </>
      )}
      {canAdd && !mobile && <Button size="sm" variant="primary" icon="plus" onClick={() => add(calDay >= today ? calDay : today)}>{T('new_lesson')}</Button>}
    </div>
  );

  /* ---------------- phone: day strip + agenda ---------------- */
  if (view === 'agenda') {
    const dayLessons = lessons.filter(l => l.date === calDay);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '12px 0 12px' }}>
          <div className="row" style={{ padding: '0 16px', justifyContent: 'space-between' }}>
            <Button size="sm" variant="ghost" icon="chevL" onClick={() => shiftWeek(-1)} aria-label="prev" />
            <div style={{ fontWeight: 700 }}>{fmtRange(weekDates[0], weekDates[6], lang)}</div>
            <Button size="sm" variant="ghost" icon="chevR" onClick={() => shiftWeek(1)} aria-label="next" />
          </div>
          <div className="row" style={{ gap: 6, overflowX: 'auto', padding: '10px 16px 2px', justifyContent: 'space-between' }}>
            {weekDates.map((d, idx) => (
              <button key={d} className={'day-pill' + (d === calDay ? ' on' : '')} onClick={() => setCalDay(d)}>
                <span className="dp-d">{dayShort(idx, lang)}</span>
                <span className="dp-n" style={{ color: d === today && d !== calDay ? 'var(--brand)' : undefined }}>{parseISO(d).getDate()}</span>
                <span className="dp-dot" style={{ visibility: lessons.some(l => l.date === d && l.status !== 'cancelled') ? 'visible' : 'hidden' }} />
              </button>
            ))}
          </div>
          {staff && (
            <div style={{ padding: '10px 16px 0' }}>
              <Select value={calFilterI} onChange={e => setCalFilterI(e.target.value)} style={{ height: 36 }} options={[{ v: 'all', l: T('all_instructors') }, ...data.instructors.map(i => ({ v: i.id, l: i.name }))]} />
            </div>
          )}
        </div>
        <div className="page" style={{ width: '100%' }}>
          <div className="muted" style={{ fontWeight: 600, marginBottom: 10 }}>{fmtLong(calDay, lang)} · {T('n_lessons', { n: dayLessons.filter(l => l.status !== 'cancelled').length })}</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {dayHours.map(h => {
              const ls = dayLessons.filter(l => l.hour === h);
              return (
                <div key={h} className="row" style={{ alignItems: 'stretch', borderBottom: '1px solid var(--line-2)', minHeight: 52 }}>
                  <div className="mono muted" style={{ width: 58, padding: '14px 0 0 14px', fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{hh(h)}</div>
                  <div style={{ flex: 1, minWidth: 0, padding: 6 }}>
                    {ls.length ? ls.map(l => {
                      const s = data.students.find(x => x.id === l.studentId);
                      const i = data.instructors.find(x => x.id === l.instructorId);
                      return (
                        <button key={l.id} onClick={() => open(l.id)} className="row" style={{ width: '100%', gap: 10, border: 0, borderLeft: '3px solid ' + (i?.color || 'var(--soft)'), background: (i?.color || '#64748b') + '12', borderRadius: 10, padding: '8px 10px', marginBottom: 4, textAlign: 'left', opacity: l.status === 'cancelled' ? 0.55 : 1 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="truncate" style={{ fontWeight: 650, textDecoration: l.status === 'cancelled' ? 'line-through' : 'none' }}>{s?.name}</div>
                            <div className="truncate muted" style={{ fontSize: 12.5 }}>{role === 'instructor' ? (l.pickup || T(l.type === 'highway' ? 'highway' : 'city_drive')) : (i?.name || T('unassigned'))}</div>
                          </div>
                          <Badge tone={lessonTone(l.status)}>{T(l.status)}</Badge>
                        </button>
                      );
                    }) : canAdd ? (
                      <button onClick={() => add(calDay, h)} className="row" style={{ width: '100%', height: 40, border: '1px dashed var(--line)', background: 'transparent', borderRadius: 10, color: 'var(--soft)', fontSize: 13, fontWeight: 600, gap: 6, justifyContent: 'center' }}>
                        <Icon name="plus" size={15} sw={2.2} />{T('new_lesson')}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- desktop: day view (one column per instructor) ---------------- */
  if (view === 'day' && columns) {
    const cols = `64px repeat(${Math.max(1, columns.length)}, minmax(150px, 1fr))`;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {toolbar}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--surface)' }}>
          <div className="cal-grid cal-head" style={{ gridTemplateColumns: cols }}>
            <div />
            {columns.map(i => (
              <div key={i.id} className="row" style={{ padding: '10px 10px', borderLeft: '1px solid var(--line-2)', gap: 8 }}>
                <Avatar name={i.name} color={i.color} size={26} />
                <span className="truncate" style={{ fontWeight: 650, fontSize: 13 }}>{i.name}</span>
              </div>
            ))}
          </div>
          {dayHours.map(h => (
            <div key={h} className="cal-grid" style={{ gridTemplateColumns: cols }}>
              <div className="mono soft" style={{ textAlign: 'right', padding: '6px 10px 0 0', fontSize: 11.5, borderTop: '1px solid var(--line-2)' }}>{hh(h)}</div>
              {columns.map(i => {
                const ls = at(calDay, h).filter(l => l.instructorId === i.id);
                const key = i.id + h;
                return (
                  <div key={key} className={'cal-cell' + (!ls.length && canAdd ? ' empty-slot' : '') + (dropKey === key ? ' drop' : '')}
                    onClick={() => !ls.length && add(calDay, h, { instructorId: i.id, vehicleId: i.vehicle })}
                    {...dnd(key, (id) => {
                      const l = all.find(x => x.id === id);
                      if (!l) return;
                      if (l.instructorId === i.id) moveLesson(id, calDay, h);
                      else editLesson(id, { ...l, date: calDay, hour: h, instructorId: i.id, vehicleId: i.vehicle || l.vehicleId });
                    })}>
                    {ls.map(l => <Chip key={l.id} l={l} onOpen={open} {...chipDrag(l)} />)}
                  </div>
                );
              })}
            </div>
          ))}
          {!columns.length && <Empty icon="instructors" title={T('no_instructors')} />}
        </div>
      </div>
    );
  }

  /* ---------------- desktop: week view ---------------- */
  const days = view === 'day' ? [weekDates.indexOf(calDay)] : shownIdx;
  const cols = `64px repeat(${days.length}, minmax(0, 1fr))`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {toolbar}
      <div className="row muted" style={{ gap: 14, padding: '8px 28px', fontSize: 12, borderBottom: '1px solid var(--line-2)', background: 'var(--surface)', flexWrap: 'wrap' }}>
        {data.instructors.slice(0, 8).map(i => (
          <span key={i.id} className="row" style={{ gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: i.color }} />{i.name.split(' ')[0]}</span>
        ))}
        <span className="spacer" />
        {staff && <span className="row" style={{ gap: 5 }}><Icon name="info" size={14} />{T('drag_hint')}</span>}
      </div>
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--surface)' }}>
        <div className="cal-grid cal-head" style={{ gridTemplateColumns: cols }}>
          <div />
          {days.map(di => {
            const d = weekDates[di];
            const isToday = d === today;
            return (
              <button key={d} onClick={() => { setCalDay(d); setCalView('day'); }} style={{ border: 0, borderLeft: '1px solid var(--line-2)', background: 'transparent', padding: '10px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: isToday ? 'var(--brand)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{dayShort(di, lang)}</div>
                <div style={{ fontSize: 19, fontWeight: 750, marginTop: 1, display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: isToday ? 'var(--brand)' : 'transparent', color: isToday ? '#fff' : 'var(--ink)' }}>{parseISO(d).getDate()}</div>
              </button>
            );
          })}
        </div>
        {weekHours.map(h => (
          <div key={h} className="cal-grid" style={{ gridTemplateColumns: cols }}>
            <div className="mono soft" style={{ textAlign: 'right', padding: '6px 10px 0 0', fontSize: 11.5, borderTop: '1px solid var(--line-2)' }}>{hh(h)}</div>
            {days.map(di => {
              const d = weekDates[di];
              const ls = at(d, h);
              const key = d + h;
              return (
                <div key={key} className={'cal-cell' + (d === today ? ' today' : '') + (!ls.length && canAdd ? ' empty-slot' : '') + (dropKey === key ? ' drop' : '')}
                  onClick={() => !ls.length && add(d, h)} {...dnd(key, (id) => moveLesson(id, d, h))}>
                  {ls.map(l => <Chip key={l.id} l={l} compact={ls.length > 1} onOpen={open} {...chipDrag(l)} />)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
