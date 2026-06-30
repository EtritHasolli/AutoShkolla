import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, EmptyRow } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ============================================================= */
/* LIST                                                          */
/* ============================================================= */
function CourseList({ onEdit, onTake }) {
  const { courses, deleteCourse, T } = useApp();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.ink }}>{T('courses')}</div>
          <div style={{ fontSize: 13.5, color: C.mut, marginTop: 2 }}>{courses.length} {T('courses').toLowerCase()}</div>
        </div>
        <button onClick={() => onEdit(null)} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 15px', borderRadius: 9, cursor: 'pointer' }}>
          <Icon name="plus" size={16} sw={2.2} /> {T('new_course')}
        </button>
      </div>

      {courses.length === 0 ? (
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 14 }}><EmptyRow msg={T('no_courses')} /></div>
      ) : (
        <div className="df-grid-auto">
          {courses.map(c => (
            <div key={c.id} className="df-card-hover" style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: C.priBg, color: C.pri, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="courses" size={22} sw={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font.disp, fontSize: 16, fontWeight: 700, color: C.ink }}>{c.title}</div>
                  <div style={{ fontSize: 12.5, color: C.mut, marginTop: 2 }}>{c.questions.length} {T('questions').toLowerCase()}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, flex: 1, marginBottom: 16 }}>{c.desc}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onTake(c.id)} disabled={c.questions.length === 0} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', background: c.questions.length ? C.pri : C.line, color: c.questions.length ? '#fff' : C.mut, fontSize: 13, fontWeight: 600, padding: '9px', borderRadius: 9, cursor: c.questions.length ? 'pointer' : 'not-allowed' }}>
                  <Icon name="exams" size={15} sw={1.9} /> {T('take_quiz')}
                </button>
                <button onClick={() => onEdit(c.id)} title={T('edit')} style={{ border: '1px solid ' + C.line, background: C.surf, color: C.ink2, padding: '9px 11px', borderRadius: 9, cursor: 'pointer', display: 'flex' }}>
                  <Icon name="edit" size={16} sw={1.9} />
                </button>
                <button onClick={() => { if (confirm('Delete this course?')) deleteCourse(c.id); }} title={T('delete')} style={{ border: '1px solid ' + C.line, background: C.surf, color: C.red, padding: '9px 11px', borderRadius: 9, cursor: 'pointer', display: 'flex' }}>
                  <Icon name="trash" size={16} sw={1.9} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ============================================================= */
/* EDITOR                                                        */
/* ============================================================= */
function QuestionEditor({ q, onChange, onRemoveQ }) {
  const { T } = useApp();
  const fileRef = useRef(null);

  function setField(k, v) { onChange({ ...q, [k]: v }); }
  function setOption(oid, patch) {
    onChange({ ...q, options: q.options.map(o => o.id === oid ? { ...o, ...patch } : o) });
  }
  function addOption() {
    onChange({ ...q, options: [...q.options, { id: uid('o'), text: '', correct: false }] });
  }
  function removeOption(oid) {
    onChange({ ...q, options: q.options.filter(o => o.id !== oid) });
  }
  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setField('image', ev.target.result);
    reader.readAsDataURL(file);
  }

  const inp = { width: '100%', border: '1px solid ' + C.line, background: '#f9fafb', color: C.ink, fontSize: 13.5, padding: '10px 12px', borderRadius: 9, outline: 'none', fontFamily: font.body, boxSizing: 'border-box' };

  return (
    <div style={{ border: '1px solid ' + C.line, borderRadius: 14, padding: '18px', marginBottom: 14, background: C.surf }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.mut }}>{T('question')}</div>
        <button onClick={onRemoveQ} style={{ border: 'none', background: 'transparent', color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, fontFamily: font.body }}>
          <Icon name="trash" size={15} sw={1.9} /> {T('delete')}
        </button>
      </div>

      <textarea value={q.text} onChange={e => setField('text', e.target.value)} placeholder={T('question_text')} rows={2} style={{ ...inp, resize: 'vertical', marginBottom: 12 }} />

      {/* Image */}
      <div style={{ marginBottom: 14 }}>
        {q.image ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={q.image} alt="" style={{ maxHeight: 140, borderRadius: 10, border: '1px solid ' + C.line, display: 'block' }} />
            <button onClick={() => setField('image', null)} style={{ position: 'absolute', top: 6, right: 6, border: 'none', background: 'rgba(12,16,24,.7)', color: '#fff', width: 26, height: 26, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={15} sw={2} />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px dashed ' + C.line, background: C.bg, color: C.mut, fontSize: 12.5, fontWeight: 600, padding: '8px 13px', borderRadius: 9, cursor: 'pointer', fontFamily: font.body }}>
            <Icon name="image" size={16} sw={1.8} /> {T('image_optional')}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
      </div>

      {/* Options */}
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 8 }}>{T('options')} <span style={{ color: C.mut, fontWeight: 500 }}>· {T('select_all_apply').toLowerCase()}</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.options.map(o => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setOption(o.id, { correct: !o.correct })} title={T('correct')} style={{ width: 26, height: 26, borderRadius: 7, border: '2px solid ' + (o.correct ? C.grn : C.line), background: o.correct ? C.grn : C.surf, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {o.correct && <Icon name="check" size={15} sw={2.6} />}
            </button>
            <input value={o.text} onChange={e => setOption(o.id, { text: e.target.value })} placeholder="Option text" style={{ ...inp, flex: 1 }} />
            <button onClick={() => removeOption(o.id)} disabled={q.options.length <= 2} style={{ border: 'none', background: 'transparent', color: q.options.length <= 2 ? C.line : C.mut, cursor: q.options.length <= 2 ? 'not-allowed' : 'pointer', display: 'flex', padding: 4, flexShrink: 0 }}>
              <Icon name="x" size={17} sw={2} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addOption} style={{ marginTop: 10, border: 'none', background: 'transparent', color: C.pri, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: font.body, padding: 0 }}>
        <Icon name="plus" size={15} sw={2.2} /> {T('add_option')}
      </button>
    </div>
  );
}

