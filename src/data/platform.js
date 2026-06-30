// Mock platform-wide data for the DriveFlow super-admin portal.
// Aggregate / business data only — no personal data about school members.

export const platformSchools = [
  {
    id: 1, name: 'Autoshkolla Prishtina', city: 'Prishtinë', bizNumber: '810334721',
    plan: 'Pro', status: 'active', joined: '2026-01-14',
    students: 34, activeStudents: 28, instructors: 4, vehicles: 5,
    lessonsThisMonth: 412, examsThisMonth: 22, examPassRate: 78,
    mrr: 49, revenueYtd: 14600, cats: ['B', 'C', 'CE'], lastActive: '2026-06-30',
  },
  {
    id: 2, name: 'Auto Akademia Peja', city: 'Pejë', bizNumber: '811920043',
    plan: 'Starter', status: 'active', joined: '2026-02-03',
    students: 18, activeStudents: 12, instructors: 2, vehicles: 2,
    lessonsThisMonth: 168, examsThisMonth: 9, examPassRate: 67,
    mrr: 19, revenueYtd: 5400, cats: ['B'], lastActive: '2026-06-29',
  },
  {
    id: 3, name: 'Autoshkolla Prizren', city: 'Prizren', bizNumber: '810556198',
    plan: 'Pro', status: 'active', joined: '2026-03-09',
    students: 27, activeStudents: 21, instructors: 3, vehicles: 4,
    lessonsThisMonth: 301, examsThisMonth: 15, examPassRate: 73,
    mrr: 49, revenueYtd: 9800, cats: ['A', 'B'], lastActive: '2026-06-30',
  },
  {
    id: 4, name: 'Drive Ferizaj', city: 'Ferizaj', bizNumber: '812044870',
    plan: 'Starter', status: 'trial', joined: '2026-06-18',
    students: 9, activeStudents: 9, instructors: 1, vehicles: 1,
    lessonsThisMonth: 74, examsThisMonth: 3, examPassRate: 66,
    mrr: 0, revenueYtd: 0, cats: ['B'], lastActive: '2026-06-30',
  },
  {
    id: 5, name: 'Autoshkolla Gjakova', city: 'Gjakovë', bizNumber: '810778452',
    plan: 'Pro', status: 'active', joined: '2026-04-22',
    students: 23, activeStudents: 17, instructors: 3, vehicles: 3,
    lessonsThisMonth: 248, examsThisMonth: 11, examPassRate: 70,
    mrr: 49, revenueYtd: 6100, cats: ['B', 'BE'], lastActive: '2026-06-28',
  },
  {
    id: 6, name: 'Auto Mitrovica', city: 'Mitrovicë', bizNumber: '811330094',
    plan: 'Starter', status: 'suspended', joined: '2026-02-27',
    students: 14, activeStudents: 0, instructors: 2, vehicles: 2,
    lessonsThisMonth: 0, examsThisMonth: 0, examPassRate: 61,
    mrr: 0, revenueYtd: 2200, cats: ['B'], lastActive: '2026-05-12',
  },
];

// 6-month signup / revenue trend (oldest → newest)
export const platformTrend = [
  { month: 'Jan', schools: 1, mrr: 49 },
  { month: 'Feb', schools: 3, mrr: 87 },
  { month: 'Mar', schools: 4, mrr: 136 },
  { month: 'Apr', schools: 5, mrr: 185 },
  { month: 'May', schools: 5, mrr: 185 },
  { month: 'Jun', schools: 6, mrr: 185 },
];
