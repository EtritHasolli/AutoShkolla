// Which screens each role can open, in sidebar order, plus the 4 tabs shown on
// the phone tab bar (everything else goes under "More").
const STAFF = ['owner', 'administrator', 'receptionist'];

export const NAV = [
  { key: 'dashboard', icon: 'dashboard', roles: [...STAFF, 'instructor', 'student'] },
  { key: 'calendar', icon: 'calendar', roles: [...STAFF, 'instructor', 'student'] },
  { key: 'students', icon: 'students', roles: [...STAFF, 'instructor'] },
  { key: 'payments', icon: 'payments', roles: [...STAFF, 'student'] },
  { key: 'exams', icon: 'exams', roles: [...STAFF, 'student'] },
  { key: 'courses', icon: 'courses', roles: ['owner', 'administrator', 'instructor', 'student'] },
  { key: 'instructors', icon: 'instructors', roles: ['owner', 'administrator'], group: 'manage' },
  { key: 'vehicles', icon: 'car', roles: ['owner', 'administrator'], group: 'manage' },
  { key: 'packages', icon: 'packages', roles: ['owner', 'administrator'], group: 'manage' },
  { key: 'reports', icon: 'reports', roles: ['owner'], group: 'manage' },
  { key: 'notifications', icon: 'bell', roles: STAFF, group: 'manage' },
  { key: 'settings', icon: 'settings', roles: ['owner', 'administrator'], group: 'school' },
  { key: 'profile', icon: 'user', roles: [...STAFF, 'instructor', 'student'], hidden: true },
];

const TABS = {
  owner: ['dashboard', 'calendar', 'students', 'payments'],
  administrator: ['dashboard', 'calendar', 'students', 'payments'],
  receptionist: ['dashboard', 'calendar', 'students', 'payments'],
  instructor: ['dashboard', 'calendar', 'students', 'courses'],
  student: ['dashboard', 'calendar', 'courses', 'payments'],
};

export function navFor(role) { return NAV.filter(n => n.roles.includes(role)); }
export function canOpen(role, key) { return navFor(role).some(n => n.key === key); }
export function tabsFor(role) {
  const tabs = (TABS[role] || TABS.owner).map(k => NAV.find(n => n.key === k));
  const more = navFor(role).filter(n => !(TABS[role] || []).includes(n.key));
  return { tabs, more };
}

// Labels differ slightly per role (an instructor's "dashboard" is "Today").
export function navLabel(T, role, key, short) {
  if (key === 'dashboard') return role === 'instructor' ? T('today') : role === 'student' ? T('home') : T('dashboard');
  if (key === 'calendar' && (role === 'instructor' || role === 'student')) return T('schedule');
  if (key === 'students' && role === 'instructor' && !short) return T('my_students');
  return T(key);
}

export const isStaff = (role) => STAFF.includes(role);
