import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { initialLessons, notifications as seedNotifications, payments as seedPayments, students as seedStudents, instructors as seedInstructors, vehicles as seedVehicles, exams as seedExams, skills, getWeekDays, hours, C, font } from './data/seed.js';
import { initialCourses } from './data/courses.js';
import { platformSchools, platformTrend } from './data/platform.js';
import { t as translate } from './data/i18n.js';
import { supabase, isLive } from './lib/supabase.js';
import { fetchSchoolBundle, fetchProfile, fetchSchool, fetchPlatformStats, fetchPublicSchools, db, toISODate } from './lib/db.js';

const AppContext = createContext(null);

const uid = (p) => p + Math.random().toString(36).slice(2, 9);

export function AppProvider({ children }) {
  const [{ days, todayIdx }] = useState(getWeekDays);
  const monday = days[0];

  const [lang, setLang] = useState('en');
  const [booting, setBooting] = useState(isLive);
  const [session, setSession] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [portal, setPortal] = useState(null); // 'school' | 'superadmin'
  const [school, setSchool] = useState(null);
  const [authScreen, setAuthScreen] = useState('landing'); // 'landing' | 'login' | 'signup'
  const [role, setRole] = useState('owner');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [route, setRoute] = useState('dashboard');
  const [mRoute, setMRoute] = useState('today');

  // Business data — seeded in demo mode, loaded from Supabase in live mode.
  const [instructors, setInstructors] = useState(isLive ? [] : seedInstructors);
  const [vehicles, setVehicles] = useState(isLive ? [] : seedVehicles);
  const [students, setStudents] = useState(isLive ? [] : seedStudents);
  const [lessons, setLessons] = useState(isLive ? [] : initialLessons);
  const [payments, setPayments] = useState(isLive ? [] : seedPayments);
  const [exams, setExams] = useState(isLive ? [] : seedExams);
  const [courses, setCourses] = useState(isLive ? [] : initialCourses);
  const [notifs, setNotifs] = useState(isLive ? [] : seedNotifications);
  const [platform, setPlatform] = useState({ schools: platformSchools, trend: platformTrend });
  // Public directory for the landing page (demo: derived from the mock platform data)
  const [publicSchools, setPublicSchools] = useState(isLive ? [] : platformSchools
    .filter(s => s.status !== 'suspended')
    .map(s => ({ id: s.id, name: s.name, city: s.city, address: '', phone: '', cats: s.cats, logo: null, joined: s.joined, students: s.students, instructors: s.instructors, vehicles: s.vehicles })));

  const [selStudent, setSelStudent] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [calView, setCalView] = useState('week');
  const [calDay, setCalDay] = useState(todayIdx);
  const [calFilterI, setCalFilterI] = useState('all');
  const [calFilterV, setCalFilterV] = useState('all');
  const [search, setSearch] = useState('');
  const [studentTab, setStudentTab] = useState('overview');
  const [payFilter, setPayFilter] = useState('all');
  const [dragId, setDragId] = useState(null);
  const [accent, setAccent] = useState('#2a6fdb');
  const toastTimer = useRef(null);
  const refreshTimer = useRef(null);
  const schoolIdRef = useRef(null);

  const T = (key) => translate(lang, key);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  // ---------------------------------------------------------------------------
  // Live mode: session bootstrap + data loading + realtime
  // ---------------------------------------------------------------------------
  const applyBundle = useCallback((b) => {
    setInstructors(b.instructors);
    setVehicles(b.vehicles);
    setStudents(b.students);
    setLessons(b.lessons);
    setPayments(b.payments);
    setExams(b.exams);
    setCourses(b.courses);
    setNotifs(b.notifs);
  }, []);

  const refresh = useCallback(async () => {
    if (!isLive || !schoolIdRef.current) return;
    try {
      applyBundle(await fetchSchoolBundle(schoolIdRef.current, monday));
    } catch (e) {
      console.error('refresh failed', e);
    }
  }, [applyBundle, monday]);

  // Coalesce bursts of realtime events / mutations into one refetch.
  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(refresh, 250);
  }, [refresh]);

  useEffect(() => {
    if (!isLive) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setBooting(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Public school directory for the landing page (works anonymously)
  useEffect(() => {
    if (!isLive || isLoggedIn) return;
    fetchPublicSchools().then(setPublicSchools).catch(e => console.error('directory load failed', e));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLive) return;
    let cancelled = false;

    async function bootstrap() {
      if (!session) {
        schoolIdRef.current = null;
        setIsLoggedIn(false); setUser(null); setPortal(null); setSchool(null);
        setBooting(false);
        return;
      }
      try {
        let profile = await fetchProfile(session.user.id);
        // Self-heal: account exists but was never provisioned (e.g. signed up
        // before the DB trigger was installed) → replay provisioning server-side.
        if (!profile || (!profile.school_id && profile.role !== 'superadmin')) {
          await supabase.rpc('ensure_account').catch(() => {});
          profile = await fetchProfile(session.user.id);
        }
        if (cancelled) return;
        if (!profile) throw new Error('Could not load your account profile.');

        if (profile.role === 'superadmin') {
          const stats = await fetchPlatformStats();
          if (cancelled) return;
          setPlatform(stats);
          setUser({ id: profile.id, name: profile.full_name, email: profile.email, role: 'superadmin' });
          setPortal('superadmin');
          setIsLoggedIn(true);
        } else if (profile.school_id) {
          schoolIdRef.current = profile.school_id;
          const [sch, bundle] = await Promise.all([
            fetchSchool(profile.school_id),
            fetchSchoolBundle(profile.school_id, monday),
          ]);
          if (cancelled) return;
          setSchool(sch);
          applyBundle(bundle);
          setUser({ id: profile.id, name: profile.full_name, email: profile.email, role: profile.role });
          setRole(profile.role);
          setPortal('school');
          setRoute('dashboard');
          setIsLoggedIn(true);
        } else {
          showToast('Your account is not linked to a school yet. Ask your school to invite you with this email.');
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error(e);
        showToast(e.message || 'Failed to load your account');
        await supabase.auth.signOut();
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime: any change in this school's tables → refetch (kept simple + always consistent)
  useEffect(() => {
    if (!isLive || !isLoggedIn || portal !== 'school' || !school?.id) return;
    const ch = supabase.channel('school-' + school.id);
    ['instructors', 'vehicles', 'students', 'lessons', 'payments', 'exams', 'courses', 'notifications']
      .forEach(table => ch.on('postgres_changes',
        { event: '*', schema: 'public', table, filter: 'school_id=eq.' + school.id },
        scheduleRefresh));
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isLoggedIn, portal, school?.id, scheduleRefresh]);

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------
  // Demo-mode auth (no Supabase configured): single email, role from password.
  const DEMO_EMAIL = 'you@example.com';
  const DEMO_PASS_ROLES = {
    superadmin: 'superadmin', owner: 'owner', admin: 'administrator',
    instructor: 'instructor', student: 'student',
  };

  async function authenticate(email, password) {
    if (isLive) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return { ok: true };
      const msg = /confirm/i.test(error.message)
        ? 'Your email is not confirmed yet — check your inbox for the confirmation link.'
        : error.message;
      return { ok: false, error: msg, unconfirmed: /confirm/i.test(error.message) };
    }
    if (email !== DEMO_EMAIL) return { ok: false, error: 'Invalid email or password.' };
    const r = DEMO_PASS_ROLES[password];
    if (!r) return { ok: false, error: 'Invalid email or password.' };
    if (r === 'superadmin') {
      setUser({ role: 'superadmin' });
      setPortal('superadmin');
      setIsLoggedIn(true);
    } else {
      loginSchool(r);
    }
    return { ok: true };
  }

  function loginSchool(r) {
    setUser({ role: r });
    setRole(r);
    setPortal('school');
    setRoute('dashboard');
    setIsLoggedIn(true);
  }

  // School registration (Signup page). In live mode the DB trigger creates the
  // school and makes this user its owner from the signUp metadata.
  async function registerSchool({ name, email, password, school: schoolData }) {
    if (!isLive) {
      setSchool(schoolData);
      loginSchool('owner');
      return { ok: true };
    }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, school: schoolData } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) return { ok: true, confirm: true }; // email confirmation required
    return { ok: true };
  }

  // Landing-page student enrollment. In live mode the DB trigger creates the
  // student row in the chosen school from the signUp metadata.
  async function enrollStudent({ name, email, password, schoolId, phone, cat }) {
    if (!isLive) {
      showToast('Enrolled at ' + (publicSchools.find(s => s.id === schoolId)?.name || 'school') + ' (demo)');
      loginSchool('student');
      return { ok: true };
    }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, enroll: { school_id: schoolId, phone: phone || '', cat: cat || 'B' } } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) return { ok: true, confirm: true };
    return { ok: true };
  }

  async function logout() {
    if (isLive) await supabase.auth.signOut();
    schoolIdRef.current = null;
    setIsLoggedIn(false);
    setUser(null);
    setPortal(null);
    setSchool(null);
    setSelStudent(null);
    setAuthScreen('landing');
  }

  function go(r) { setRoute(r); setSelStudent(null); setDrawerOpen(false); }
  function openStudent(id) { setRoute('students'); setSelStudent(id); setStudentTab('overview'); }
  function openModal(m) { setModal(m); }
  function closeModal() { setModal(null); }

  // Small helper for live writes: run, refetch, toast errors.
  async function live(fn) {
    try { await fn(); scheduleRefresh(); return true; }
    catch (e) { console.error(e); showToast(e.message || 'Something went wrong'); return false; }
  }

  // ---------------------------------------------------------------------------
  // Lessons
  // ---------------------------------------------------------------------------
  function setLessonStatus(id, status) {
    setLessons(ls => ls.map(l => l.id === id ? { ...l, status } : l)); // optimistic
    if (isLive) live(() => db.updateLesson(id, { status }));
    setModal(null);
    showToast(T(status));
  }

  function moveLesson(id, day, hour) {
    const l = lessons.find(x => x.id === id);
    if (!l || (l.day === day && l.hour === hour)) return;
    const conflict = lessons.find(x => x.id !== id && x.day === day && x.hour === hour && x.status !== 'cancelled' &&
      (x.instructorId === l.instructorId || x.vehicleId === l.vehicleId || x.studentId === l.studentId));
    if (conflict) {
      showToast(T('conflict'));
      setDragId(null);
      return;
    }
    setLessons(ls => ls.map(x => x.id === id ? { ...x, day, hour } : x)); // optimistic
    if (isLive) live(() => db.updateLesson(id, { lesson_date: toISODate(days[day]), hour }));
    setDragId(null);
    showToast(T('save') + ' ✓');
  }

  function createLesson(m) {
    if (!m.studentId || !m.instructorId) { showToast('Add a student and an instructor first'); return false; }
    const conflict = lessons.find(l => l.day === Number(m.day) && l.hour === Number(m.hour) && l.status !== 'cancelled' &&
      (l.instructorId === m.instructorId || l.vehicleId === m.vehicleId || l.studentId === m.studentId));
    if (conflict) { showToast(T('conflict')); return false; }
    if (isLive) {
      live(() => db.insertLesson(schoolIdRef.current, {
        studentId: m.studentId, instructorId: m.instructorId, vehicleId: m.vehicleId || null,
        date: toISODate(days[Number(m.day)]), hour: Number(m.hour), type: m.ltype || 'city',
      }));
    } else {
      setLessons(ls => [...ls, {
        id: uid('L'), day: Number(m.day), hour: Number(m.hour),
        studentId: m.studentId, instructorId: m.instructorId, vehicleId: m.vehicleId,
        status: 'scheduled', type: m.ltype || 'city', pickup: 'Qendra',
      }]);
    }
    setModal(null);
    showToast(T('new_lesson') + ' ✓');
    return true;
  }

  // ---------------------------------------------------------------------------
  // Students / payments / instructors / vehicles / exams
  // ---------------------------------------------------------------------------
  async function addStudent(s) {
    if (!s.name?.trim()) { showToast('Name is required'); return false; }
    if (isLive) {
      const ok = await live(() => db.insertStudent(schoolIdRef.current, s));
      if (ok) { setModal(null); showToast(T('add_student') + ' ✓'); }
      return ok;
    }
    const price = s.total === 20 ? 260 : s.total === 30 ? 360 : 460;
    const prog = {}; skills.forEach(k => { prog[k] = 1; });
    setStudents(st => [...st, {
      id: uid('s'), name: s.name, phone: s.phone || '', cat: s.cat || 'B',
      instructorId: s.instructorId, total: s.total, used: 0, remaining: s.total,
      payment: 'unpaid', price, paid: 0, due: price, progress: prog,
      joined: toISODate(new Date()), theory: 'not_taken', practical: 'not_taken', readiness: 30,
      email: s.email || '',
    }]);
    setModal(null);
    showToast(T('add_student') + ' ✓');
    return true;
  }

  async function updateStudent(id, s) {
    if (!s.name?.trim()) { showToast('Name is required'); return false; }
    if (isLive) {
      const ok = await live(() => db.updateStudent(id, s));
      if (ok) { setModal(null); showToast(T('save') + ' ✓'); }
      return ok;
    }
    setStudents(st => st.map(x => {
      if (x.id !== id) return x;
      const price = s.price;
      const paid = Math.min(price, x.paid);
      const due = Math.max(0, price - paid);
      return {
        ...x, name: s.name, phone: s.phone || '', cat: s.cat || x.cat,
        instructorId: s.instructorId, total: s.total, remaining: Math.max(0, s.total - x.used),
        price, paid, due, payment: due <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
        email: s.email || '',
      };
    }));
    setModal(null);
    showToast(T('save') + ' ✓');
    return true;
  }

  async function deleteStudent(id) {
    // Mirrors the DB's FK behavior: lessons/payments/exams.student_id → cascade delete.
    setStudents(st => st.filter(x => x.id !== id)); // optimistic
    setLessons(ls => ls.filter(l => l.studentId !== id));
    setPayments(ps => ps.filter(p => p.studentId !== id));
    setExams(xs => xs.filter(e => e.studentId !== id));
    if (isLive) live(() => db.deleteStudent(id));
    setSelStudent(null);
    setModal(null);
    showToast(T('delete') + ' ✓');
  }

  async function recordPayment(p) {
    const amount = Number(p.amount);
    if (!p.studentId || !amount || amount <= 0) { showToast('Pick a student and a valid amount'); return false; }
    if (isLive) {
      const ok = await live(() => db.insertPayment(schoolIdRef.current, { ...p, amount }));
      if (ok) { setModal(null); showToast(T('record_payment') + ' ✓'); }
      return ok;
    }
    setPayments(ps => [{ id: uid('p'), studentId: p.studentId, date: p.date, amount, method: p.method, note: p.note || '' }, ...ps]);
    setStudents(st => st.map(s => {
      if (s.id !== p.studentId) return s;
      const paid = s.paid + amount, due = Math.max(0, s.price - paid);
      return { ...s, paid, due, payment: due <= 0 ? 'paid' : 'partial' };
    }));
    setModal(null);
    showToast(T('record_payment') + ' ✓');
    return true;
  }

  async function deletePayment(id) {
    const p = payments.find(x => x.id === id);
    setPayments(ps => ps.filter(x => x.id !== id)); // optimistic
    if (p) {
      setStudents(st => st.map(s => {
        if (s.id !== p.studentId) return s;
        const paid = Math.max(0, s.paid - p.amount), due = Math.max(0, s.price - paid);
        return { ...s, paid, due, payment: due <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid' };
      }));
    }
    if (isLive) live(() => db.deletePayment(id));
    setModal(null);
    showToast(T('delete') + ' ✓');
  }

  async function addInstructor(i) {
    if (!i.name?.trim()) { showToast('Name is required'); return false; }
    if (isLive) {
      const ok = await live(() => db.insertInstructor(schoolIdRef.current, i));
      if (ok) { setModal(null); showToast(T('save') + ' ✓'); }
      return ok;
    }
    setInstructors(xs => [...xs, {
      id: uid('i'), name: i.name, cat: i.cat || 'B', phone: i.phone || '',
      color: i.color || '#2a6fdb', rating: 5.0, students: 0, vehicle: i.vehicleId || null, email: i.email || '',
    }]);
    setModal(null);
    showToast(T('save') + ' ✓');
    return true;
  }

  async function updateInstructor(id, i) {
    if (!i.name?.trim()) { showToast('Name is required'); return false; }
    if (isLive) {
      const ok = await live(() => db.updateInstructor(id, i));
      if (ok) { setModal(null); showToast(T('save') + ' ✓'); }
      return ok;
    }
    setInstructors(xs => xs.map(x => x.id === id ? {
      ...x, name: i.name, cat: i.cat || x.cat, phone: i.phone || '',
      color: i.color || x.color, vehicle: i.vehicleId || null, email: i.email || '',
    } : x));
    setModal(null);
    showToast(T('save') + ' ✓');
    return true;
  }

  async function deleteInstructor(id) {
    // Mirrors the DB's FK behavior: students.instructor_id → set null,
    // lessons.instructor_id → cascade delete (matches schema.sql).
    setInstructors(xs => xs.filter(x => x.id !== id)); // optimistic
    setStudents(st => st.map(s => s.instructorId === id ? { ...s, instructorId: null } : s));
    setLessons(ls => ls.filter(l => l.instructorId !== id));
    if (isLive) live(() => db.deleteInstructor(id));
    setModal(null);
    showToast(T('delete') + ' ✓');
  }

  async function addVehicle(v) {
    if (!v.name?.trim() || !v.plate?.trim()) { showToast('Name and plate are required'); return false; }
    if (isLive) {
      const ok = await live(() => db.insertVehicle(schoolIdRef.current, v));
      if (ok) { setModal(null); showToast(T('save') + ' ✓'); }
      return ok;
    }
    setVehicles(xs => [...xs, {
      id: uid('v'), name: v.name, plate: v.plate, cat: v.cat || 'B', year: v.year || null,
      reg: v.reg || null, ins: v.ins || null, km: v.km || 0, status: v.status || 'available', service: v.service || null,
    }]);
    setModal(null);
    showToast(T('save') + ' ✓');
    return true;
  }

  async function updateVehicle(id, v) {
    if (!v.name?.trim() || !v.plate?.trim()) { showToast('Name and plate are required'); return false; }
    if (isLive) {
      const ok = await live(() => db.updateVehicle(id, v));
      if (ok) { setModal(null); showToast(T('save') + ' ✓'); }
      return ok;
    }
    setVehicles(xs => xs.map(x => x.id === id ? {
      ...x, name: v.name, plate: v.plate, cat: v.cat || x.cat, year: v.year || null,
      reg: v.reg || null, ins: v.ins || null, km: v.km || 0,
      status: v.status || x.status, service: v.service || null,
    } : x));
    setModal(null);
    showToast(T('save') + ' ✓');
    return true;
  }

  async function deleteVehicle(id) {
    // Mirrors the DB's FK behavior: instructors.vehicle_id / lessons.vehicle_id → set null.
    setVehicles(xs => xs.filter(x => x.id !== id)); // optimistic
    setInstructors(xs => xs.map(i => i.vehicle === id ? { ...i, vehicle: null } : i));
    setLessons(ls => ls.map(l => l.vehicleId === id ? { ...l, vehicleId: null } : l));
    if (isLive) live(() => db.deleteVehicle(id));
    setModal(null);
    showToast(T('delete') + ' ✓');
  }

  async function addExam(e) {
    if (!e.studentId || !e.date) { showToast('Pick a student and a date'); return false; }
    if (isLive) {
      const ok = await live(() => db.insertExam(schoolIdRef.current, e));
      if (ok) { setModal(null); showToast(T('save') + ' ✓'); }
      return ok;
    }
    setExams(xs => [...xs, { id: uid('e'), studentId: e.studentId, type: e.type, date: e.date, status: 'scheduled' }]);
    setModal(null);
    showToast(T('save') + ' ✓');
    return true;
  }

  function setExamStatus(id, status) {
    setExams(xs => xs.map(x => x.id === id ? { ...x, status } : x)); // optimistic
    if (isLive) live(() => db.updateExam(id, { status }));
    showToast(T(status === 'passed' ? 'passed_quiz' : status === 'failed' ? 'failed_quiz' : status) + ' ✓');
  }

  async function deleteExam(id) {
    setExams(xs => xs.filter(x => x.id !== id)); // optimistic
    if (isLive) live(() => db.deleteExam(id));
    setModal(null);
    showToast(T('delete') + ' ✓');
  }

  function markAllNotifsRead() {
    setNotifs(ns => ns.map(n => ({ ...n, read: true }))); // optimistic
    if (isLive) live(() => db.markAllNotifsRead(schoolIdRef.current));
    showToast('Marked all read');
  }

  async function updateSchoolProfile(patch) {
    setSchool(s => ({ ...s, ...patch }));
    if (isLive) {
      const ok = await live(() => db.updateSchool(schoolIdRef.current, { ...school, ...patch }));
      if (ok) showToast(T('save') + ' ✓');
      return ok;
    }
    showToast(T('save') + ' ✓');
    return true;
  }

  // ---------------------------------------------------------------------------
  // Courses
  // ---------------------------------------------------------------------------
  function saveCourse(course) {
    const isNew = !courses.some(c => c.id === course.id);
    if (isLive) {
      live(() => db.saveCourse(schoolIdRef.current, course, isNew));
    }
    setCourses(cs => isNew ? [...cs, course] : cs.map(c => c.id === course.id ? course : c)); // optimistic
    showToast(T('save') + ' ✓');
  }

  function deleteCourse(id) {
    setCourses(cs => cs.filter(c => c.id !== id)); // optimistic
    if (isLive) live(() => db.deleteCourse(id));
    showToast(T('delete') + ' ✓');
  }

  // ---------------------------------------------------------------------------
  // Who am I, for role-scoped views. In live mode the instructor/student rows
  // are linked to the auth user via profile_id; demo mode falls back to row #1.
  // ---------------------------------------------------------------------------
  const meInstructor = (isLive && instructors.find(i => i.profileId === user?.id)) || instructors[0];
  const meStudent = (isLive && students.find(s => s.profileId === user?.id)) || students[0];
  const me = role === 'instructor' ? { ...(meInstructor || { name: user?.name || '' }), kind: 'instructor' }
    : role === 'student' ? { ...(meStudent || { name: user?.name || '' }), kind: 'student' }
    : { kind: 'staff', name: user?.name || 'Astrit Kuçi', role };

  const ctx = {
    lang, setLang, isLoggedIn, user, portal, school, me, isLive,
    authenticate, loginSchool, registerSchool, enrollStudent, publicSchools, logout,
    authScreen, setAuthScreen,
    role, setRole, drawerOpen, setDrawerOpen,
    route, go, mRoute, setMRoute,
    lessons, setLessons, notifs, setNotifs, markAllNotifsRead,
    courses, saveCourse, deleteCourse,
    selStudent, setSelStudent, openStudent,
    modal, setModal, openModal, closeModal,
    toast, showToast,
    calView, setCalView, calDay, setCalDay,
    calFilterI, setCalFilterI, calFilterV, setCalFilterV,
    search, setSearch, studentTab, setStudentTab,
    payFilter, setPayFilter, dragId, setDragId,
    accent, setAccent,
    days, todayIdx, hours,
    data: { instructors, vehicles, students, skills, payments, exams },
    platform,
    T, setLessonStatus, moveLesson, createLesson,
    addStudent, updateStudent, deleteStudent,
    recordPayment, deletePayment,
    addInstructor, updateInstructor, deleteInstructor,
    addVehicle, updateVehicle, deleteVehicle,
    addExam, setExamStatus, deleteExam,
    updateSchoolProfile,
  };

  if (booting) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0e1219 0%,#141c2b 60%,#1a1f2e 100%)', fontFamily: font.body }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, margin: '0 auto 14px', borderRadius: 15, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: font.disp, fontWeight: 700, fontSize: 22 }}>D</div>
          <div style={{ color: '#8d97a8', fontSize: 13, fontWeight: 600 }}>Loading DriveFlow…</div>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
