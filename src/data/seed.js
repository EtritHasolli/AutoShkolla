// Demo data (used when no Supabase project is configured, or in "Try the demo").
// Everything is generated relative to today so the demo always looks current.
import { todayISO, addDays, weekStart } from '../lib/format.js';
import { DEFAULT_PACKAGES } from '../lib/brand.js';

export const SKILLS = ['parking', 'reverse', 'highway', 'clutch', 'roundabout', 'lane'];

export function buildDemo() {
  const today = todayISO();
  const mon = weekStart(today);
  const d = (n) => addDays(today, n);

  const school = {
    id: 'demo-school', name: 'Autoshkolla Dardania', bizNumber: '811234567',
    address: 'Rr. Nëna Terezë 24', city: 'Prishtinë', phone: '+383 44 123 456',
    logo: null, cats: ['B', 'C'], plan: 'Standard', status: 'active',
    mapsUrl: 'https://maps.google.com/?q=Prishtina', hoursStart: '08:00', hoursEnd: '18:00',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    listed: true, acceptEnrollments: true, packages: DEFAULT_PACKAGES,
  };

  const instructors = [
    { id: 'i1', name: 'Arben Krasniqi', cat: 'B', phone: '+383 44 211 980', color: '#2456e6', rating: 4.8, vehicle: 'v1', email: '' },
    { id: 'i2', name: 'Vlora Berisha', cat: 'B', phone: '+383 45 330 114', color: '#7048e8', rating: 4.9, vehicle: 'v2', email: '' },
    { id: 'i3', name: 'Driton Gashi', cat: 'B, C', phone: '+383 49 870 552', color: '#0e8aa6', rating: 4.6, vehicle: 'v3', email: '' },
    { id: 'i4', name: 'Fatlume Hoxha', cat: 'B', phone: '+383 44 615 203', color: '#c27408', rating: 4.7, vehicle: 'v4', email: '' },
  ];

  const vehicles = [
    { id: 'v1', name: 'VW Golf 7', plate: '01-123-AB', cat: 'B', year: 2019, reg: d(210), ins: d(12), km: 142300, status: 'available', service: d(45) },
    { id: 'v2', name: 'Opel Astra', plate: '01-456-CD', cat: 'B', year: 2020, reg: d(26), ins: d(290), km: 98750, status: 'in_use', service: d(80) },
    { id: 'v3', name: 'Škoda Fabia', plate: '01-789-EF', cat: 'B', year: 2018, reg: d(150), ins: d(64), km: 176400, status: 'available', service: d(-3) },
    { id: 'v4', name: 'Toyota Yaris', plate: '01-012-GH', cat: 'B', year: 2021, reg: d(330), ins: d(190), km: 61200, status: 'maintenance', service: d(2) },
  ];

  const first = ['Endrit', 'Rina', 'Blerim', 'Adelina', 'Festim', 'Donika', 'Granit', 'Leotrim', 'Albina', 'Yll', 'Erblin', 'Kaltrina'];
  const last = ['Morina', 'Shala', 'Rexhepi', 'Kelmendi', 'Bytyqi', 'Zeqiri', 'Haliti', 'Ademi', 'Murati', 'Dauti', 'Bardhi', 'Veliu'];
  const notes = [
    'Ecën mirë në qytet. Duhet më shumë praktikë te parkimi mbrapsht para provimit.',
    'Preferon mësimet në mëngjes.',
    '', 'Pak nervoz në rrethrrotullime — ka përmirësim.', '', 'Gati për provimin praktik.', '', '', 'Vjen nga Fushë Kosova — merret te stacioni.', '', '', '',
  ];
  const students = first.map((fn, i) => {
    const pk = DEFAULT_PACKAGES[i % 3];
    const progress = {};
    SKILLS.forEach((s, si) => { progress[s] = Math.max(1, Math.min(5, 2 + ((i + si) % 4))); });
    return {
      id: 's' + (i + 1), name: fn + ' ' + last[i],
      phone: '+383 4' + (4 + (i % 5)) + ' ' + (210 + i * 17) + ' ' + (300 + i * 23),
      email: '', cat: 'B', instructorId: instructors[i % 4].id,
      total: pk.lessons, price: pk.price, packageName: pk.name,
      progress, joined: d(-20 - i * 9),
      theory: 'not_taken', practical: 'not_taken',
      notes: notes[i], usedBase: [6, 14, 3, 18, 9, 22, 2, 11, 16, 7, 12, 1][i],
    };
  });

  // Lessons over last week, this week and next week.
  const lessons = [];
  let lid = 1;
  const pickups = ['Qendra', 'Dardania', 'Kalabria', 'Ulpiana', 'Sunny Hill'];
  const pattern = [
    [0, 8, 0, 0], [0, 9, 1, 0], [0, 11, 2, 1], [0, 14, 3, 1], [0, 16, 4, 2],
    [1, 8, 5, 0], [1, 10, 6, 1], [1, 12, 7, 2], [1, 15, 8, 3], [1, 17, 9, 0],
    [2, 9, 10, 1], [2, 11, 11, 2], [2, 13, 0, 3], [2, 15, 1, 0], [2, 16, 2, 1],
    [3, 8, 3, 2], [3, 10, 4, 0], [3, 12, 5, 1], [3, 14, 6, 3], [3, 17, 7, 2],
    [4, 9, 8, 0], [4, 10, 1, 2], [4, 11, 9, 1], [4, 13, 10, 2], [4, 15, 11, 3], [4, 16, 5, 0],
    [5, 9, 0, 1], [5, 10, 1, 2], [5, 11, 2, 0],
  ];
  const nowHour = new Date().getHours();
  for (const wk of [-7, 0, 7]) {
    pattern.forEach(([day, hour, si, ii], k) => {
      if (wk !== 0 && k % 3 === 2) return; // lighter weeks around the current one
      const date = addDays(mon, wk + day);
      const past = date < today || (date === today && hour < nowHour);
      let status = 'scheduled';
      if (past) status = k % 11 === 6 ? 'no_show' : k % 13 === 9 ? 'cancelled' : 'completed';
      else if (k === 14) status = 'cancelled';
      const ins = instructors[ii];
      lessons.push({
        id: 'L' + (lid++), date, hour, studentId: students[si].id, instructorId: ins.id,
        vehicleId: ins.vehicle, status, type: hour % 3 === 0 ? 'highway' : 'city',
        pickup: pickups[si % pickups.length],
      });
    });
  }

  const payments = [
    { id: 'p1', studentId: 's1', date: d(-2), amount: 130, method: 'cash', note: 'Kësti i dytë' },
    { id: 'p2', studentId: 's2', date: d(-4), amount: 180, method: 'bank', note: 'Gjysma e paketës' },
    { id: 'p3', studentId: 's6', date: d(-6), amount: 460, method: 'cash', note: 'Paketa e plotë' },
    { id: 'p4', studentId: 's5', date: d(-9), amount: 120, method: 'cash', note: '' },
    { id: 'p5', studentId: 's9', date: d(-12), amount: 360, method: 'bank', note: 'Paketa e plotë' },
    { id: 'p6', studentId: 's4', date: d(-15), amount: 80, method: 'other', note: 'Paradhënie' },
    { id: 'p7', studentId: 's10', date: d(-24), amount: 260, method: 'cash', note: 'Paketa e plotë' },
    { id: 'p8', studentId: 's1', date: d(-38), amount: 130, method: 'cash', note: 'Kësti i parë' },
    { id: 'p9', studentId: 's8', date: d(-44), amount: 200, method: 'cash', note: '' },
    { id: 'p10', studentId: 's11', date: d(-52), amount: 150, method: 'bank', note: '' },
    { id: 'p11', studentId: 's3', date: d(-70), amount: 100, method: 'cash', note: 'Paradhënie' },
    { id: 'p12', studentId: 's7', date: d(-85), amount: 260, method: 'cash', note: '' },
    { id: 'p13', studentId: 's12', date: d(-105), amount: 180, method: 'bank', note: '' },
  ];

  const exams = [
    { id: 'e1', studentId: 's6', type: 'practical', date: d(3), status: 'scheduled' },
    { id: 'e2', studentId: 's4', type: 'theory', date: d(5), status: 'scheduled' },
    { id: 'e3', studentId: 's9', type: 'practical', date: d(9), status: 'scheduled' },
    { id: 'e4', studentId: 's6', type: 'theory', date: d(-21), status: 'passed' },
    { id: 'e5', studentId: 's10', type: 'theory', date: d(-14), status: 'passed' },
    { id: 'e6', studentId: 's2', type: 'theory', date: d(-10), status: 'failed' },
    { id: 'e7', studentId: 's9', type: 'theory', date: d(-30), status: 'passed' },
  ];

  const now = Date.now();
  const ago = (mins) => new Date(now - mins * 60000).toISOString();
  const notifs = [
    { id: 'n1', type: 'reminder', title: 'Regjistrim i ri', body: 'Kaltrina Veliu u regjistrua online', createdAt: ago(95), status: 'sent', read: false },
    { id: 'n2', type: 'payment', title: 'Pagesë e regjistruar', body: 'Endrit Morina — 130 €', createdAt: ago(60 * 26), status: 'sent', read: false },
    { id: 'n3', type: 'cancel', title: 'Mësim i anuluar', body: 'Festim Bytyqi anuloi mësimin e së mërkurës 16:00', createdAt: ago(60 * 30), status: 'sent', read: true },
    { id: 'n4', type: 'alert', title: 'Sigurimi skadon së shpejti', body: 'VW Golf 7 — sigurimi skadon për 12 ditë', createdAt: ago(60 * 50), status: 'sent', read: true },
  ];

  return { school, instructors, vehicles, students, lessons, payments, exams, notifs, courses: DEMO_COURSES };
}

