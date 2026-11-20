// Derived fields shared by demo and live mode, so both behave identically:
// lessons used, balance, payment status, exam status and readiness are always
// computed from the underlying lessons / payments / exams — never stored twice.
import { SKILLS } from '../data/seed.js';
import { todayISO } from './format.js';

export function deriveStudents(students, lessons, payments, exams) {
  const used = {}, paid = {}, ex = {};
  for (const l of lessons) if (l.status === 'completed') used[l.studentId] = (used[l.studentId] || 0) + 1;
  for (const p of payments) paid[p.studentId] = (paid[p.studentId] || 0) + Number(p.amount || 0);
  for (const e of exams) (ex[e.studentId] ||= []).push(e);
  const today = todayISO();

  return students.map(s => {
    const u = (s.usedBase || 0) + (used[s.id] || 0);
    const price = Number(s.price) || 0;
    const paidSum = Math.round((paid[s.id] || 0) * 100) / 100;
    const due = Math.max(0, Math.round((price - paidSum) * 100) / 100);
    const payment = due <= 0 ? 'paid' : paidSum > 0 ? 'partial' : 'unpaid';
    const progress = { ...(s.progress || {}) };
    SKILLS.forEach(k => { if (!progress[k]) progress[k] = 1; });
    const avg = SKILLS.reduce((a, k) => a + progress[k], 0) / SKILLS.length;
    const target = Math.max(10, Math.round((s.total || 20) * 0.8));
    const readiness = Math.round(Math.min(1, u / target) * 45 + ((avg - 1) / 4) * 55);
    const examState = (type, stored) => {
      const list = (ex[s.id] || []).filter(e => e.type === type);
      if (list.some(e => e.status === 'passed')) return 'passed';
      if (list.some(e => e.status === 'scheduled' && e.date >= today)) return 'scheduled';
      if (list.some(e => e.status === 'failed')) return 'failed';
      return stored || 'not_taken';
    };
    return {
      ...s, progress,
      used: u, remaining: Math.max(0, (s.total || 0) - u),
      price, paid: paidSum, due, payment,
      readiness: Math.max(0, Math.min(100, readiness)),
      theory: examState('theory', s.theory), practical: examState('practical', s.practical),
    };
  });
}

export function deriveInstructors(instructors, students) {
  const count = {};
  for (const s of students) if (s.instructorId) count[s.instructorId] = (count[s.instructorId] || 0) + 1;
  return instructors.map(i => ({ ...i, students: count[i.id] || 0 }));
}