function CourseEditor({ courseId, onDone }) {
  const { courses, saveCourse, T } = useApp();
  const existing = courses.find(c => c.id === courseId);
  const [title, setTitle] = useState(existing?.title || '');
  const [desc, setDesc] = useState(existing?.desc || '');
  const [questions, setQuestions] = useState(existing?.questions || []);

  function addQuestion() {
    setQuestions(qs => [...qs, {
      id: uid('q'), text: '', image: null, explanation: '',
      options: [{ id: uid('o'), text: '', correct: false }, { id: uid('o'), text: '', correct: false }],
    }]);
  }
  function updateQuestion(idx, q) { setQuestions(qs => qs.map((x, i) => i === idx ? q : x)); }
  function removeQuestion(idx) { setQuestions(qs => qs.filter((_, i) => i !== idx)); }

  function handleSave() {
    if (!title.trim()) return;
    saveCourse({ id: existing?.id || uid('c'), title: title.trim(), desc: desc.trim(), questions });
    onDone();
  }

  const inp = { width: '100%', border: '1px solid ' + C.line, background: '#f9fafb', color: C.ink, fontSize: 14, padding: '11px 14px', borderRadius: 10, outline: 'none', fontFamily: font.body, boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button onClick={onDone} style={{ border: 'none', background: 'none', color: C.mut, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 5, fontFamily: font.body }}>
        <Icon name="chevL" size={16} sw={2} /> {T('courses')}
      </button>

      <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 18 }}>
        {existing ? T('edit') + ' ' + T('course').toLowerCase() : T('new_course')}
      </div>

      <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 14, padding: '18px', marginBottom: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>{T('course_title')}</div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Road Signs & Signals" style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>{T('course_desc')}</div>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Short description" style={{ ...inp, resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: font.disp, fontSize: 16, fontWeight: 700, color: C.ink }}>{T('questions')} ({questions.length})</div>
      </div>

      {questions.length === 0 && (
        <div style={{ background: C.surf, border: '1px dashed ' + C.line, borderRadius: 14, padding: '28px', textAlign: 'center', color: C.soft, fontSize: 13.5, marginBottom: 14 }}>{T('no_questions')}</div>
      )}

      {questions.map((q, i) => (
        <QuestionEditor key={q.id} q={q} onChange={(nq) => updateQuestion(i, nq)} onRemoveQ={() => removeQuestion(i)} />
      ))}

      <button onClick={addQuestion} style={{ width: '100%', border: '1px dashed ' + C.pri, background: C.priBg, color: C.pri, fontSize: 14, fontWeight: 600, padding: '13px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: font.body, marginBottom: 24 }}>
        <Icon name="plus" size={17} sw={2.2} /> {T('add_question')}
      </button>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onDone} style={{ border: '1px solid ' + C.line, background: C.surf, color: C.ink2, fontSize: 14, fontWeight: 600, padding: '11px 20px', borderRadius: 11, cursor: 'pointer', fontFamily: font.body }}>{T('cancel')}</button>
        <button onClick={handleSave} disabled={!title.trim()} style={{ border: 'none', background: title.trim() ? C.pri : C.line, color: title.trim() ? '#fff' : C.mut, fontSize: 14, fontWeight: 700, padding: '11px 24px', borderRadius: 11, cursor: title.trim() ? 'pointer' : 'not-allowed', fontFamily: font.body }}>{T('save')}</button>
      </div>
    </div>
  );
}

