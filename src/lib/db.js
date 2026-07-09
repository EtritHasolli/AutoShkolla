// Data adapter between Supabase rows and the shapes the UI consumes.
// The UI was built against the seed-data shapes (see src/data/seed.js) —
// every mapper here produces exactly those, including the derived fields
// (used/remaining/paid/due/payment status/readiness) that live tables don't store.
import { supabase } from './supabase.js';
import { skills } from '../data/seed.js';

const DAY_MS = 86400000;

function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function dayIndex(dateStr, monday) {
  const d = parseDate(dateStr);
  return Math.round((d - monday) / DAY_MS); // 0..5 inside the shown week
}

function relTime(iso) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return mins + 'm ago';
  const h = Math.round(mins / 60);
  if (h < 24) return h + 'h ago';
  return Math.round(h / 24) + 'd ago';
}

async function rows(table, schoolId, order = 'created_at') {
  const { data, error } = await supabase.from(table).select('*').eq('school_id', schoolId).order(order);
  if (error) throw error;
  return data;
}

// ---- row → UI shape mappers -------------------------------------------------

export function mapVehicle(v) {
  return {
    id: v.id, name: v.name, plate: v.plate, cat: v.cat, year: v.year,
    reg: v.reg, ins: v.ins, km: v.km, status: v.status, service: v.service,
  };
}

export function mapInstructor(i, studentCount) {
  return {
    id: i.id, name: i.name, cat: i.cat, phone: i.phone || '', color: i.color,
    rating: Number(i.rating), students: studentCount, vehicle: i.vehicle_id,
    email: i.email || '', profileId: i.profile_id,
  };
}

export function mapStudent(s, { usedCount, paidSum }) {
  const price = Number(s.price);
  const paid = Math.min(price, paidSum);
  const due = Math.max(0, price - paid);
  const payment = due <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  const progress = s.progress || {};
  skills.forEach(k => { if (!progress[k]) progress[k] = 1; });
  const avgSkill = skills.reduce((a, k) => a + progress[k], 0) / skills.length;
  return {
    id: s.id, name: s.name, phone: s.phone || '', cat: s.cat,
    instructorId: s.instructor_id, total: s.total,
    used: usedCount, remaining: Math.max(0, s.total - usedCount),
    payment, price, paid, due, progress,
    joined: s.joined, theory: s.theory, practical: s.practical,
    readiness: Math.min(100, Math.round(24 + usedCount * 2 + avgSkill * 8)),
    email: s.email || '', profileId: s.profile_id,
  };
}

export function mapLesson(l, monday) {
  return {
    id: l.id, day: dayIndex(l.lesson_date, monday), hour: l.hour,
    date: l.lesson_date, studentId: l.student_id, instructorId: l.instructor_id,
    vehicleId: l.vehicle_id, status: l.status, type: l.type, pickup: l.pickup,
  };
}

export function mapPayment(p) {
  return { id: p.id, studentId: p.student_id, date: p.date, amount: Number(p.amount), method: p.method, note: p.note };
}

export function mapExam(e) {
  return { id: e.id, studentId: e.student_id, type: e.type, date: e.date, status: e.status };
}

export function mapCourse(c) {
  return { id: c.id, title: c.title, desc: c.descr, questions: c.questions || [] };
}

export function mapNotif(n) {
  return { id: n.id, type: n.type, title: n.title, body: n.body, time: relTime(n.created_at), status: n.status, read: n.read };
}

// ---- loading ---------------------------------------------------------------

// Everything a school portal session needs, in the exact shapes the UI expects.
export async function fetchSchoolBundle(schoolId, monday) {
  const [ins, veh, stu, les, pay, exa, cou, not] = await Promise.all([
    rows('instructors', schoolId),
    rows('vehicles', schoolId),
    rows('students', schoolId),
    rows('lessons', schoolId, 'lesson_date'),
    rows('payments', schoolId, 'date'),
    rows('exams', schoolId, 'date'),
    rows('courses', schoolId),
    supabase.from('notifications').select('*').eq('school_id', schoolId)
      .order('created_at', { ascending: false }).then(r => { if (r.error) throw r.error; return r.data; }),
  ]);

  const usedBy = {}, paidBy = {};
  les.forEach(l => { if (l.status === 'completed') usedBy[l.student_id] = (usedBy[l.student_id] || 0) + 1; });
  pay.forEach(p => { paidBy[p.student_id] = (paidBy[p.student_id] || 0) + Number(p.amount); });
  const countBy = {};
  stu.forEach(s => { if (s.instructor_id) countBy[s.instructor_id] = (countBy[s.instructor_id] || 0) + 1; });

  return {
    instructors: ins.map(i => mapInstructor(i, countBy[i.id] || 0)),
    vehicles: veh.map(mapVehicle),
    students: stu.map(s => mapStudent(s, { usedCount: usedBy[s.id] || 0, paidSum: paidBy[s.id] || 0 })),
    lessons: les.map(l => mapLesson(l, monday)),
    payments: pay.map(mapPayment).reverse(),
    exams: exa.map(mapExam),
    courses: cou.map(mapCourse),
    notifs: not.map(mapNotif),
  };
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data; // null → account not provisioned yet (caller self-heals via ensure_account)
}

