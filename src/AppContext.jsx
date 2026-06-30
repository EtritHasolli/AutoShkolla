import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { initialLessons, notifications as seedNotifications, payments as seedPayments, students, instructors, vehicles, exams, skills, getWeekDays, hours } from './data/seed.js';
import { initialCourses } from './data/courses.js';
import { t as translate } from './data/i18n.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { days, todayIdx } = getWeekDays();
  const [lang, setLang] = useState('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [portal, setPortal] = useState(null); // 'school' | 'superadmin'
  const [school, setSchool] = useState(null); // onboarding data
  const [authScreen, setAuthScreen] = useState('login');
  const [role, setRole] = useState('owner');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [route, setRoute] = useState('dashboard');
  const [mRoute, setMRoute] = useState('today');
  const [lessons, setLessons] = useState(initialLessons);
  const [courses, setCourses] = useState(initialCourses);
  const [notifs, setNotifs] = useState(seedNotifications);
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

  const T = (key) => translate(lang, key);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  // Hardcoded demo auth — single email, role decided by the password.
  const DEMO_EMAIL = 'you@example.com';
  const DEMO_PASS_ROLES = {
    superadmin: 'superadmin',
    owner: 'owner',
    admin: 'administrator',
    instructor: 'instructor',
    student: 'student',
  };

  // Returns true on success, false on bad credentials.
  function authenticate(email, password) {
    if (email !== DEMO_EMAIL) return false;
    const role = DEMO_PASS_ROLES[password];
    if (!role) return false;
    if (role === 'superadmin') {
      setUser({ role: 'superadmin' });
      setPortal('superadmin');
      setIsLoggedIn(true);
    } else {
      loginSchool(role);
    }
    return true;
  }

  function loginSchool(role) {
    setUser({ role });
    setRole(role);
    setPortal('school');
    setRoute('dashboard');
    setIsLoggedIn(true);
  }

  function completeOnboarding(schoolData, ownerCreds) {
    setSchool(schoolData);
    loginSchool('owner');
  }

  function logout() {
    setIsLoggedIn(false);
    setUser(null);
    setPortal(null);
    setSchool(null);
    setSelStudent(null);
    setAuthScreen('login');
  }

  function go(r) { setRoute(r); setSelStudent(null); setDrawerOpen(false); }
  function openStudent(id) { setRoute('students'); setSelStudent(id); setStudentTab('overview'); }
  function openModal(m) { setModal(m); }
  function closeModal() { setModal(null); }

  function setLessonStatus(id, status) {
    setLessons(ls => ls.map(l => l.id === id ? { ...l, status } : l));
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
    setLessons(ls => ls.map(x => x.id === id ? { ...x, day, hour } : x));
    setDragId(null);
    showToast(T('save') + ' ✓');
  }

  function createLesson(m) {
    const conflict = lessons.find(l => l.day === Number(m.day) && l.hour === Number(m.hour) && l.status !== 'cancelled' &&
      (l.instructorId === m.instructorId || l.vehicleId === m.vehicleId || l.studentId === m.studentId));
    if (conflict) { showToast(T('conflict')); return false; }
    setLessons(ls => [...ls, {
      id: 'L' + Date.now(), day: Number(m.day), hour: Number(m.hour),
      studentId: m.studentId, instructorId: m.instructorId, vehicleId: m.vehicleId,
      status: 'scheduled', type: m.ltype || 'city', pickup: 'Qendra',
    }]);
    setModal(null);
    showToast(T('new_lesson') + ' ✓');
    return true;
  }

  function markAllNotifsRead() {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    showToast('Marked all read');
  }

  // ---- Courses CRUD ----
  function saveCourse(course) {
    setCourses(cs => {
      const exists = cs.some(c => c.id === course.id);
      return exists ? cs.map(c => c.id === course.id ? course : c) : [...cs, course];
    });
    showToast(T('save') + ' ✓');
  }

  function deleteCourse(id) {
    setCourses(cs => cs.filter(c => c.id !== id));
    showToast(T('delete') + ' ✓');
  }

  // Which seed identity the logged-in person *is*, for role-scoped views.
  // owner/admin/receptionist see everything; instructor is i1, student is s1.
  const meInstructor = instructors[0];
  const meStudent = students[0];
  const me = role === 'instructor' ? { ...meInstructor, kind: 'instructor' }
    : role === 'student' ? { ...meStudent, kind: 'student' }
    : { kind: 'staff', name: 'Astrit Kuçi', role };

  const ctx = {
    lang, setLang, isLoggedIn, user, portal, school, me,
    authenticate, loginSchool, completeOnboarding, logout,
    authScreen, setAuthScreen,
    role, setRole, drawerOpen, setDrawerOpen,
    route, go, mRoute, setMRoute,
    lessons, setLessons, notifs, setNotifs, markAllNotifsRead,
    courses, saveCourse, deleteCourse,
    selStudent, setSelStudent, openStudent,
    modal, openModal, closeModal,
    toast, showToast,
    calView, setCalView, calDay, setCalDay,
    calFilterI, setCalFilterI, calFilterV, setCalFilterV,
    search, setSearch, studentTab, setStudentTab,
    payFilter, setPayFilter, dragId, setDragId,
    accent, setAccent,
    days, todayIdx, hours,
    data: { instructors, vehicles, students, skills, payments: seedPayments, exams },
    T, setLessonStatus, moveLesson, createLesson,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
