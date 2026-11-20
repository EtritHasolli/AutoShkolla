// Adapter between Supabase rows and the shapes the UI uses.
// Derived fields (lessons used, balance, readiness…) are computed in
// lib/derive.js so demo and live mode share one code path.
import { supabase } from './supabase.js';
import { platformTrend } from '../data/seed.js';

// Old plan names (schema v1) → the 3 tiers from "Pricing & Packages".
const PLAN_ALIAS = { Starter: 'Fillestar', Pro: 'Standard' };

// ---- resilience ---------------------------------------------------------------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const isNetworkError = (e) => /fetch|network|timeout|load failed/i.test(e?.message || '');

// Runs a Supabase call; retries quietly on network errors (flaky office Wi-Fi),
// and if the database is missing a newer column (migration not run yet) it
// drops that column from the payload and tries again instead of failing.
async function run(build, payload, onRetry) {
  let body = payload ? { ...payload } : undefined;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, error } = await build(body);
    if (!error) return data;
    const missing = /Could not find the '([^']+)' column/i.exec(error.message || '');
    if (missing && body && missing[1] in body) {
      delete body[missing[1]];
      continue;
    }
    if (isNetworkError(error) && attempt < 4) {
      onRetry?.();
      await sleep(600 * 2 ** attempt);
      continue;
    }
    throw error;
  }
  throw new Error('Request failed');
}

let retryListener = null;
export function onNetworkRetry(fn) { retryListener = fn; }
const notifyRetry = () => retryListener?.();

async function rows(table, schoolId, order = 'created_at', optional = false) {
  try {
    return await run(() => supabase.from(table).select('*').eq('school_id', schoolId).order(order), undefined, notifyRetry);
  } catch (e) {
    if (optional) return [];
    throw e;
  }
}

// ---- row → UI shape -------------------------------------------------------------
export function mapVehicle(v) {
  return { id: v.id, name: v.name, plate: v.plate, cat: v.cat, year: v.year, reg: v.reg, ins: v.ins, km: v.km, status: v.status, service: v.service };
}
export function mapInstructor(i) {
  return { id: i.id, name: i.name, cat: i.cat, phone: i.phone || '', color: i.color, rating: Number(i.rating), vehicle: i.vehicle_id, email: i.email || '', profileId: i.profile_id };
}
export function mapStudent(s) {
  return {
    id: s.id, name: s.name, phone: s.phone || '', email: s.email || '', cat: s.cat,
    instructorId: s.instructor_id, total: s.total, price: Number(s.price), packageName: s.package_name || '',
    progress: s.progress || {}, joined: s.joined, theory: s.theory, practical: s.practical,
    notes: s.notes || '', profileId: s.profile_id, usedBase: 0,
  };
}
export function mapLesson(l) {
  return { id: l.id, date: l.lesson_date, hour: l.hour, studentId: l.student_id, instructorId: l.instructor_id, vehicleId: l.vehicle_id, status: l.status, type: l.type, pickup: l.pickup || '' };
}
export function mapPayment(p) {
  return { id: p.id, studentId: p.student_id, date: p.date, amount: Number(p.amount), method: p.method, note: p.note || '' };
}
export function mapExam(e) {
  return { id: e.id, studentId: e.student_id, type: e.type, date: e.date, status: e.status };
}
export function mapCourse(c) {
  return { id: c.id, title: c.title, desc: c.descr, questions: c.questions || [] };
}
export function mapNotif(n) {
  return { id: n.id, type: n.type, title: n.title, body: n.body, createdAt: n.created_at, status: n.status, read: n.read };
}
function mapSchoolCommon(s) {
  return {
    id: s.id, name: s.name, city: s.city || '', address: s.address || '', phone: s.phone || '',
    logo: s.logo_url || null, cats: s.cats || ['B'], mapsUrl: s.maps_url || '',
    hoursStart: s.hours_start || '08:00', hoursEnd: s.hours_end || '18:00',
    workingDays: s.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    acceptEnrollments: s.accept_enrollments !== false,
    // null = the school hasn't published packages yet. Never show made-up
    // prices publicly; the app offers DEFAULT_PACKAGES as a starting point.
    packages: Array.isArray(s.packages) && s.packages.length ? s.packages : null,
  };
}

// ---- loading ----------------------------------------------------------------------
export async function fetchSchoolBundle(schoolId) {
  const [ins, veh, stu, les, pay, exa, cou, not] = await Promise.all([
    rows('instructors', schoolId),
    rows('vehicles', schoolId),
    rows('students', schoolId),
    rows('lessons', schoolId, 'lesson_date'),
    rows('payments', schoolId, 'date'),
    rows('exams', schoolId, 'date'),
    rows('courses', schoolId),
    run(() => supabase.from('notifications').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(100), undefined, notifyRetry),
  ]);
  return {
    instructors: ins.map(mapInstructor),
    vehicles: veh.map(mapVehicle),
    students: stu.map(mapStudent),
    lessons: les.map(mapLesson),
    payments: pay.map(mapPayment).reverse(),
    exams: exa.map(mapExam),
    courses: cou.map(mapCourse),
    notifs: not.map(mapNotif),
  };
}

export async function fetchProfile(userId) {
  return run(() => supabase.from('profiles').select('*').eq('id', userId).maybeSingle(), undefined, notifyRetry);
}