export const DEMO_COURSES = [
  {
    id: 'c1', title: 'Shenjat e komunikacionit', desc: 'Njihni shenjat më të zakonshme të rrugës në Kosovë.',
    questions: [
      { id: 'q1', text: 'Cilat nga këto janë shenja urdhëruese (blu, të rrumbullakëta)?', image: null, explanation: 'Shenjat urdhëruese janë blu dhe të rrumbullakëta — tregojnë çka duhet të bëni.', options: [
        { id: 'o1', text: 'Kthehu djathtas', correct: true }, { id: 'o2', text: 'Ndalohet hyrja', correct: false },
        { id: 'o3', text: 'Shpejtësia minimale', correct: true }, { id: 'o4', text: 'Jep përparësi', correct: false }] },
      { id: 'q2', text: 'Shenja trekëndore me buzë të kuqe do të thotë…', image: null, explanation: 'Shenjat trekëndore me buzë të kuqe janë shenja paralajmëruese.', options: [
        { id: 'o1', text: 'Rrezik përpara', correct: true }, { id: 'o2', text: 'Ndalim', correct: false }, { id: 'o3', text: 'Informacion', correct: false }] },
      { id: 'q3', text: 'Kur semafori ndez dritën e verdhë, duhet të…', image: null, explanation: 'E verdha do të thotë ndalo, përveç nëse jeni aq afër sa nuk mund të ndaloni në mënyrë të sigurt.', options: [
        { id: 'o1', text: 'Ndalosh nëse është e sigurt', correct: true }, { id: 'o2', text: 'Përshpejtosh për të kaluar', correct: false },
        { id: 'o3', text: 'Vazhdosh vetëm nëse je duke kaluar tashmë', correct: true }] },
      { id: 'q4', text: 'Shenja tetëkëndore e kuqe “STOP” kërkon…', image: null, explanation: 'Te shenja STOP duhet të ndaloni plotësisht, edhe nëse rruga duket e lirë.', options: [
        { id: 'o1', text: 'Ndalim të plotë', correct: true }, { id: 'o2', text: 'Ngadalësim', correct: false }, { id: 'o3', text: 'Ndalim vetëm natën', correct: false }] },
    ],
  },
  {
    id: 'c2', title: 'Përparësia në kryqëzim', desc: 'Kush kalon i pari në kryqëzime, rrethrrotullime dhe vendkalime.',
    questions: [
      { id: 'q1', text: 'Në një kryqëzim pa shenja, kush ka përparësi?', image: null, explanation: 'Në kryqëzim të barabartë përparësi ka automjeti që vjen nga e djathta.', options: [
        { id: 'o1', text: 'Automjeti që vjen nga e djathta', correct: true }, { id: 'o2', text: 'Automjeti më i shpejtë', correct: false }, { id: 'o3', text: 'Automjeti më i madh', correct: false }] },
      { id: 'q2', text: 'Në rrethrrotullim me shenjë “Jep përparësi”, përparësi kanë…', image: null, explanation: 'Automjetet që janë tashmë në rrethrrotullim kanë përparësi.', options: [
        { id: 'o1', text: 'Automjetet brenda rrethrrotullimit', correct: true }, { id: 'o2', text: 'Automjetet që hyjnë', correct: false }] },
      { id: 'q3', text: 'Te vendkalimi i këmbësorëve pa semafor duhet të…', image: null, explanation: 'Këmbësorët në vendkalim kanë gjithmonë përparësi.', options: [
        { id: 'o1', text: 'Lini këmbësorët të kalojnë', correct: true }, { id: 'o2', text: 'Bini borisë', correct: false }, { id: 'o3', text: 'Kaloni shpejt para tyre', correct: false }] },
    ],
  },
];

