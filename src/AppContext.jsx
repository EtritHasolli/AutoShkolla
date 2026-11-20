import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { supabase, hasBackend } from './lib/supabase.js';
import { fetchSchoolBundle, fetchProfile, fetchSchool, fetchPlatformStats, fetchPublicSchools, db, onNetworkRetry } from './lib/db.js';
import { buildDemo, buildDemoDirectory, buildDemoPlatform } from './data/seed.js';
import { t as translate } from './data/i18n.js';
import { parseHash, buildHash } from './lib/router.js';
import { deriveStudents, deriveInstructors } from './lib/derive.js';
import { canOpen } from './lib/nav.js';
import { todayISO, addDays, weekStart, uid, toCSV, saveTextFile, DAY_KEYS, fmtDate } from './lib/format.js';
import { DEFAULT_PACKAGES, BRAND } from './lib/brand.js';
import { Capacitor } from '@capacitor/core';

const AppContext = createContext(null);

// Offline demo login (no backend): any email, the password picks the role.
const DEMO_PASSWORDS = { superadmin: 'superadmin', owner: 'owner', admin: 'administrator', administrator: 'administrator', receptionist: 'receptionist', instructor: 'instructor', student: 'student' };

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* private mode */ } },
};

export function AppProvider({ children }) {
  // ---- language -----------------------------------------------------------------
  const [lang, setLangState] = useState(() => store.get('as-lang', 'sq'));
  const setLang = useCallback((l) => { setLangState(l); store.set('as-lang', l); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const T = useCallback((k, v) => translate(lang, k, v), [lang]);

  // ---- session --------------------------------------------------------------------
  const [live, setLive] = useState(hasBackend);
  const [booting, setBooting] = useState(hasBackend);
  const [session, setSession] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [portal, setPortal] = useState(null); // 'school' | 'superadmin'
  const [role, setRole] = useState('owner');
  const [school, setSchool] = useState(null);
  const [recovery, setRecovery] = useState(false);
  const schoolIdRef = useRef(null);

  // ---- data -------------------------------------------------------------------------
  const [instructorsRaw, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [studentsRaw, setStudentsRaw] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [platform, setPlatform] = useState({ schools: [], trend: [] });
  const [publicSchools, setPublicSchools] = useState([]);
  const [directoryLoaded, setDirectoryLoaded] = useState(false);

  // ---- ui -----------------------------------------------------------------------------
  const [view, setView] = useState(() => parseHash());
  const [modal, setModal] = useState(null);
  const [sheet, setSheet] = useState(null); // 'more' | 'quick' (phone menus)
  const [toast, setToast] = useState(null);
  const [online, setOnline] = useState(() => navigator.onLine !== false);
  const [studentTab, setStudentTab] = useState('overview');
  const [payFilter, setPayFilter] = useState('all');
  const today = todayISO();
  const [calWeek, setCalWeek] = useState(() => weekStart(today));
  const [calDay, setCalDay] = useState(today);
  const [calView, setCalView] = useState('week');
  const [calFilterI, setCalFilterI] = useState('all');
  const [calFilterV, setCalFilterV] = useState('all');
  const toastTimer = useRef(null);
  const refreshTimer = useRef(null);
  const lastRetryToast = useRef(0);

  const showToast = useCallback((msg, tone = 'ok') => {
    setToast({ msg, tone, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), tone === 'error' ? 4200 : 2600);
  }, []);

  // ---- router -------------------------------------------------------------------------
  const navigate = useCallback((next, { replace } = {}) => {
    setView(next);
    const hash = buildHash(next);
    if (window.location.hash !== hash) {
      if (replace) window.history.replaceState(null, '', hash);
      else window.history.pushState(null, '', hash);
    }
  }, []);
  useEffect(() => {
    const onPop = () => { setModal(null); setSheet(null); setView(parseHash()); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const route = view.screen === 'app' ? view.route : 'dashboard';
  const selStudent = view.screen === 'app' && view.route === 'students' ? view.studentId : null;
  const go = useCallback((r) => { setSheet(null); navigate({ screen: 'app', route: r }); }, [navigate]);
  const openStudent = useCallback((id, tab = 'overview') => { setSheet(null); setModal(null); setStudentTab(tab); navigate({ screen: 'app', route: 'students', studentId: id }); }, [navigate]);
  const closeStudent = useCallback(() => navigate({ screen: 'app', route: 'students' }), [navigate]);
  const openModal = useCallback((m) => { setSheet(null); setModal(m); }, []);
  const closeModal = useCallback(() => setModal(null), []);

  // ---- demo data ----------------------------------------------------------------------
  const loadData = useCallback((b) => {
    setInstructors(b.instructors); setVehicles(b.vehicles); setStudentsRaw(b.students);
    setLessons(b.lessons); setPayments(b.payments); setExams(b.exams);
    setCourses(b.courses); setNotifs(b.notifs);
  }, []);
  const clearData = useCallback(() => loadData({ instructors: [], vehicles: [], students: [], lessons: [], payments: [], exams: [], courses: [], notifs: [] }), [loadData]);

  const enterSchool = useCallback((r, u, sch) => {
    setUser(u); setRole(r); setSchool(sch); setPortal('school'); setIsLoggedIn(true);
    setView(v => {
      const next = v.screen === 'app' && canOpen(r, v.route) ? v : { screen: 'app', route: 'dashboard' };
      window.history.replaceState(null, '', buildHash(next));
      return next;
    });
  }, []);
  const enterPlatform = useCallback((u) => {
    setUser(u); setRole('superadmin'); setPortal('superadmin'); setIsLoggedIn(true);
    setView(() => { const next = { screen: 'app', route: 'dashboard' }; window.history.replaceState(null, '', buildHash(next)); return next; });
  }, []);

  const startDemo = useCallback((r = 'owner') => {
    const d = buildDemo();
    loadData(d);
    setLive(false);
    setPlatform(buildDemoPlatform());
    store.set('as-demo', { role: r });
    const u = { id: 'demo-user', name: r === 'instructor' ? d.instructors[0].name : r === 'student' ? d.students[0].name : 'Astrit Kuçi', email: 'demo@autoshkolla.app', role: r };
    if (r === 'superadmin') enterPlatform(u);
    else enterSchool(r, u, d.school);
  }, [loadData, enterSchool, enterPlatform]);

  // First load: offline builds start on demo data; restore a saved demo session.
  useEffect(() => {
    if (!hasBackend) {
      const d = buildDemo();
      setPublicSchools(buildDemoDirectory(d.school));
      setDirectoryLoaded(true);
    }
    const saved = store.get('as-demo', null);
    if (saved?.role && !hasBackend) startDemo(saved.role);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- live mode: auth, bootstrap, realtime -------------------------------------------------
  const refresh = useCallback(async () => {
    if (!live || !schoolIdRef.current) return;
    try { loadData(await fetchSchoolBundle(schoolIdRef.current)); }
    catch (e) { console.error('refresh failed', e); }
  }, [live, loadData]);
  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(refresh, 250);
  }, [refresh]);

  useEffect(() => {
    if (!hasBackend) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) {
        setBooting(false);
        const saved = store.get('as-demo', null);
        if (saved?.role) startDemo(saved.role);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasBackend || isLoggedIn) return;
    fetchPublicSchools().then(list => { setPublicSchools(list); setDirectoryLoaded(true); })
      .catch(e => { console.error('directory load failed', e); setDirectoryLoaded(true); });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!hasBackend || !live) return;
    let cancelled = false;
    (async () => {
      if (!session) {
        schoolIdRef.current = null;
        setIsLoggedIn(false); setUser(null); setPortal(null); setSchool(null);
        setBooting(false);
        return;
      }
      try {
        let profile = await fetchProfile(session.user.id);
        if (!profile || (!profile.school_id && profile.role !== 'superadmin')) {
          try { await supabase.rpc('ensure_account'); } catch { /* older schema */ }
          profile = await fetchProfile(session.user.id);
        }
        if (cancelled) return;
        if (!profile) throw new Error(T('err_generic'));
        const u = { id: profile.id, name: profile.full_name || session.user.email, email: profile.email || session.user.email, role: profile.role };
        if (profile.role === 'superadmin') {
          const stats = await fetchPlatformStats();
          if (cancelled) return;
          setPlatform(stats);
          enterPlatform(u);
        } else if (profile.school_id) {
          schoolIdRef.current = profile.school_id;
          const [sch, bundle] = await Promise.all([fetchSchool(profile.school_id), fetchSchoolBundle(profile.school_id)]);
          if (cancelled) return;
          loadData(bundle);
          enterSchool(profile.role, u, sch);
        } else {
          showToast(T('not_linked'), 'error');
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) { showToast(e.message || T('err_generic'), 'error'); await supabase.auth.signOut(); }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session, live]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!live || !isLoggedIn || portal !== 'school' || !school?.id) return;
    const ch = supabase.channel('school-' + school.id);
    ['instructors', 'vehicles', 'students', 'lessons', 'payments', 'exams', 'courses', 'notifications']
      .forEach(table => ch.on('postgres_changes', { event: '*', schema: 'public', table, filter: 'school_id=eq.' + school.id }, scheduleRefresh));
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [live, isLoggedIn, portal, school?.id, scheduleRefresh]);

  // Flaky connections: show state, refetch when back online.
  useEffect(() => {
    const on = () => { setOnline(true); scheduleRefresh(); };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [scheduleRefresh]);
  useEffect(() => {
    onNetworkRetry(() => {
      if (Date.now() - lastRetryToast.current > 8000) { lastRetryToast.current = Date.now(); showToast(T('retrying')); }
    });
  }, [T, showToast]);

  // ---- auth actions ---------------------------------------------------------------------
  async function authenticate(email, password) {
    if (hasBackend) {
      if (!live) { setLive(true); clearData(); store.del('as-demo'); }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return { ok: true };
      const unconfirmed = /confirm/i.test(error.message);
      return { ok: false, error: unconfirmed ? T('err_unconfirmed') : /invalid/i.test(error.message) ? T('err_login') : error.message, unconfirmed };
    }
    const r = DEMO_PASSWORDS[password];
    if (!email.includes('@') || !r) return { ok: false, error: T('err_login') };
    startDemo(r);
    return { ok: true };
  }

  async function registerSchool({ name, email, password, school: s }) {
    if (!hasBackend) {
      startDemo('owner');
      setSchool(prev => ({ ...prev, ...s, packages: DEFAULT_PACKAGES, listed: true, acceptEnrollments: true }));
      return { ok: true };
    }
    if (!live) { setLive(true); clearData(); store.del('as-demo'); }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, school: s } } });
    if (error) return { ok: false, error: error.message };
    return { ok: true, confirm: !data.session };
  }

  async function enrollStudent({ name, email, password, schoolId, phone, cat }) {
    if (!hasBackend) {
      const sch = publicSchools.find(x => x.id === schoolId);
      startDemo('student');
      showToast(T('demo_enrolled', { name: sch?.name || '' }));
      return { ok: true };
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, enroll: { school_id: schoolId, phone: phone || '', cat: cat || 'B' } } } });
    if (error) return { ok: false, error: error.message };
    return { ok: true, confirm: !data.session };
  }

  async function resetPassword(email) {
    if (!hasBackend) return { ok: true };
    // Inside the Android app the origin is https://localhost, which a browser
    // can't open — let Supabase fall back to the Site URL (the website).
    const opts = Capacitor.isNativePlatform() ? {} : { redirectTo: window.location.origin + window.location.pathname };
    const { error } = await supabase.auth.resetPasswordForEmail(email, opts);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  async function resendConfirmation(email) {
    if (!hasBackend) return { ok: true };
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  async function changePassword(pw) {
    if (!live) { showToast(T('password_changed')); return true; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { showToast(error.message, 'error'); return false; }
    showToast(T('password_changed'));
    setRecovery(false);
    return true;
  }

  async function logout() {
    if (live && hasBackend) await supabase.auth.signOut();
    store.del('as-demo');
    if (!live && hasBackend) { setLive(true); clearData(); }
    schoolIdRef.current = null;
    setIsLoggedIn(false); setUser(null); setPortal(null); setSchool(null);
    setModal(null); setSheet(null);
    navigate({ screen: 'landing' }, { replace: true });
  }

  // Platform admins (profiles.role = 'superadmin', set with promote_to_superadmin)
  // can preview the app as any role. The database still enforces their access.
  const isDevAccount = user?.role === 'superadmin';
  function devSwitchView(v) {
    if (v === 'superadmin') { setPortal('superadmin'); if (!platform.schools.length) setPlatform(buildDemoPlatform()); }
    else { setPortal('school'); setRole(v); }
    navigate({ screen: 'app', route: 'dashboard' }, { replace: true });
  }

  // ---- writes ---------------------------------------------------------------------------
  // Every change is applied locally first (instant UI); in live mode it is then
  // written to Supabase and the realtime refetch reconciles with the server.
  async function write(fn) {
    if (!live) return true;
    try { await fn(); scheduleRefresh(); return true; }
    catch (e) {
      console.error(e);
      const msg = /row-level security|permission/i.test(e.message || '') ? T('err_permission') : (e.message || T('err_generic'));
      showToast(msg, 'error');
      scheduleRefresh();
      return false;
    }
  }

  function conflictFor(c, excludeId, extra = []) {
    for (const l of [...lessons, ...extra]) {
      if (l.id === excludeId || l.status === 'cancelled' || l.date !== c.date || l.hour !== c.hour) continue;
      if (l.instructorId === c.instructorId) return 'conflict_instructor';
      if (c.vehicleId && l.vehicleId === c.vehicleId) return 'conflict_vehicle';
      if (l.studentId === c.studentId) return 'conflict_student';
    }
    return null;
  }

  function createLessons(m) {
    if (!m.studentId) { showToast(T('err_add_student_first'), 'error'); return false; }
    if (!m.instructorId) { showToast(T('err_add_instructor_first'), 'error'); return false; }
    const weeks = Math.max(1, Number(m.repeat) || 1);
    const made = [];
    let skipped = 0, firstConflict = null;
    for (let w = 0; w < weeks; w++) {
      const c = {
        id: uid('tmp'), date: addDays(m.date, w * 7), hour: Number(m.hour), studentId: m.studentId,
        instructorId: m.instructorId, vehicleId: m.vehicleId || null, type: m.type || 'city',
        pickup: (m.pickup || '').trim(), status: 'scheduled',
      };
      const cf = conflictFor(c, null, made);
      if (cf) { skipped++; firstConflict = firstConflict || cf; continue; }
      made.push(c);
    }
    if (!made.length) { showToast(T(firstConflict), 'error'); return false; }
    setLessons(ls => [...ls, ...made]);
    write(() => db.insertLessons(schoolIdRef.current, made));
    setModal(null);
    showToast(made.length === 1 && !skipped ? T('lesson_saved')
      : T('lessons_created', { n: made.length }) + (skipped ? ' · ' + T('lessons_skipped', { n: skipped }) : ''), skipped ? 'warn' : 'ok');
    return true;
  }

  function moveLesson(id, date, hour) {
    const l = lessons.find(x => x.id === id);
    if (!l || (l.date === date && l.hour === hour)) return;
    const cf = conflictFor({ ...l, date, hour }, id);
    if (cf) { showToast(T(cf), 'error'); return; }
    setLessons(ls => ls.map(x => x.id === id ? { ...x, date, hour } : x));
    write(() => db.updateLesson(id, { lesson_date: date, hour }));
    showToast(T('lesson_moved'));
  }

  function editLesson(id, m) {
    const l = lessons.find(x => x.id === id);
    if (!l) return false;
    const next = { ...l, date: m.date, hour: Number(m.hour), studentId: m.studentId, instructorId: m.instructorId, vehicleId: m.vehicleId || null, type: m.type || 'city', pickup: (m.pickup || '').trim() };
    const cf = next.status === 'cancelled' ? null : conflictFor(next, id);
    if (cf) { showToast(T(cf), 'error'); return false; }
    setLessons(ls => ls.map(x => x.id === id ? next : x));
    write(() => db.updateLesson(id, { lesson_date: next.date, hour: next.hour, student_id: next.studentId, instructor_id: next.instructorId, vehicle_id: next.vehicleId, type: next.type, pickup: next.pickup }));
    setModal(null);
    showToast(T('saved'));
    return true;
  }

  function setLessonStatus(id, status) {
    const l = lessons.find(x => x.id === id);
    if (!l) return;
    if (l.status === 'cancelled' && status !== 'cancelled') {
      const cf = conflictFor({ ...l, status }, id);
      if (cf) { showToast(T(cf), 'error'); return; }
    }
    setLessons(ls => ls.map(x => x.id === id ? { ...x, status } : x));
    write(() => db.updateLesson(id, { status }));
    setModal(null);
    showToast(T(status));
  }

  function deleteLesson(id) {
    setLessons(ls => ls.filter(l => l.id !== id));
    write(() => db.deleteLesson(id));
    setModal(null);
    showToast(T('deleted'));
  }

  function addStudent(s) {
    if (!s.name?.trim()) { showToast(T('err_name_required'), 'error'); return null; }
    const row = {
      id: uid('tmp'), name: s.name.trim(), phone: s.phone || '', email: (s.email || '').trim(), cat: s.cat || 'B',
      instructorId: s.instructorId || null, total: Number(s.total) || 20, price: Number(s.price) || 0,
      packageName: s.packageName || '', progress: {}, joined: today, theory: 'not_taken', practical: 'not_taken',
      notes: s.notes || '', usedBase: 0,
    };
    setStudentsRaw(st => [...st, row]);
    write(() => db.insertStudent(schoolIdRef.current, row));
    setModal(null);
    showToast(T('saved'));
    return row.id;
  }

  function updateStudent(id, s) {
    if (!s.name?.trim()) { showToast(T('err_name_required'), 'error'); return false; }
    const cur = studentsRaw.find(x => x.id === id);
    if (!cur) return false;
    const merged = { ...cur, ...s, name: s.name.trim(), total: Number(s.total) || cur.total, price: Number(s.price) || 0 };
    setStudentsRaw(st => st.map(x => x.id === id ? merged : x));
    write(() => db.updateStudent(id, merged));
    setModal(null);
    showToast(T('saved'));
    return true;
  }

  // Small field updates from the profile (skill scores, notes) — no toast spam.
  function updateStudentFields(id, patch, toastKey) {
    setStudentsRaw(st => st.map(x => x.id === id ? { ...x, ...patch } : x));
    const dbPatch = {};
    if ('progress' in patch) dbPatch.progress = patch.progress;
    if ('notes' in patch) dbPatch.notes = patch.notes;
    write(() => db.updateStudentFields(id, dbPatch));
    if (toastKey) showToast(T(toastKey));
  }

  function deleteStudent(id) {
    setStudentsRaw(st => st.filter(x => x.id !== id));
    setLessons(ls => ls.filter(l => l.studentId !== id));
    setPayments(ps => ps.filter(p => p.studentId !== id));
    setExams(xs => xs.filter(e => e.studentId !== id));
    write(() => db.deleteStudent(id));
    setModal(null);
    if (selStudent === id) navigate({ screen: 'app', route: 'students' }, { replace: true });
    showToast(T('deleted'));
  }

  function recordPayment(p) {
    const amount = Math.round(Number(p.amount) * 100) / 100;
    if (!p.studentId || !amount || amount <= 0) { showToast(T('err_amount'), 'error'); return null; }
    const row = { id: uid('tmp'), studentId: p.studentId, date: p.date || today, amount, method: p.method || 'cash', note: (p.note || '').trim() };
    setPayments(ps => [row, ...ps]);
    write(() => db.insertPayment(schoolIdRef.current, row));
    showToast(T('payment_recorded'));
    setModal({ type: 'receipt', payment: row });
    return row;
  }

  function deletePayment(id) {
    setPayments(ps => ps.filter(x => x.id !== id));
    write(() => db.deletePayment(id));
    setModal(null);
    showToast(T('deleted'));
  }

  function saveInstructor(id, i) {
    if (!i.name?.trim()) { showToast(T('err_name_required'), 'error'); return false; }
    if (id) {
      setInstructors(xs => xs.map(x => x.id === id ? { ...x, ...i, vehicle: i.vehicleId || null } : x));
      write(() => db.updateInstructor(id, i));
    } else {
      const row = { id: uid('tmp'), rating: 5, ...i, vehicle: i.vehicleId || null };
      setInstructors(xs => [...xs, row]);
      write(() => db.insertInstructor(schoolIdRef.current, i));
    }
    setModal(null);
    showToast(T('saved'));
    return true;
  }

  function deleteInstructor(id) {
    setInstructors(xs => xs.filter(x => x.id !== id));
    setStudentsRaw(st => st.map(s => s.instructorId === id ? { ...s, instructorId: null } : s));
    setLessons(ls => ls.filter(l => l.instructorId !== id));
    write(() => db.deleteInstructor(id));
    setModal(null);
    showToast(T('deleted'));
  }

  function saveVehicle(id, v) {
    if (!v.name?.trim() || !v.plate?.trim()) { showToast(T('err_name_plate'), 'error'); return false; }
    if (id) {
      setVehicles(xs => xs.map(x => x.id === id ? { ...x, ...v } : x));
      write(() => db.updateVehicle(id, v));
    } else {
      setVehicles(xs => [...xs, { id: uid('tmp'), ...v }]);
      write(() => db.insertVehicle(schoolIdRef.current, v));
    }
    setModal(null);
    showToast(T('saved'));
    return true;
  }

  function deleteVehicle(id) {
    setVehicles(xs => xs.filter(x => x.id !== id));
    setInstructors(xs => xs.map(i => i.vehicle === id ? { ...i, vehicle: null } : i));
    setLessons(ls => ls.map(l => l.vehicleId === id ? { ...l, vehicleId: null } : l));
    write(() => db.deleteVehicle(id));
    setModal(null);
    showToast(T('deleted'));
  }

  function addExam(e) {
    if (!e.studentId || !e.date) { showToast(T('err_student_date'), 'error'); return false; }
    const row = { id: uid('tmp'), studentId: e.studentId, type: e.type || 'theory', date: e.date, status: 'scheduled' };
    setExams(xs => [...xs, row]);
    write(() => db.insertExam(schoolIdRef.current, row));
    setModal(null);
    showToast(T('saved'));
    return true;
  }

  function updateExam(id, patch) {
    setExams(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x));
    write(() => db.updateExam(id, patch));
    setModal(null);
    showToast(T(patch.status && patch.status !== 'scheduled' ? 'exam_result_saved' : 'saved'));
  }

  function deleteExam(id) {
    setExams(xs => xs.filter(x => x.id !== id));
    write(() => db.deleteExam(id));
    setModal(null);
    showToast(T('deleted'));
  }

  function saveCourse(course) {
    const isNew = !courses.some(c => c.id === course.id);
    setCourses(cs => isNew ? [...cs, course] : cs.map(c => c.id === course.id ? course : c));
    write(() => db.saveCourse(schoolIdRef.current, course, isNew));
    showToast(T('saved'));
  }
  function deleteCourse(id) {
    setCourses(cs => cs.filter(c => c.id !== id));
    write(() => db.deleteCourse(id));
    showToast(T('deleted'));
  }

  function markAllNotifsRead() {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    write(() => db.markAllNotifsRead(schoolIdRef.current));
  }

  async function updateSchool(patch, { quiet } = {}) {
    const merged = { ...school, ...patch };
    setSchool(merged);
    const ok = await write(() => db.updateSchool(schoolIdRef.current, merged));
    if (ok && !quiet) showToast(T('saved'));
    return ok;
  }
  const savePackages = (list) => updateSchool({ packages: list });

  function updateSchoolAdmin(id, patch) {
    setPlatform(p => ({ ...p, schools: p.schools.map(s => s.id === id ? { ...s, ...patch } : s) }));
    write(() => db.updateSchoolAdmin(id, patch));
    showToast(T('saved'));
  }

  // ---- derived ----------------------------------------------------------------------------
  const students = useMemo(() => deriveStudents(studentsRaw, lessons, payments, exams), [studentsRaw, lessons, payments, exams]);
  const instructors = useMemo(() => deriveInstructors(instructorsRaw, studentsRaw), [instructorsRaw, studentsRaw]);
  const packages = school?.packages?.length ? school.packages : DEFAULT_PACKAGES;

  const hours = useMemo(() => {
    const a = parseInt(school?.hoursStart || '8', 10);
    const b = parseInt(school?.hoursEnd || '18', 10);
    const out = [];
    for (let h = isNaN(a) ? 8 : a; h < (isNaN(b) ? 18 : b); h++) out.push(h);
    return out.length ? out : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  }, [school?.hoursStart, school?.hoursEnd]);
  const workDays = useMemo(() => {
    const idx = (school?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(d => DAY_KEYS.indexOf(d)).filter(i => i >= 0);
    return idx.length ? idx.sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5];
  }, [school?.workingDays]);

  // Who am I — in live mode the instructor/student row is linked via profile_id.
  const meInstructor = live ? instructors.find(i => i.profileId === user?.id) : instructors[0];
  const meStudent = live ? students.find(s => s.profileId === user?.id) : students[0];
  const me = role === 'instructor' ? (meInstructor ? { ...meInstructor, kind: 'instructor' } : { kind: 'instructor', missing: true, name: user?.name || '' })
    : role === 'student' ? (meStudent ? { ...meStudent, kind: 'student' } : { kind: 'student', missing: true, name: user?.name || '' })
    : { kind: 'staff', name: user?.name || '', role };

  // ---- export -----------------------------------------------------------------------------
  async function exportCSV(kind) {
    const iName = (id) => instructors.find(i => i.id === id)?.name || '';
    const sName = (id) => students.find(s => s.id === id)?.name || '';
    const vName = (id) => vehicles.find(v => v.id === id)?.name || '';
    let rows;
    if (kind === 'students') {
      rows = [[T('name'), T('phone'), T('email'), T('category'), T('instructor'), T('package'), T('lessons'), T('price'), T('paid_amount'), T('due_amount'), T('theory_exam'), T('practical_exam'), T('joined'), T('notes')]];
      students.forEach(s => rows.push([s.name, s.phone, s.email, s.cat, iName(s.instructorId), s.packageName, s.used + '/' + s.total, s.price, s.paid, s.due, T(s.theory), T(s.practical), s.joined, s.notes]));
    } else if (kind === 'lessons') {
      rows = [[T('date'), T('time'), T('student'), T('instructor'), T('vehicle'), T('type'), T('status'), T('pickup')]];
      [...lessons].sort((a, b) => (a.date + a.hour).localeCompare(b.date + b.hour))
        .forEach(l => rows.push([l.date, l.hour + ':00', sName(l.studentId), iName(l.instructorId), vName(l.vehicleId), T(l.type === 'highway' ? 'highway' : 'city_drive'), T(l.status), l.pickup]));
    } else {
      rows = [[T('date'), T('student'), T('amount'), T('method'), T('note')]];
      payments.forEach(p => rows.push([p.date, sName(p.studentId), p.amount, T(p.method), p.note]));
    }
    const slug = (school?.name || BRAND).toLowerCase().replace(/[^a-z0-9]+/gi, '-');
    try {
      await saveTextFile(`${slug}-${kind}-${today}.csv`, toCSV(rows));
      showToast(T('export_done'));
    } catch (e) {
      if (!/cancel/i.test(e?.message || '')) showToast(e.message || T('err_generic'), 'error');
    }
  }

  // ---- context -----------------------------------------------------------------------------
  const ctx = {
    lang, setLang, T, live, hasBackend, isDemo: !live, booting, isLoggedIn, user, portal, role, school, me,
    view, navigate, route, selStudent, go, openStudent, closeStudent,
    authenticate, registerSchool, enrollStudent, resetPassword, resendConfirmation, changePassword, logout,
    startDemo, recovery, setRecovery,
    isDevAccount, devSwitchView,
    publicSchools, directoryLoaded, platform, updateSchoolAdmin,
    modal, setModal, openModal, closeModal, sheet, setSheet, toast, showToast, online,
    studentTab, setStudentTab, payFilter, setPayFilter,
    calWeek, setCalWeek, calDay, setCalDay, calView, setCalView, calFilterI, setCalFilterI, calFilterV, setCalFilterV,
    today, hours, workDays,
    data: { instructors, vehicles, students, payments, exams, packages },
    lessons, courses, notifs,
    createLessons, editLesson, moveLesson, setLessonStatus, deleteLesson, conflictFor,
    addStudent, updateStudent, updateStudentFields, deleteStudent,
    recordPayment, deletePayment,
    saveInstructor, deleteInstructor, saveVehicle, deleteVehicle,
    addExam, updateExam, deleteExam,
    saveCourse, deleteCourse, markAllNotifsRead,
    updateSchool, savePackages, exportCSV,
    fmtDate: (iso, opts) => fmtDate(iso, lang, opts),
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
