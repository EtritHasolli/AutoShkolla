import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, iconBtnStyle, statusColor, statusBg } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

function LessonChip({ lesson, big, onDragStart, onDragEnd, onClick }) {
  const { data } = useApp();
  const s = data.students.find(x => x.id === lesson.studentId);
  const i = data.instructors.find(x => x.id === lesson.instructorId);
  const v = data.vehicles.find(x => x.id === lesson.vehicleId);
  const col = statusColor(lesson.status);
  const cancelled = lesson.status === 'cancelled';
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        background: statusBg(lesson.status), borderLeft: '3px solid ' + col, borderRadius: 6,
        padding: big ? '7px 9px' : '4px 7px', cursor: 'grab', height: '100%', overflow: 'hidden',
        opacity: cancelled ? 0.6 : 1, textDecoration: cancelled ? 'line-through' : 'none',
      }}
    >
      <div style={{ fontSize: big ? 13 : 12, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
      <div style={{ fontSize: big ? 11.5 : 10.5, color: col, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
        {big ? ((i ? i.name : 'Unassigned') + ' · ' + (v ? v.plate : '—')) : ((i ? i.name.split(' ')[0] : 'Unassigned') + ' · ' + (v ? v.plate : '—'))}
      </div>
    </div>
  );
}

export default function Calendar() {
  const { lessons: allLessons, role, me, calView, setCalView, calDay, setCalDay, calFilterI, setCalFilterI, calFilterV, setCalFilterV, days, todayIdx, hours, dragId, setDragId, moveLesson, openModal, data, T } = useApp();
  const isMobile = useIsMobile();
  // Instructors only see their own lessons.
  const lessons = role === 'instructor' ? allLessons.filter(l => l.instructorId === me.id) : allLessons;
  // Week view doesn't fit on phones — force day view there.
  const effView = isMobile ? 'day' : calView;

  function fmtDate(dt) { return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function fmtDay(i) { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]; }
  const visible = (l) => (calFilterI === 'all' || l.instructorId === calFilterI) && (calFilterV === 'all' || l.vehicleId === calFilterV);

  function SelectFilter({ value, onChange, opts }) {
    return (
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', border: '1px solid ' + C.line, background: C.surf, color: C.ink2, fontSize: 13, fontWeight: 600, padding: '8px 30px 8px 12px', borderRadius: 9, cursor: 'pointer' }}>
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 9, top: 10, color: C.mut, pointerEvents: 'none' }}><Icon name="chevR" size={14} sw={2.2} /></span>
      </div>
    );
  }

  const displayDays = effView === 'day' ? [calDay] : [0, 1, 2, 3, 4, 5];
  const colW = effView === 'day' ? '1fr' : `repeat(${displayDays.length},1fr)`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '14px 16px' : '18px 26px', borderBottom: '1px solid ' + C.line, background: C.surf, flexWrap: 'wrap' }}>
        {!isMobile && (
          <div style={{ display: 'flex', background: C.bg, border: '1px solid ' + C.line, borderRadius: 9, padding: 3 }}>
            {[['week', T('week')], ['day', T('day')]].map(([v, l]) => (
              <button key={v} onClick={() => setCalView(v)} style={{ border: 'none', background: calView === v ? C.surf : 'transparent', color: calView === v ? C.ink : C.mut, boxShadow: calView === v ? '0 1px 3px rgba(0,0,0,.1)' : 'none', fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 7 }}>{l}</button>
            ))}
          </div>
        )}
        {effView === 'day' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setCalDay(d => Math.max(0, d - 1))} style={iconBtnStyle()}><Icon name="chevL" size={16} sw={2.2} /></button>
            <div style={{ fontFamily: font.disp, fontWeight: 600, fontSize: 15, color: C.ink, minWidth: 128, textAlign: 'center' }}>{fmtDate(days[calDay])}</div>
            <button onClick={() => setCalDay(d => Math.min(5, d + 1))} style={iconBtnStyle()}><Icon name="chevR" size={16} sw={2.2} /></button>
          </div>
        ) : (
          <div style={{ fontFamily: font.disp, fontWeight: 600, fontSize: 15, color: C.ink }}>{fmtDate(days[0])} – {fmtDate(days[5])}</div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.mut }}>
          <Icon name="filter" size={16} sw={2} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{T('filters')}</span>
        </div>
        <SelectFilter value={calFilterI} onChange={setCalFilterI} opts={[{ v: 'all', l: T('instructor') + ': ' + T('all') }, ...data.instructors.map(i => ({ v: i.id, l: i.name }))]} />
        <SelectFilter value={calFilterV} onChange={setCalFilterV} opts={[{ v: 'all', l: T('vehicle') + ': ' + T('all') }, ...data.vehicles.map(v => ({ v: v.id, l: v.name }))]} />
        <button onClick={() => openModal({ type: 'lesson', day: calView === 'day' ? calDay : todayIdx, hour: 9, studentId: data.students[0]?.id, instructorId: data.instructors[0]?.id, vehicleId: data.vehicles[0]?.id, ltype: 'city' })}
          style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 9 }}>
          <Icon name="plus" size={16} sw={2.2} />{T('new_lesson')}
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '10px 26px', borderBottom: '1px solid ' + C.line2, background: C.surf, flexWrap: 'wrap' }}>
        {[['scheduled', 'scheduled'], ['completed', 'completed'], ['cancelled', 'cancelled'], ['no_show', 'no_show']].map(([k]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: statusColor(k) }} />
            <span style={{ fontSize: 12, color: C.mut, fontWeight: 600 }}>{T(k)}</span>
          </div>
        ))}
        <div style={{ fontSize: 12, color: C.soft, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="bolt" size={13} sw={2} /> Drag to reschedule · click slot to add
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', background: C.surf }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '56px ' + colW, borderBottom: '1px solid ' + C.line, position: 'sticky', top: 0, background: C.surf, zIndex: 5 }}>
          <div />
          {displayDays.map(d => (
            <div key={d} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid ' + C.line2 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: d === todayIdx ? C.pri : C.mut, textTransform: 'uppercase', letterSpacing: '.04em' }}>{fmtDay(d)}</div>
              <div style={{ fontFamily: font.disp, fontSize: 18, fontWeight: 700, color: d === todayIdx ? C.pri : C.ink, marginTop: 2 }}>{days[d].getDate()}</div>
            </div>
          ))}
        </div>

        {hours.map(hr => (
          <div key={hr} style={{ display: 'grid', gridTemplateColumns: '56px ' + colW, minHeight: effView === 'day' ? 64 : 58 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 6, fontFamily: font.mono, fontSize: 11.5, color: C.soft, borderTop: '1px solid ' + C.line2 }}>
              {String(hr).padStart(2, '0')}:00
            </div>
            {displayDays.map(d => {
              const ls = lessons.filter(l => l.day === d && l.hour === hr && visible(l));
              return (
                <div key={d}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (dragId) moveLesson(dragId, d, hr); }}
                  onClick={() => { if (!ls.length) openModal({ type: 'lesson', day: d, hour: hr, studentId: data.students[0]?.id, instructorId: data.instructors[0]?.id, vehicleId: data.vehicles[0]?.id, ltype: 'city' }); }}
                  style={{ borderTop: '1px solid ' + C.line2, borderLeft: '1px solid ' + C.line2, padding: 3, position: 'relative', cursor: ls.length ? 'default' : 'pointer', background: d === todayIdx ? 'rgba(15,157,107,.022)' : 'transparent' }}>
                  {ls.map(l => (
                    <LessonChip key={l.id} lesson={l} big={effView === 'day'}
                      onDragStart={() => setDragId(l.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => openModal({ type: 'lessonView', id: l.id })}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
