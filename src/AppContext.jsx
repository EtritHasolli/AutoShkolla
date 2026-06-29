import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { initialLessons, notifications as seedNotifications, payments as seedPayments, students, instructors, vehicles, exams, skills, getWeekDays, hours } from './data/seed.js';
import { t as translate } from './data/i18n.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { days, todayIdx } = getWeekDays();
  const [lang, setLang] = useState('en');
  const [device, setDevice] = useState('desktop');
  const [role, setRole] = useState('owner');
  const [mRole, setMRole] = useState('instructor');
  const [route, setRoute] = useState('dashboard');
  const [mRoute, setMRoute] = useState('today');
  const [lessons, setLessons] = useState(initialLessons);
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

  function go(r) { setRoute(r); setSelStudent(null); }
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

  const ctx = {
    lang, setLang, device, setDevice, role, setRole, mRole, setMRole,
    route, go, mRoute, setMRoute,
    lessons, setLessons, notifs, setNotifs, markAllNotifsRead,
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
