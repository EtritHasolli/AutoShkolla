-- ============================================================================
-- DriveFlow — demo seed data (optional)
-- ============================================================================
-- Run AFTER schema.sql. Creates one demo school ("Autoshkolla Prishtina")
-- with instructors, vehicles, students, a week of lessons, payments, exams,
-- notifications and two theory courses — plus a handful of skeleton schools
-- so the super-admin portal has something to aggregate.
--
-- To use the demo school with your own login:
--   1. Sign up in the app (either flow), or create a user in Auth → Users.
--   2. Attach yourself to it:
--        update public.profiles
--        set school_id = 'a0000000-0000-4000-8000-000000000001', role = 'owner'
--        where email = 'you@example.com';
--
-- Invitation demo: students/instructors below have @demo.driveflow emails.
-- Anyone signing up with one of those emails is auto-linked to that row.
-- ============================================================================

-- Demo tenant --------------------------------------------------------------
insert into public.schools (id, name, biz_number, address, city, phone, cats, plan, status, mrr)
values ('a0000000-0000-4000-8000-000000000001', 'Autoshkolla Prishtina', '810334721',
        'Rr. Nëna Terezë 24', 'Prishtinë', '+383 38 224 100', '{B,C,CE}', 'Pro', 'active', 49);

-- Vehicles -------------------------------------------------------------------
insert into public.vehicles (id, school_id, name, plate, cat, year, reg, ins, km, status, service) values
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'VW Golf 7',   '01-123-AB', 'B', 2019, current_date + 70,  current_date + 5,   142300, 'available',   current_date + 30),
('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Opel Astra',  '02-456-CD', 'B', 2020, current_date + 140, current_date + 220, 98750,  'in_use',      current_date + 75),
('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Škoda Fabia', '03-789-EF', 'B', 2018, current_date + 1,   current_date + 150, 176400, 'available',   current_date + 2),
('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Toyota Yaris','04-012-GH', 'B', 2021, current_date + 290, current_date + 15,  61200,  'maintenance', current_date - 9);

-- Instructors ----------------------------------------------------------------
insert into public.instructors (id, school_id, name, email, phone, cat, color, rating, vehicle_id) values
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Arben Krasniqi', 'arben@demo.driveflow',   '+383 44 211 980', 'B',   '#2a6fdb', 4.8, 'b0000000-0000-4000-8000-000000000001'),
('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Vlora Berisha',  'vlora@demo.driveflow',   '+383 45 330 114', 'B',   '#6557d1', 4.9, 'b0000000-0000-4000-8000-000000000002'),
('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Driton Gashi',   'driton@demo.driveflow',  '+383 49 870 552', 'B,C', '#0e8f9b', 4.6, 'b0000000-0000-4000-8000-000000000003'),
('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Fatlume Hoxha',  'fatlume@demo.driveflow', '+383 44 615 203', 'B',   '#b9821a', 4.7, 'b0000000-0000-4000-8000-000000000004');