/* ============================================================= */
/* QUIZ                                                          */
/* ============================================================= */
function Quiz({ courseId, onDone }) {
  const { courses, T } = useApp();
  const course = courses.find(c => c.id === courseId);
  const qs = course.questions;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qid]: Set of optionIds }
  const [submitted, setSubmitted] = useState(false);
  const [showList, setShowList] = useState(false);

  function toggle(qid, oid) {
    setAnswers(a => {
      const set = new Set(a[qid] || []);
      set.has(oid) ? set.delete(oid) : set.add(oid);
      return { ...a, [qid]: set };
    });
  }

  function isCorrect(q) {
    const picked = answers[q.id] || new Set();
    const correctIds = q.options.filter(o => o.correct).map(o => o.id);
    return correctIds.length === picked.size && correctIds.every(id => picked.has(id));
  }

  const answeredCount = qs.filter(q => (answers[q.id] && answers[q.id].size > 0)).length;
  const score = qs.filter(isCorrect).length;
  const pct = Math.round(score / qs.length * 100);
  const passed = pct >= 70;

  /* ---- RESULT SCREEN ---- */
  if (submitted) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '36px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 18px', background: `conic-gradient(${passed ? C.grn : C.amb} ${pct}%, ${C.line} 0)`, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 9, borderRadius: '50%', background: C.surf, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.disp, fontSize: 24, fontWeight: 700, color: C.ink }}>{pct}%</div>
          </div>
          <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: passed ? C.grn : C.amb, marginBottom: 4 }}>{passed ? T('passed_quiz') : T('failed_quiz')}</div>
          <div style={{ fontSize: 14, color: C.mut }}>{T('your_score')}: {score} / {qs.length}</div>
        </div>

        <div style={{ fontFamily: font.disp, fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{T('review_answers')}</div>
        {qs.map((q, i) => {
          const picked = answers[q.id] || new Set();
          const ok = isCorrect(q);
          return (
            <div key={q.id} style={{ background: C.surf, border: '1px solid ' + C.line, borderLeft: '3px solid ' + (ok ? C.grn : C.red), borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: q.image ? 12 : 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: ok ? C.grn : C.red, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{q.text}</span>
              </div>
              {q.image && <img src={q.image} alt="" style={{ maxHeight: 130, borderRadius: 9, marginBottom: 12, display: 'block' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.options.map(o => {
                  const chosen = picked.has(o.id);
                  let bg = 'transparent', col = C.ink2, bd = C.line;
                  if (o.correct) { bg = C.grnBg; col = C.grn; bd = C.grn; }
                  else if (chosen && !o.correct) { bg = C.redBg; col = C.red; bd = C.red; }
                  const showIcon = o.correct || chosen;
                  return (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, padding: '7px 11px', borderRadius: 8, background: bg, border: '1px solid ' + (bg === 'transparent' ? C.line2 : bd), color: col }}>
                      <span style={{ width: 14, display: 'flex', flexShrink: 0 }}>
                        {showIcon && <Icon name={o.correct ? 'check' : 'x'} size={14} sw={2.2} />}
                      </span>
                      <span style={{ flex: 1, fontWeight: chosen || o.correct ? 600 : 500 }}>{o.text}</span>
                    </div>
                  );
                })}
              </div>
              {q.explanation && <div style={{ marginTop: 10, fontSize: 12.5, color: C.mut, background: C.bg, padding: '9px 12px', borderRadius: 8 }}><strong style={{ color: C.ink2 }}>{T('explanation')}: </strong>{q.explanation}</div>}
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => { setAnswers({}); setSubmitted(false); setCurrent(0); setShowList(false); }} style={{ border: '1px solid ' + C.line, background: C.surf, color: C.ink2, fontSize: 14, fontWeight: 600, padding: '11px 22px', borderRadius: 11, cursor: 'pointer', fontFamily: font.body }}>{T('retake')}</button>
          <button onClick={onDone} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 14, fontWeight: 700, padding: '11px 24px', borderRadius: 11, cursor: 'pointer', fontFamily: font.body }}>{T('finish')}</button>
        </div>
      </div>
    );
  }

  /* ---- TAKING SCREEN ---- */
  const q = qs[current];
  const picked = answers[q.id] || new Set();

  /* ---- QUESTION LIST VIEW ---- */
  if (showList) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onDone} style={{ border: 'none', background: 'none', color: C.mut, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, fontFamily: font.body }}>
            <Icon name="chevL" size={16} sw={2} /> {course.title}
          </button>
          <div style={{ fontSize: 12.5, color: C.mut, fontWeight: 600 }}>{answeredCount} / {qs.length} {T('answered')}</div>
        </div>

        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '24px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{T('questions')}</div>
          <div style={{ fontSize: 13, color: C.mut, marginBottom: 18 }}>{T('select_all_apply')}</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
            {qs.map((qq, i) => {
              const done = answers[qq.id] && answers[qq.id].size > 0;
              const active = i === current;
              return (
                <button key={qq.id} className="df-circle" onClick={() => { setCurrent(i); setShowList(false); }} style={{
                  width: 44, height: 44, borderRadius: '50%', fontFamily: font.disp, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  border: '2px solid ' + (active ? C.pri : done ? C.grn : C.line),
                  background: active ? C.pri : done ? C.grnBg : C.surf,
                  color: active ? '#fff' : done ? C.grn : C.mut,
                  transition: 'all .14s',
                }}>{i + 1}</button>
              );
            })}
          </div>

          <button onClick={() => setSubmitted(true)} style={{ width: '100%', border: 'none', background: C.grn, color: '#fff', fontSize: 14.5, fontWeight: 700, padding: '13px', borderRadius: 12, cursor: 'pointer', fontFamily: font.body }}>
            {T('submit_quiz')}
          </button>
        </div>
      </div>
    );
  }

  /* ---- SINGLE QUESTION VIEW ---- */
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onDone} style={{ border: 'none', background: 'none', color: C.mut, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, fontFamily: font.body }}>
          <Icon name="chevL" size={16} sw={2} /> {course.title}
        </button>
        <button onClick={() => setShowList(true)} style={{ border: '1px solid ' + C.line, background: C.surf, color: C.ink2, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: font.body }}>
          <Icon name="menu" size={16} sw={2} /> {T('questions')}
        </button>
      </div>

      {/* Question card */}
      <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '28px', marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.mut, marginBottom: 10 }}>{T('question')} {current + 1} {T('of_q')} {qs.length}</div>
        <div style={{ fontFamily: font.disp, fontSize: 19, fontWeight: 700, color: C.ink, lineHeight: 1.4, marginBottom: q.image ? 18 : 20 }}>{q.text}</div>
        {q.image && <img src={q.image} alt="" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 12, marginBottom: 20, display: 'block' }} />}

        <div style={{ fontSize: 12.5, color: C.mut, marginBottom: 12 }}>{T('select_all_apply')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map(o => {
            const on = picked.has(o.id);
            return (
              <button key={o.id} className="df-option" onClick={() => toggle(q.id, o.id)} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                border: '1.5px solid ' + (on ? C.pri : C.line), background: on ? C.priBg : '#fafafa', transition: 'all .12s',
              }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, border: '2px solid ' + (on ? C.pri : C.line), background: on ? C.pri : C.surf, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {on && <Icon name="check" size={14} sw={2.6} />}
                </div>
                <span style={{ fontSize: 14.5, fontWeight: on ? 600 : 500, color: on ? C.pri : C.ink }}>{o.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{ border: '1px solid ' + C.line, background: C.surf, color: current === 0 ? C.line : C.ink2, fontSize: 14, fontWeight: 600, padding: '11px 18px', borderRadius: 11, cursor: current === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: font.body }}>
          <Icon name="chevL" size={16} sw={2} /> {T('back')}
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12.5, color: C.mut, fontWeight: 600 }}>{answeredCount} / {qs.length} {T('answered')}</div>
        {current < qs.length - 1 ? (
          <button onClick={() => setCurrent(c => Math.min(qs.length - 1, c + 1))} style={{ border: 'none', background: C.pri, color: '#fff', fontSize: 14, fontWeight: 600, padding: '11px 18px', borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: font.body }}>
            {T('next')} <Icon name="chevR" size={16} sw={2} />
          </button>
        ) : (
          <button onClick={() => setSubmitted(true)} style={{ border: 'none', background: C.grn, color: '#fff', fontSize: 14, fontWeight: 700, padding: '11px 22px', borderRadius: 11, cursor: 'pointer', fontFamily: font.body }}>
            {T('submit_quiz')}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================= */
/* ROOT                                                          */
/* ============================================================= */
export default function Courses() {
  const [view, setView] = useState({ mode: 'list', id: null }); // list | edit | take

  return (
    <div style={{ padding: '22px 26px 48px', animation: 'df-fade .25s' }}>
      {view.mode === 'list' && (
        <CourseList onEdit={(id) => setView({ mode: 'edit', id })} onTake={(id) => setView({ mode: 'take', id })} />
      )}
      {view.mode === 'edit' && (
        <CourseEditor courseId={view.id} onDone={() => setView({ mode: 'list', id: null })} />
      )}
      {view.mode === 'take' && (
        <Quiz courseId={view.id} onDone={() => setView({ mode: 'list', id: null })} />
      )}
    </div>
  );
}