export async function fetchSchool(schoolId) {
  const s = await run(() => supabase.from('schools').select('*').eq('id', schoolId).single(), undefined, notifyRetry);
  return {
    ...mapSchoolCommon(s), bizNumber: s.biz_number || '',
    plan: PLAN_ALIAS[s.plan] || s.plan, status: s.status, listed: s.listed !== false,
  };
}

export async function fetchPublicSchools() {
  const data = await run(() => supabase.from('public_schools').select('*').order('name'));
  return data.map(s => ({ ...mapSchoolCommon(s), joined: s.joined, students: s.students, instructors: s.instructors, vehicles: s.vehicles }));
}

export async function fetchPlatformStats() {
  const data = await run(() => supabase.from('platform_school_stats').select('*').order('joined'));
  const schools = data.map(s => ({
    id: s.id, name: s.name, city: s.city || '—', bizNumber: s.biz_number || '—',
    plan: PLAN_ALIAS[s.plan] || s.plan, status: s.status, joined: s.joined,
    students: s.students, activeStudents: s.active_students, instructors: s.instructors, vehicles: s.vehicles,
    lessonsThisMonth: s.lessons_this_month, examsThisMonth: s.exams_this_month,
    examPassRate: s.exam_pass_rate, mrr: Number(s.mrr), revenueYtd: Number(s.revenue_ytd),
    cats: s.cats || [], lastActive: s.last_active || s.joined,
  }));
  return { schools, trend: platformTrend(schools) };
}

// ---- writes -------------------------------------------------------------------------
const ins = (table, payload) => run((b) => supabase.from(table).insert(b).select().single(), payload, notifyRetry);
const insMany = (table, list) => run(() => supabase.from(table).insert(list).select(), undefined, notifyRetry);
const upd = (table, id, patch) => run((b) => supabase.from(table).update(b).eq('id', id), patch, notifyRetry);
const del = (table, id) => run(() => supabase.from(table).delete().eq('id', id), undefined, notifyRetry);

const lessonRow = (schoolId, m) => ({
  school_id: schoolId, student_id: m.studentId, instructor_id: m.instructorId,
  vehicle_id: m.vehicleId || null, lesson_date: m.date, hour: m.hour,
  type: m.type || 'city', pickup: m.pickup || '', status: 'scheduled',
});

const studentRow = (s) => ({
  name: s.name, email: s.email || null, phone: s.phone || '', cat: s.cat || 'B',
  instructor_id: s.instructorId || null, total: s.total, price: s.price,
  package_name: s.packageName || null, notes: s.notes ?? undefined,
});

export const db = {
  insertLessons: (schoolId, list) => insMany('lessons', list.map(m => lessonRow(schoolId, m))),
  updateLesson: (id, patch) => upd('lessons', id, patch),
  deleteLesson: (id) => del('lessons', id),

  insertStudent: (schoolId, s) => ins('students', { school_id: schoolId, ...studentRow(s) }),
  updateStudent: (id, s) => upd('students', id, studentRow(s)),
  updateStudentFields: (id, patch) => upd('students', id, patch),
  deleteStudent: (id) => del('students', id),

  insertPayment: (schoolId, p) => ins('payments', { school_id: schoolId, student_id: p.studentId, date: p.date, amount: p.amount, method: p.method, note: p.note || '' }),
  deletePayment: (id) => del('payments', id),

  insertInstructor: (schoolId, i) => ins('instructors', { school_id: schoolId, name: i.name, email: i.email || null, phone: i.phone || '', cat: i.cat || 'B', color: i.color, vehicle_id: i.vehicleId || null }),
  updateInstructor: (id, i) => upd('instructors', id, { name: i.name, email: i.email || null, phone: i.phone || '', cat: i.cat, color: i.color, vehicle_id: i.vehicleId || null }),
  deleteInstructor: (id) => del('instructors', id),

  insertVehicle: (schoolId, v) => ins('vehicles', { school_id: schoolId, name: v.name, plate: v.plate, cat: v.cat || 'B', year: v.year || null, reg: v.reg || null, ins: v.ins || null, km: v.km || 0, status: v.status || 'available', service: v.service || null }),
  updateVehicle: (id, v) => upd('vehicles', id, { name: v.name, plate: v.plate, cat: v.cat, year: v.year || null, reg: v.reg || null, ins: v.ins || null, km: v.km || 0, status: v.status || 'available', service: v.service || null }),
  deleteVehicle: (id) => del('vehicles', id),

  insertExam: (schoolId, e) => ins('exams', { school_id: schoolId, student_id: e.studentId, type: e.type, date: e.date, status: e.status || 'scheduled' }),
  updateExam: (id, patch) => upd('exams', id, patch),
  deleteExam: (id) => del('exams', id),

  saveCourse: (schoolId, c, isNew) => {
    const payload = { school_id: schoolId, title: c.title, descr: c.desc, questions: c.questions };
    return isNew ? ins('courses', payload) : upd('courses', c.id, payload);
  },
  deleteCourse: (id) => del('courses', id),

  markAllNotifsRead: (schoolId) => run(() => supabase.from('notifications').update({ read: true }).eq('school_id', schoolId).eq('read', false), undefined, notifyRetry),

  updateSchool: (id, s) => upd('schools', id, {
    name: s.name, phone: s.phone, city: s.city, address: s.address, maps_url: s.mapsUrl, cats: s.cats,
    hours_start: s.hoursStart, hours_end: s.hoursEnd, working_days: s.workingDays,
    listed: s.listed, accept_enrollments: s.acceptEnrollments, packages: s.packages,
  }),
  updateSchoolAdmin: (id, patch) => upd('schools', id, patch),
};
