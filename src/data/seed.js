export const C = {
  ink: '#0f141b', ink2: '#3a4453', mut: '#7c8694', soft: '#9aa3b1',
  line: '#e6eaf1', line2: '#eef1f7', bg: '#eef1f6', surf: '#ffffff',
  side: '#0e1219', sidePanel: '#141a23', sideMut: '#8d97a8', sideLine: '#202833', sideActive: '#1b2330',
  pri: '#2a6fdb', priD: '#1f59bd', priBg: '#e9f1fd', priSoft: '#f3f8fe',
  grn: '#1f8a5b', grnBg: '#e5f3ec',
  amb: '#b9821a', ambBg: '#f6eed9',
  red: '#d6493a', redBg: '#fbe8e5',
  vio: '#6557d1', vioBg: '#eae8fa',
  teal: '#0e8f9b', tealBg: '#e2f2f3',
};

export const font = {
  disp: "'Space Grotesk', sans-serif",
  body: "'Manrope', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const instructors = [
  { id: 'i1', name: 'Arben Krasniqi', cat: 'B', phone: '+383 44 211 980', color: C.pri, rating: 4.8, students: 9, vehicle: 'v1' },
  { id: 'i2', name: 'Vlora Berisha', cat: 'B', phone: '+383 45 330 114', color: C.vio, rating: 4.9, students: 11, vehicle: 'v2' },
  { id: 'i3', name: 'Driton Gashi', cat: 'B,C', phone: '+383 49 870 552', color: C.teal, rating: 4.6, students: 7, vehicle: 'v3' },
  { id: 'i4', name: 'Fatlume Hoxha', cat: 'B', phone: '+383 44 615 203', color: C.amb, rating: 4.7, students: 8, vehicle: 'v4' },
];

export const vehicles = [
  { id: 'v1', name: 'VW Golf 7', plate: '01-123-AB', cat: 'B', year: 2019, reg: '2026-09-12', ins: '2026-07-04', km: 142300, status: 'available', service: '2026-08-01' },
  { id: 'v2', name: 'Opel Astra', plate: '02-456-CD', cat: 'B', year: 2020, reg: '2026-11-20', ins: '2027-02-18', km: 98750, status: 'in_use', service: '2026-09-15' },
  { id: 'v3', name: 'Škoda Fabia', plate: '03-789-EF', cat: 'B', year: 2018, reg: '2026-07-09', ins: '2026-12-01', km: 176400, status: 'available', service: '2026-07-10' },
  { id: 'v4', name: 'Toyota Yaris', plate: '04-012-GH', cat: 'B', year: 2021, reg: '2027-04-30', ins: '2026-07-22', km: 61200, status: 'maintenance', service: '2026-06-30' },
];

const fn = ['Endrit', 'Rina', 'Blerim', 'Adelina', 'Festim', 'Donika', 'Granit', 'Leotrim', 'Albina', 'Yll', 'Erblin', 'Kaltrina'];
const ln = ['Morina', 'Shala', 'Rexhepi', 'Kelmendi', 'Bytyqi', 'Zeqiri', 'Haliti', 'Ademi', 'Murati', 'Dauti', 'Bardhi', 'Veliu'];
export const skills = ['parking', 'reverse', 'highway', 'clutch', 'roundabout', 'lane'];

export const students = [];
for (let i = 0; i < 12; i++) {
  const total = [20, 30, 40][i % 3];
  const used = Math.min(total, 4 + ((i * 7) % total));
  const pay = ['paid', 'partial', 'unpaid', 'paid', 'partial', 'paid', 'unpaid', 'partial', 'paid', 'paid', 'partial', 'unpaid'][i];
  const ins = instructors[i % 4];
  const prog = {};
  skills.forEach((s, si) => { prog[s] = Math.max(1, Math.min(5, 2 + ((i + si) % 4))); });
  const price = total === 20 ? 260 : total === 30 ? 360 : 460;
  const paidAmt = pay === 'paid' ? price : pay === 'partial' ? Math.round(price * 0.5) : (pay === 'unpaid' && i % 3 === 0 ? 0 : 80);
  students.push({
    id: 's' + (i + 1), name: fn[i] + ' ' + ln[i], phone: '+383 4' + (3 + i % 6) + ' ' + (100 + i * 7) + ' ' + (200 + i * 3),
    cat: 'B', instructorId: ins.id, total, used, remaining: total - used, payment: pay,
    price, paid: paidAmt, due: price - paidAmt, progress: prog,
    joined: ['2026-03-12', '2026-04-02', '2026-02-20', '2026-05-09', '2026-01-30', '2026-04-22', '2026-03-01', '2026-05-18', '2026-02-11', '2026-04-15', '2026-03-27', '2026-05-30'][i],
    theory: i % 3 === 0 ? 'passed' : i % 3 === 1 ? 'scheduled' : 'not_taken',
    practical: i % 4 === 0 ? 'passed' : 'not_taken',
    readiness: Math.min(100, 38 + used * 2 + (i % 3) * 6),
  });
}