// Public directory used in demo mode (mirrors the live `public_schools` view).
export function buildDemoDirectory(school) {
  const base = [
    { id: 'pub-2', name: 'Auto Akademia Peja', city: 'Pejë', address: 'Rr. Mbretëresha Teutë 8', phone: '+383 44 330 220', cats: ['B'], students: 18, instructors: 2, vehicles: 2 },
    { id: 'pub-3', name: 'Autoshkolla Prizreni', city: 'Prizren', address: 'Rr. Remzi Ademaj 15', phone: '+383 45 552 100', cats: ['A', 'B'], students: 27, instructors: 3, vehicles: 4 },
    { id: 'pub-4', name: 'Drive Ferizaj', city: 'Ferizaj', address: 'Rr. Dëshmorët e Kombit 3', phone: '+383 49 410 900', cats: ['B'], students: 9, instructors: 1, vehicles: 1, acceptEnrollments: false },
    { id: 'pub-5', name: 'Autoshkolla Gjakova', city: 'Gjakovë', address: 'Rr. Nëna Terezë 41', phone: '+383 44 778 452', cats: ['B', 'BE'], students: 23, instructors: 3, vehicles: 3 },
    { id: 'pub-6', name: 'Auto Mitrovica', city: 'Mitrovicë', address: 'Rr. Mbretëresha Teutë 2', phone: '+383 44 133 009', cats: ['B', 'C'], students: 14, instructors: 2, vehicles: 2 },
    { id: 'pub-7', name: 'Autoshkolla Gjilani', city: 'Gjilan', address: 'Rr. Adem Jashari 77', phone: '+383 45 902 118', cats: ['B'], students: 16, instructors: 2, vehicles: 2 },
  ].map(s => ({
    logo: null, mapsUrl: '', hoursStart: '08:00', hoursEnd: '18:00', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    acceptEnrollments: true, packages: DEFAULT_PACKAGES, ...s,
  }));
  return [{ ...school, students: 12, instructors: 4, vehicles: 4 }, ...base];
}