-- Students ---------------------------------------------------------------------
insert into public.students (id, school_id, instructor_id, name, email, phone, cat, total, price, progress, theory, practical, joined) values
('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Endrit Morina',    'endrit@demo.driveflow',   '+383 43 100 200', 'B', 20, 260, '{"parking":3,"reverse":4,"highway":2,"clutch":4,"roundabout":3,"lane":4}', 'passed',    'not_taken', current_date - 110),
('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'Rina Shala',       'rina@demo.driveflow',     '+383 44 107 203', 'B', 30, 360, '{"parking":2,"reverse":3,"highway":3,"clutch":2,"roundabout":4,"lane":3}', 'scheduled', 'not_taken', current_date - 90),
('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'Blerim Rexhepi',   'blerim@demo.driveflow',   '+383 45 114 206', 'B', 40, 460, '{"parking":4,"reverse":2,"highway":3,"clutch":3,"roundabout":2,"lane":3}', 'not_taken', 'not_taken', current_date - 130),
('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'Adelina Kelmendi', 'adelina@demo.driveflow',  '+383 46 121 209', 'B', 20, 260, '{"parking":3,"reverse":3,"highway":4,"clutch":2,"roundabout":3,"lane":2}', 'passed',    'passed',    current_date - 60),
('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Festim Bytyqi',    'festim@demo.driveflow',   '+383 47 128 212', 'B', 30, 360, '{"parking":2,"reverse":4,"highway":2,"clutch":4,"roundabout":2,"lane":4}', 'scheduled', 'not_taken', current_date - 160),
('d0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'Donika Zeqiri',    'donika@demo.driveflow',   '+383 48 135 215', 'B', 40, 460, '{"parking":4,"reverse":3,"highway":3,"clutch":3,"roundabout":4,"lane":2}', 'not_taken', 'not_taken', current_date - 78),
('d0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'Granit Haliti',    'granit@demo.driveflow',   '+383 43 142 218', 'B', 20, 260, '{"parking":3,"reverse":2,"highway":2,"clutch":2,"roundabout":3,"lane":3}', 'passed',    'not_taken', current_date - 130),
('d0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'Leotrim Ademi',    'leotrim@demo.driveflow',  '+383 44 149 221', 'B', 30, 360, '{"parking":2,"reverse":3,"highway":4,"clutch":3,"roundabout":2,"lane":4}', 'scheduled', 'not_taken', current_date - 52),
('d0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Albina Murati',    'albina@demo.driveflow',   '+383 45 156 224', 'B', 40, 460, '{"parking":4,"reverse":4,"highway":3,"clutch":4,"roundabout":3,"lane":3}', 'not_taken', 'not_taken', current_date - 148),
('d0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'Yll Dauti',        'yll@demo.driveflow',      '+383 46 163 227', 'B', 20, 260, '{"parking":3,"reverse":3,"highway":2,"clutch":3,"roundabout":4,"lane":2}', 'passed',    'passed',    current_date - 85),
('d0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'Erblin Bardhi',    'erblin@demo.driveflow',   '+383 47 170 230', 'B', 30, 360, '{"parking":2,"reverse":2,"highway":3,"clutch":2,"roundabout":3,"lane":3}', 'scheduled', 'not_taken', current_date - 104),
('d0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'Kaltrina Veliu',   'kaltrina@demo.driveflow', '+383 48 177 233', 'B', 40, 460, '{"parking":3,"reverse":4,"highway":2,"clutch":4,"roundabout":2,"lane":4}', 'not_taken', 'not_taken', current_date - 40);

-- Lessons: this week (monday = date_trunc('week')), same layout as the old demo
with monday as (select date_trunc('week', current_date)::date as d)
insert into public.lessons (school_id, student_id, instructor_id, vehicle_id, lesson_date, hour, status, type, pickup)
select 'a0000000-0000-4000-8000-000000000001',
       ('d0000000-0000-4000-8000-0000000000' || lpad(s::text, 2, '0'))::uuid,
       ('c0000000-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid,
       ('b0000000-0000-4000-8000-0000000000' || lpad(v::text, 2, '0'))::uuid,
       (select d from monday) + day, hour, status::public.lesson_status,
       case when hour % 3 = 0 then 'city' else 'highway' end,
       (array['Qendra','Dardania','Kalabria','Ulpiana'])[(s % 4) + 1]
from (values
  (0, 8, 1, 1, 1, 'completed'), (0, 9, 2, 1, 1, 'completed'), (0, 11, 3, 2, 2, 'completed'),
  (0, 14, 4, 2, 2, 'scheduled'), (0, 16, 5, 3, 3, 'scheduled'),
  (1, 8, 6, 1, 1, 'completed'), (1, 10, 7, 2, 2, 'no_show'),  (1, 12, 8, 3, 3, 'scheduled'),
  (1, 15, 9, 4, 4, 'scheduled'), (1, 17, 10, 1, 1, 'scheduled'),
  (2, 9, 11, 2, 2, 'scheduled'), (2, 11, 12, 3, 3, 'scheduled'), (2, 13, 1, 4, 4, 'scheduled'),
  (2, 15, 2, 1, 1, 'scheduled'), (2, 16, 3, 2, 2, 'cancelled'),
  (3, 8, 4, 3, 3, 'scheduled'), (3, 10, 5, 1, 1, 'scheduled'), (3, 12, 6, 2, 2, 'scheduled'),
  (3, 14, 7, 4, 4, 'scheduled'), (3, 17, 8, 3, 3, 'scheduled'),
  (4, 9, 9, 1, 1, 'scheduled'), (4, 11, 10, 2, 2, 'scheduled'), (4, 13, 11, 3, 3, 'scheduled'),
  (4, 15, 12, 4, 4, 'scheduled'),
  (5, 9, 1, 2, 2, 'scheduled'), (5, 10, 2, 3, 3, 'scheduled'), (5, 11, 3, 1, 1, 'scheduled')
) as t(day, hour, s, i, v, status);

-- A slab of past completed lessons so "used lessons" and reports look real
with monday as (select date_trunc('week', current_date)::date as d)
insert into public.lessons (school_id, student_id, instructor_id, vehicle_id, lesson_date, hour, status, type, pickup)
select 'a0000000-0000-4000-8000-000000000001',
       ('d0000000-0000-4000-8000-0000000000' || lpad(s::text, 2, '0'))::uuid,
       ('c0000000-0000-4000-8000-0000000000' || lpad((((s - 1) % 4) + 1)::text, 2, '0'))::uuid,
       ('b0000000-0000-4000-8000-0000000000' || lpad((((s - 1) % 4) + 1)::text, 2, '0'))::uuid,
       (select d from monday) - (7 + (n * 3 % 40)), 8 + (n % 9), 'completed', 'city', 'Qendra'
from generate_series(1, 12) as s, generate_series(1, 8) as n
where n <= 4 + (s * 7 % 12);   -- varied lesson counts per student

-- Payments ---------------------------------------------------------------------
insert into public.payments (school_id, student_id, date, amount, method, note) values
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', current_date - 3,  260, 'cash', 'Full package 20'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', current_date - 4,  180, 'bank', 'Partial'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006', current_date - 5,  460, 'cash', 'Full package 40'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005', current_date - 7,  180, 'cash', 'Partial'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000009', current_date - 9,  360, 'bank', 'Full package 30'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004', current_date - 11, 80,  'other', 'Deposit'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000010', current_date - 14, 260, 'cash', 'Full package 20'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000008', current_date - 16, 120, 'cash', 'Partial');

-- Exams --------------------------------------------------------------------
insert into public.exams (school_id, student_id, type, date, status) values
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'practical', current_date + 3,  'scheduled'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004', 'theory',    current_date + 2,  'scheduled'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000007', 'theory',    current_date + 4,  'scheduled'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000010', 'practical', current_date - 2,  'passed'),
('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'theory',    current_date - 10, 'failed');

-- Notifications ---------------------------------------------------------------
insert into public.notifications (school_id, type, title, body, status, read) values
('a0000000-0000-4000-8000-000000000001', 'reminder', 'Lesson reminder',    'Endrit Morina — tomorrow 09:00',        'sent',    false),
('a0000000-0000-4000-8000-000000000001', 'payment',  'Payment reminder',   'Blerim Rexhepi — €180 remaining',       'pending', false),
('a0000000-0000-4000-8000-000000000001', 'cancel',   'Lesson cancelled',   'Festim Bytyqi cancelled Wed 16:00',     'sent',    true),
('a0000000-0000-4000-8000-000000000001', 'alert',    'Insurance expiring', 'VW Golf 7 — insurance expires soon',    'sent',    true),
('a0000000-0000-4000-8000-000000000001', 'reminder', 'Exam reminder',      'Adelina Kelmendi — theory exam soon',   'sent',    true);

-- Theory courses ---------------------------------------------------------------
insert into public.courses (school_id, title, descr, questions) values
('a0000000-0000-4000-8000-000000000001', 'Road Signs & Signals',
 'Recognise the most common Kosovo road signs and traffic signals.',
 '[{"id":"q1","text":"Which of the following are mandatory (blue, round) signs?","image":null,"explanation":"Mandatory signs are blue and round — they tell you what you must do.","options":[{"id":"o1","text":"Turn right ahead","correct":true},{"id":"o2","text":"No entry","correct":false},{"id":"o3","text":"Minimum speed","correct":true},{"id":"o4","text":"Yield","correct":false}]},{"id":"q2","text":"A red triangular sign means…","image":null,"explanation":"Red triangular signs are warning signs.","options":[{"id":"o1","text":"Warning / danger ahead","correct":true},{"id":"o2","text":"Prohibition","correct":false},{"id":"o3","text":"Information","correct":false}]},{"id":"q3","text":"When a traffic light shows amber (yellow), you should…","image":null,"explanation":"Amber means stop unless you are too close to do so safely.","options":[{"id":"o1","text":"Stop if it is safe to do so","correct":true},{"id":"o2","text":"Speed up to cross","correct":false},{"id":"o3","text":"Continue only if already crossing","correct":true}]}]'),
('a0000000-0000-4000-8000-000000000001', 'Right of Way Rules',
 'Priority at intersections, roundabouts and pedestrian crossings.',
 '[{"id":"q1","text":"At an unmarked intersection, who has priority?","image":null,"explanation":"In right-hand traffic, give way to vehicles coming from your right.","options":[{"id":"o1","text":"The vehicle coming from the right","correct":true},{"id":"o2","text":"The faster vehicle","correct":false},{"id":"o3","text":"The larger vehicle","correct":false}]}]');

-- Skeleton schools so the super-admin portal has a fleet to show -----------
insert into public.schools (name, biz_number, city, cats, plan, status, mrr, created_at) values
('Auto Akademia Peja',   '811920043', 'Pejë',      '{B}',    'Starter', 'active',    19, now() - interval '5 months'),
('Autoshkolla Prizren',  '810556198', 'Prizren',   '{A,B}',  'Pro',     'active',    49, now() - interval '4 months'),
('Drive Ferizaj',        '812044870', 'Ferizaj',   '{B}',    'Starter', 'trial',     0,  now() - interval '3 weeks'),
('Autoshkolla Gjakova',  '810778452', 'Gjakovë',   '{B,BE}', 'Pro',     'active',    49, now() - interval '2 months'),
('Auto Mitrovica',       '811330094', 'Mitrovicë', '{B}',    'Starter', 'suspended', 0,  now() - interval '4 months');