// Anonymous-friendly directory for the landing page.
export async function fetchPublicSchools() {
  const { data, error } = await supabase.from('public_schools').select('*').order('name');
  if (error) throw error;
  return data.map(s => ({
    id: s.id, name: s.name, city: s.city || '—', address: s.address || '',
    phone: s.phone || '', cats: s.cats || [], logo: s.logo_url,
    joined: s.joined, students: s.students, instructors: s.instructors, vehicles: s.vehicles,
  }));
}

export async function fetchSchool(schoolId) {
  const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();
  if (error) throw error;
  return {
    id: data.id, name: data.name, bizNumber: data.biz_number, address: data.address,
    city: data.city, phone: data.phone, logo: data.logo_url, cats: data.cats,
    plan: data.plan, status: data.status,
  };
}

// Super-admin: aggregated stats for every school on the platform.
export async function fetchPlatformStats() {
  const { data, error } = await supabase.from('platform_school_stats').select('*').order('joined');
  if (error) throw error;
  const schools = data.map(s => ({
    id: s.id, name: s.name, city: s.city || '—', bizNumber: s.biz_number || '—',
    plan: s.plan, status: s.status, joined: s.joined,
    students: s.students, activeStudents: s.active_students,
    instructors: s.instructors, vehicles: s.vehicles,
    lessonsThisMonth: s.lessons_this_month, examsThisMonth: s.exams_this_month,
    examPassRate: s.exam_pass_rate, mrr: Number(s.mrr),
    revenueYtd: Number(s.revenue_ytd), cats: s.cats || [],
    lastActive: s.last_active || s.joined,
  }));
  // 6-month signup / MRR trend derived from join dates
  const trend = [];
  const now = new Date();
  for (let k = 5; k >= 0; k--) {
    const end = new Date(now.getFullYear(), now.getMonth() - k + 1, 1);
    const inRange = schools.filter(s => parseDate(s.joined) < end);
    trend.push({
      month: new Date(now.getFullYear(), now.getMonth() - k, 1).toLocaleString('en', { month: 'short' }),
      schools: inRange.length,
      mrr: inRange.reduce((a, s) => a + s.mrr, 0),
    });
  }
  return { schools, trend };
}

// ---- writes ------------------------------------------------------------------

async function ins(table, payload) {
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function upd(table, id, patch) {
  const { error } = await supabase.from(table).update(patch).eq('id', id);
  if (error) throw error;
}

export const db = {
  insertLesson: (schoolId, m) => ins('lessons', {
    school_id: schoolId, student_id: m.studentId, instructor_id: m.instructorId,
    vehicle_id: m.vehicleId, lesson_date: m.date, hour: m.hour,
    type: m.type || 'city', pickup: m.pickup || 'Qendra', status: 'scheduled',
  }),
  updateLesson: (id, patch) => upd('lessons', id, patch),
  deleteLesson: async (id) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
  },

  insertStudent: (schoolId, s) => ins('students', {
    school_id: schoolId, name: s.name, email: s.email || null, phone: s.phone || '',
    cat: s.cat || 'B', instructor_id: s.instructorId || null,
    total: s.total, price: s.price,
  }),
  updateStudent: (id, patch) => upd('students', id, patch),

  insertPayment: (schoolId, p) => ins('payments', {
    school_id: schoolId, student_id: p.studentId, date: p.date,
    amount: p.amount, method: p.method, note: p.note || '',
  }),

  insertInstructor: (schoolId, i) => ins('instructors', {
    school_id: schoolId, name: i.name, email: i.email || null, phone: i.phone || '',
    cat: i.cat || 'B', color: i.color || '#2a6fdb', vehicle_id: i.vehicleId || null,
  }),

  insertVehicle: (schoolId, v) => ins('vehicles', {
    school_id: schoolId, name: v.name, plate: v.plate, cat: v.cat || 'B',
    year: v.year || null, reg: v.reg || null, ins: v.ins || null,
    km: v.km || 0, status: v.status || 'available', service: v.service || null,
  }),

  insertExam: (schoolId, e) => ins('exams', {
    school_id: schoolId, student_id: e.studentId, type: e.type, date: e.date,
    status: e.status || 'scheduled',
  }),

  saveCourse: async (schoolId, c, isNew) => {
    const payload = { school_id: schoolId, title: c.title, descr: c.desc, questions: c.questions };
    if (isNew) return ins('courses', payload);
    return upd('courses', c.id, payload);
  },
  deleteCourse: async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },

  markAllNotifsRead: async (schoolId) => {
    const { error } = await supabase.from('notifications').update({ read: true })
      .eq('school_id', schoolId).eq('read', false);
    if (error) throw error;
  },
  insertNotification: (schoolId, n) => ins('notifications', { school_id: schoolId, ...n }),

  updateSchool: async (id, s) => upd('schools', id, {
    name: s.name, phone: s.phone, city: s.city, address: s.address,
  }),
};