// Super-admin demo data (aggregates only — no personal data).
export function buildDemoPlatform() {
  const d = (n) => addDays(todayISO(), n);
  const schools = [
    { id: 1, name: 'Autoshkolla Dardania', city: 'Prishtinë', bizNumber: '811234567', plan: 'Standard', status: 'active', joined: d(-300), students: 34, activeStudents: 28, instructors: 4, vehicles: 5, lessonsThisMonth: 412, examsThisMonth: 22, examPassRate: 78, mrr: 50, revenueYtd: 14600, cats: ['B', 'C', 'CE'], lastActive: d(0) },
    { id: 2, name: 'Auto Akademia Peja', city: 'Pejë', bizNumber: '811920043', plan: 'Fillestar', status: 'active', joined: d(-260), students: 18, activeStudents: 12, instructors: 2, vehicles: 2, lessonsThisMonth: 168, examsThisMonth: 9, examPassRate: 67, mrr: 25, revenueYtd: 5400, cats: ['B'], lastActive: d(-1) },
    { id: 3, name: 'Autoshkolla Prizreni', city: 'Prizren', bizNumber: '810556198', plan: 'Standard', status: 'active', joined: d(-210), students: 27, activeStudents: 21, instructors: 3, vehicles: 4, lessonsThisMonth: 301, examsThisMonth: 15, examPassRate: 73, mrr: 50, revenueYtd: 9800, cats: ['A', 'B'], lastActive: d(0) },
    { id: 4, name: 'Drive Ferizaj', city: 'Ferizaj', bizNumber: '812044870', plan: 'Fillestar', status: 'trial', joined: d(-20), students: 9, activeStudents: 9, instructors: 1, vehicles: 1, lessonsThisMonth: 74, examsThisMonth: 3, examPassRate: 66, mrr: 0, revenueYtd: 0, cats: ['B'], lastActive: d(0) },
    { id: 5, name: 'Autoshkolla Gjakova', city: 'Gjakovë', bizNumber: '810778452', plan: 'Premium', status: 'active', joined: d(-150), students: 63, activeStudents: 47, instructors: 8, vehicles: 7, lessonsThisMonth: 648, examsThisMonth: 31, examPassRate: 70, mrr: 90, revenueYtd: 26100, cats: ['B', 'BE', 'C'], lastActive: d(-2) },
    { id: 6, name: 'Auto Mitrovica', city: 'Mitrovicë', bizNumber: '811330094', plan: 'Fillestar', status: 'suspended', joined: d(-240), students: 14, activeStudents: 0, instructors: 2, vehicles: 2, lessonsThisMonth: 0, examsThisMonth: 0, examPassRate: 61, mrr: 0, revenueYtd: 2200, cats: ['B'], lastActive: d(-60) },
  ];
  return { schools, trend: platformTrend(schools) };
}

export function platformTrend(schools) {
  const now = new Date();
  const out = [];
  for (let k = 5; k >= 0; k--) {
    const end = new Date(now.getFullYear(), now.getMonth() - k + 1, 1);
    const inRange = schools.filter(s => new Date(s.joined) < end);
    out.push({ m: new Date(now.getFullYear(), now.getMonth() - k, 1).getMonth(), schools: inRange.length, mrr: inRange.reduce((a, s) => a + s.mrr, 0) });
  }
  return out;
}
