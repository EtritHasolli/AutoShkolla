import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Button, Empty, Icon, Badge, Input, Textarea, Field, Ring, PageHeader, ToneIcon } from '../components/ui.jsx';
import { uid } from '../lib/format.js';

const PASS = 70;

function CourseList({ onEdit, onTake }) {
  const { courses, role, T, openModal } = useApp();
  const canEdit = role === 'owner' || role === 'administrator';
  return (
    <>
      <PageHeader title={T('courses')} sub={T('courses_sub')} actions={canEdit && <Button variant="primary" icon="plus" onClick={() => onEdit(null)}>{T('new_course')}</Button>} />
      {!courses.length ? (
        <Card><Empty icon="courses" title={T('no_courses')} text={canEdit ? T('no_courses_text') : T('no_courses_student')}
          action={canEdit && <Button variant="primary" icon="plus" onClick={() => onEdit(null)}>{T('new_course')}</Button>} /></Card>
      ) : (
        <div className="grid-auto">
          {courses.map(c => (
            <div key={c.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
              <div className="row" style={{ gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <ToneIcon name="courses" tone="violet" size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>{c.title}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{T('n_questions', { n: c.questions.length })}</div>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, flex: 1, marginBottom: 14 }}>{c.desc}</p>
              <div className="row" style={{ gap: 8 }}>
                <Button variant="primary" icon="exams" style={{ flex: 1 }} disabled={!c.questions.length} onClick={() => onTake(c.id)}>{T('take_quiz')}</Button>
                {canEdit && <Button icon="edit" title={T('edit')} onClick={() => onEdit(c.id)} />}
                {canEdit && <Button icon="trash" title={T('delete')} onClick={() => openModal({ type: 'confirm', kind: 'course', id: c.id, name: c.title })} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function QuestionEditor({ q, n, onChange, onRemove }) {
  const { T } = useApp();
  const fileRef = useRef(null);
  const set = (k, v) => onChange({ ...q, [k]: v });
  const setOpt = (id, patch) => onChange({ ...q, options: q.options.map(o => o.id === id ? { ...o, ...patch } : o) });
  function onImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => set('image', ev.target.result);
    r.readAsDataURL(file);
  }
  return (
    <Card title={T('question') + ' ' + n} extra={<Button size="sm" variant="ghost" icon="trash" onClick={onRemove}>{T('delete')}</Button>} style={{ marginBottom: 14 }}>
      <Textarea rows={2} value={q.text} onChange={e => set('text', e.target.value)} placeholder={T('question_text')} style={{ marginBottom: 12, minHeight: 60 }} />
      {q.image ? (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <img src={q.image} alt="" style={{ maxHeight: 150, borderRadius: 10, border: '1px solid var(--line)' }} />
          <button onClick={() => set('image', null)} className="btn btn-sm btn-icon btn-secondary" style={{ position: 'absolute', top: 6, right: 6 }}><Icon name="x" size={15} /></button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" icon="image" onClick={() => fileRef.current.click()} style={{ marginBottom: 12 }}>{T('image_optional')}</Button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={onImage} style={{ display: 'none' }} />
      <div className="field-label">{T('options')} <span className="muted" style={{ fontWeight: 500 }}>· {T('select_all_apply')}</span></div>
      <div className="stack" style={{ gap: 8 }}>
        {q.options.map(o => (
          <div key={o.id} className="row" style={{ gap: 8 }}>
            <button type="button" title={T('correct')} onClick={() => setOpt(o.id, { correct: !o.correct })}
              style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, border: '2px solid ' + (o.correct ? 'var(--green)' : 'var(--line)'), background: o.correct ? 'var(--green)' : 'var(--surface)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {o.correct && <Icon name="check" size={16} sw={2.6} />}
            </button>
            <Input value={o.text} onChange={e => setOpt(o.id, { text: e.target.value })} placeholder={T('option_text')} />
            <Button size="sm" variant="ghost" icon="x" disabled={q.options.length <= 2} onClick={() => onChange({ ...q, options: q.options.filter(x => x.id !== o.id) })} />
          </div>
        ))}
      </div>
      <Button size="sm" variant="ghost" icon="plus" style={{ marginTop: 8 }} onClick={() => onChange({ ...q, options: [...q.options, { id: uid('o'), text: '', correct: false }] })}>{T('add_option')}</Button>
      <Input value={q.explanation || ''} onChange={e => set('explanation', e.target.value)} placeholder={T('explanation_ph')} style={{ marginTop: 10 }} />
    </Card>
  );
}

function CourseEditor({ courseId, onDone }) {
  const { courses, saveCourse, T } = useApp();
  const existing = courses.find(c => c.id === courseId);
  const [title, setTitle] = useState(existing?.title || '');
  const [desc, setDesc] = useState(existing?.desc || '');
  const [qs, setQs] = useState(existing?.questions || []);
  const add = () => setQs(x => [...x, { id: uid('q'), text: '', image: null, explanation: '', options: [{ id: uid('o'), text: '', correct: true }, { id: uid('o'), text: '', correct: false }] }]);
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Button variant="ghost" size="sm" icon="chevL" onClick={onDone} style={{ marginBottom: 12, marginLeft: -8 }}>{T('courses')}</Button>
      <h1 className="page-title" style={{ marginBottom: 16 }}>{existing ? T('edit') + ' · ' + existing.title : T('new_course')}</h1>
      <Card style={{ marginBottom: 18 }}>
        <Field label={T('course_title')}><Input value={title} onChange={e => setTitle(e.target.value)} placeholder={T('course_title_ph')} /></Field>
        <Field label={T('course_desc')} style={{ marginBottom: 0 }}><Textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} /></Field>
      </Card>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{T('questions')} ({qs.length})</div>
      </div>
      {!qs.length && <Card style={{ marginBottom: 14 }}><Empty icon="courses" title={T('no_questions')} /></Card>}
      {qs.map((q, k) => <QuestionEditor key={q.id} q={q} n={k + 1} onChange={nq => setQs(x => x.map((y, i) => i === k ? nq : y))} onRemove={() => setQs(x => x.filter((_, i) => i !== k))} />)}
      <Button variant="soft" block icon="plus" onClick={add} style={{ marginBottom: 20, height: 46, borderStyle: 'dashed' }}>{T('add_question')}</Button>
      <div className="row" style={{ gap: 10, justifyContent: 'flex-end' }}>
        <Button onClick={onDone}>{T('cancel')}</Button>
        <Button variant="primary" icon="check" disabled={!title.trim()} onClick={() => { saveCourse({ id: existing?.id || uid('c'), title: title.trim(), desc: desc.trim(), questions: qs }); onDone(); }}>{T('save')}</Button>
      </div>
    </div>
  );
}

function Quiz({ courseId, onDone }) {
  const { courses, T } = useApp();
  const course = courses.find(c => c.id === courseId);
  const qs = course?.questions || [];
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [overview, setOverview] = useState(false);
  if (!course || !qs.length) return null;

  const toggle = (qid, oid) => setAnswers(a => { const s = new Set(a[qid] || []); s.has(oid) ? s.delete(oid) : s.add(oid); return { ...a, [qid]: s }; });
  const isCorrect = (q) => { const p = answers[q.id] || new Set(); const c = q.options.filter(o => o.correct).map(o => o.id); return c.length === p.size && c.every(id => p.has(id)); };
  const answered = qs.filter(q => answers[q.id]?.size).length;
  const score = qs.filter(isCorrect).length;
  const pct = Math.round(score / qs.length * 100);
  const passed = pct >= PASS;

  if (submitted) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Card style={{ textAlign: 'center', marginBottom: 20 }} bodyStyle={{ padding: 28 }}>
          <div style={{ display: 'inline-block' }}>
            <Ring pct={pct} size={120} stroke={11} color={passed ? 'var(--green)' : 'var(--amber)'}><div style={{ fontSize: 28, fontWeight: 800 }}>{pct}%</div></Ring>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: passed ? 'var(--green)' : 'var(--amber)', marginTop: 12 }}>{passed ? T('quiz_passed') : T('quiz_failed')}</div>
          <div className="muted">{T('your_score')}: {score} / {qs.length}</div>
        </Card>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{T('review_answers')}</div>
        {qs.map((q, k) => {
          const picked = answers[q.id] || new Set();
          const ok = isCorrect(q);
          return (
            <div key={q.id} className="card" style={{ padding: 16, marginBottom: 12, borderLeft: '4px solid ' + (ok ? 'var(--green)' : 'var(--red)') }}>
              <div style={{ fontWeight: 650, marginBottom: 10 }}>{k + 1}. {q.text}</div>
              {q.image && <img src={q.image} alt="" style={{ maxHeight: 140, borderRadius: 10, marginBottom: 10 }} />}
              <div className="stack" style={{ gap: 6 }}>
                {q.options.map(o => {
                  const chosen = picked.has(o.id);
                  const tone = o.correct ? 'green' : chosen ? 'red' : null;
                  return (
                    <div key={o.id} className={'row' + (tone ? ' tone-' + tone : '')} style={{ gap: 8, padding: '8px 11px', borderRadius: 10, border: '1px solid ' + (tone ? 'transparent' : 'var(--line-2)'), fontWeight: chosen || o.correct ? 600 : 500 }}>
                      <span style={{ width: 16, display: 'flex' }}>{(o.correct || chosen) && <Icon name={o.correct ? 'check' : 'x'} size={15} sw={2.4} />}</span>{o.text}
                    </div>
                  );
                })}
              </div>
              {q.explanation && <div className="muted" style={{ marginTop: 10, fontSize: 13, background: 'var(--surface-2)', padding: '9px 12px', borderRadius: 10 }}><b style={{ color: 'var(--ink-2)' }}>{T('explanation')}:</b> {q.explanation}</div>}
            </div>
          );
        })}
        <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 16 }}>
          <Button icon="repeat" onClick={() => { setAnswers({}); setSubmitted(false); setCur(0); }}>{T('retake')}</Button>
          <Button variant="primary" onClick={onDone}>{T('finish')}</Button>
        </div>
      </div>
    );
  }

  const q = qs[cur];
  const picked = answers[q.id] || new Set();
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="chevL" onClick={onDone} style={{ marginLeft: -8 }}>{course.title}</Button>
        <Button size="sm" icon="grid" onClick={() => setOverview(o => !o)}>{T('all_questions')}</Button>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }} >
          <span className="muted">{T('question_n', { n: cur + 1, t: qs.length })}</span>
          <span className="muted">{T('answered', { n: answered, t: qs.length })}</span>
        </div>
        <div className="progress" style={{ height: 6 }}><span style={{ width: ((cur + 1) / qs.length * 100) + '%', background: 'var(--brand)' }} /></div>
      </div>
      {overview && (
        <Card style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {qs.map((qq, k) => {
              const done = answers[qq.id]?.size;
              return <button key={qq.id} onClick={() => { setCur(k); setOverview(false); }} style={{ width: 42, height: 42, borderRadius: 12, fontWeight: 700, border: '2px solid ' + (k === cur ? 'var(--brand)' : done ? 'var(--green)' : 'var(--line)'), background: k === cur ? 'var(--brand)' : done ? 'var(--green-50)' : 'var(--surface)', color: k === cur ? '#fff' : done ? 'var(--green)' : 'var(--muted)' }}>{k + 1}</button>;
            })}
          </div>
        </Card>
      )}
      <Card bodyStyle={{ padding: 22 }} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, marginBottom: 16 }}>{q.text}</div>
        {q.image && <img src={q.image} alt="" style={{ maxHeight: 240, borderRadius: 12, marginBottom: 16 }} />}
        <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>{T('select_all_apply')}</div>
        <div className="stack" style={{ gap: 10 }}>
          {q.options.map(o => {
            const on = picked.has(o.id);
            return (
              <button key={o.id} onClick={() => toggle(q.id, o.id)} className="row" style={{ gap: 12, padding: '14px 16px', borderRadius: 14, textAlign: 'left', border: '1.5px solid ' + (on ? 'var(--brand)' : 'var(--line)'), background: on ? 'var(--brand-50)' : 'var(--surface)', fontSize: 15, fontWeight: on ? 600 : 500, color: on ? 'var(--brand-700)' : 'var(--ink)' }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: '2px solid ' + (on ? 'var(--brand)' : 'var(--line)'), background: on ? 'var(--brand)' : 'var(--surface)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={14} sw={2.8} />}</span>
                {o.text}
              </button>
            );
          })}
        </div>
      </Card>
      <div className="row" style={{ gap: 10 }}>
        <Button icon="chevL" disabled={cur === 0} onClick={() => setCur(c => c - 1)}>{T('back')}</Button>
        <span className="spacer" />
        {cur < qs.length - 1
          ? <Button variant="primary" iconRight="chevR" onClick={() => setCur(c => c + 1)}>{T('next')}</Button>
          : <Button variant="success" icon="check" onClick={() => setSubmitted(true)}>{T('submit_quiz')}</Button>}
      </div>
    </div>
  );
}

export default function Courses() {
  const [view, setView] = useState({ mode: 'list', id: null });
  return (
    <div className="page">
      {view.mode === 'list' && <CourseList onEdit={id => setView({ mode: 'edit', id })} onTake={id => setView({ mode: 'take', id })} />}
      {view.mode === 'edit' && <CourseEditor courseId={view.id} onDone={() => setView({ mode: 'list', id: null })} />}
      {view.mode === 'take' && <Quiz courseId={view.id} onDone={() => setView({ mode: 'list', id: null })} />}
    </div>
  );
}