export const payments = [
  { id: 'p1', studentId: 's1', date: '2026-06-26', amount: 260, method: 'cash', note: 'Full package 20' },
  { id: 'p2', studentId: 's2', date: '2026-06-25', amount: 180, method: 'bank', note: 'Partial' },
  { id: 'p3', studentId: 's6', date: '2026-06-24', amount: 460, method: 'cash', note: 'Full package 40' },
  { id: 'p4', studentId: 's5', date: '2026-06-22', amount: 180, method: 'cash', note: 'Partial' },
  { id: 'p5', studentId: 's9', date: '2026-06-20', amount: 360, method: 'bank', note: 'Full package 30' },
  { id: 'p6', studentId: 's4', date: '2026-06-18', amount: 80, method: 'other', note: 'Deposit' },
  { id: 'p7', studentId: 's10', date: '2026-06-15', amount: 260, method: 'cash', note: 'Full package 20' },
];

export const exams = [
  { id: 'e1', studentId: 's1', type: 'practical', date: '2026-07-02', status: 'scheduled' },
  { id: 'e2', studentId: 's4', type: 'theory', date: '2026-07-01', status: 'scheduled' },
  { id: 'e3', studentId: 's7', type: 'theory', date: '2026-07-03', status: 'scheduled' },
  { id: 'e4', studentId: 's10', type: 'practical', date: '2026-06-28', status: 'passed' },
  { id: 'e5', studentId: 's2', type: 'theory', date: '2026-06-20', status: 'failed' },
];

export const notifications = [
  { id: 'n1', type: 'reminder', title: 'Lesson reminder', body: 'Endrit Morina — tomorrow 09:00', time: '2h ago', status: 'sent', read: false },
  { id: 'n2', type: 'payment', title: 'Payment reminder', body: 'Blerim Rexhepi — €180 remaining', time: '5h ago', status: 'pending', read: false },
  { id: 'n3', type: 'cancel', title: 'Lesson cancelled', body: 'Festim Bytyqi cancelled Wed 16:00', time: '1d ago', status: 'sent', read: true },
  { id: 'n4', type: 'alert', title: 'Insurance expiring', body: 'VW Golf 7 — insurance ends Jul 4', time: '1d ago', status: 'sent', read: true },
  { id: 'n5', type: 'reminder', title: 'Exam reminder', body: 'Adelina Kelmendi — theory exam Jul 1', time: '2d ago', status: 'sent', read: true },
];

function seedLessons() {
  const L = []; let lid = 1;
  const place = (day, hour, si, ii, vi, status) => {
    L.push({ id: 'L' + (lid++), day, hour, studentId: students[si].id, instructorId: instructors[ii].id, vehicleId: vehicles[vi].id, status, type: hour % 3 === 0 ? 'city' : 'highway', pickup: ['Qendra', 'Dardania', 'Kalabria', 'Ulpiana'][si % 4] });
  };
  const seed = [
    [0,8,0,0,0,'completed'],[0,9,1,0,0,'completed'],[0,11,2,1,1,'completed'],[0,14,3,1,1,'scheduled'],[0,16,4,2,2,'scheduled'],
    [1,8,5,0,0,'completed'],[1,10,6,1,1,'no_show'],[1,12,7,2,2,'scheduled'],[1,15,8,3,3,'scheduled'],[1,17,9,0,0,'scheduled'],
    [2,9,10,1,1,'scheduled'],[2,11,11,2,2,'scheduled'],[2,13,0,3,3,'scheduled'],[2,15,1,0,0,'scheduled'],[2,16,2,1,1,'cancelled'],
    [3,8,3,2,2,'scheduled'],[3,10,4,0,0,'scheduled'],[3,12,5,1,1,'scheduled'],[3,14,6,3,3,'scheduled'],[3,17,7,2,2,'scheduled'],
    [4,9,8,0,0,'scheduled'],[4,11,9,1,1,'scheduled'],[4,13,10,2,2,'scheduled'],[4,15,11,3,3,'scheduled'],
    [5,9,0,1,1,'scheduled'],[5,10,1,2,2,'scheduled'],[5,11,2,0,0,'scheduled'],
  ];
  seed.forEach(s => place(...s));
  return L;
}

export const initialLessons = seedLessons();

export function getWeekDays() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  monday.setHours(0, 0, 0, 0);
  const days = [];
  for (let d = 0; d < 6; d++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + d);
    days.push(dt);
  }
  return { days, todayIdx: dow < 6 ? dow : 5 };
}

export const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
