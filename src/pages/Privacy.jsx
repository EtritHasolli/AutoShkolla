import React from 'react';
import { useApp } from '../AppContext.jsx';
import { SiteNav, SiteFooter } from './Landing.jsx';
import { BRAND, CONTACT } from '../lib/brand.js';

// Plain-language privacy notice based on the "Legal & Compliance" note
// (Law No. 06/L-082 on Protection of Personal Data). Have a Kosovo lawyer
// review it before the first paid customer.
const TEXT = {
  sq: {
    title: 'Politika e privatësisë',
    updated: 'Përditësuar më 20 nëntor 2026',
    sections: [
      ['Kush jemi', `${BRAND} është softuer që autoshkollat në Kosovë e përdorin për të menaxhuar kandidatët, mësimet, pagesat dhe provimet. Për të dhënat e kandidatëve, autoshkolla është kontrolluesi i të dhënave dhe ${BRAND} është përpunuesi që i ruan ato në emër të saj.`],
      ['Çfarë të dhënash mbledhim', 'Emrin, email-in, numrin e telefonit dhe kategorinë e patentës kur regjistroheni; mësimet, pagesat, rezultatet e provimeve dhe vlerësimet e instruktorit që autoshkolla regjistron gjatë trajnimit; të dhëna teknike minimale për hyrjen e sigurt në llogari.'],
      ['Pse i përdorim', 'Vetëm për t’ju regjistruar në autoshkollë, për të organizuar mësimet dhe provimet, për të mbajtur evidencën e pagesave dhe për t’ju dërguar kujtesa. Nuk i shesim të dhënat dhe nuk i përdorim për reklama.'],
      ['Ku ruhen', 'Të dhënat ruhen në serverë brenda Bashkimit Evropian, të enkriptuara gjatë transmetimit dhe në ruajtje. Qasje kanë vetëm stafi i autoshkollës suaj, sipas rolit të tyre.'],
      ['Sa kohë i mbajmë', 'Për aq kohë sa autoshkolla ka nevojë për to për trajnimin dhe për detyrimet ligjore. Autoshkolla mund t’i eksportojë ose fshijë të dhënat në çdo kohë.'],
      ['Të drejtat tuaja', 'Sipas Ligjit Nr. 06/L-082 për Mbrojtjen e të Dhënave Personale keni të drejtë të kërkoni qasje, korrigjim ose fshirje të të dhënave tuaja, si dhe të kundërshtoni përpunimin. Kontaktoni autoshkollën tuaj ose ne. Keni të drejtë të ankoheni edhe në Agjencinë për Informim dhe Privatësi (AIP).'],
      ['Kontakti', CONTACT.email ? `Për pyetje rreth privatësisë: ${CONTACT.email}` : 'Për pyetje rreth privatësisë kontaktoni autoshkollën ku jeni regjistruar.'],
    ],
  },
  en: {
    title: 'Privacy policy',
    updated: 'Updated 20 November 2026',
    sections: [
      ['Who we are', `${BRAND} is software that driving schools in Kosovo use to manage students, lessons, payments and exams. For student data, the school is the data controller and ${BRAND} is the processor that stores it on the school’s behalf.`],
      ['What we collect', 'Your name, email, phone number and licence category when you enroll; the lessons, payments, exam results and instructor assessments your school records during training; minimal technical data to keep your sign-in secure.'],
      ['Why we use it', 'Only to enroll you in the school, organise your lessons and exams, keep a record of payments and send you reminders. We never sell your data or use it for advertising.'],
      ['Where it is stored', 'Data is stored on servers inside the European Union, encrypted in transit and at rest. Only your school’s staff can access it, according to their role.'],
      ['How long we keep it', 'For as long as the school needs it for your training and its legal obligations. The school can export or delete the data at any time.'],
      ['Your rights', 'Under Law No. 06/L-082 on the Protection of Personal Data you can request access to, correction of, or deletion of your data, and object to its processing. Contact your school or us. You may also complain to the Information and Privacy Agency (AIP).'],
      ['Contact', CONTACT.email ? `For privacy questions: ${CONTACT.email}` : 'For privacy questions, contact the school you enrolled with.'],
    ],
  },
};

export default function Privacy() {
  const { lang } = useApp();
  const t = TEXT[lang] || TEXT.sq;
  return (
    <div className="site">
      <SiteNav />
      <div className="site-wrap" style={{ maxWidth: 760, padding: '48px 24px 72px' }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.035em' }}>{t.title}</h1>
        <p className="muted" style={{ marginTop: 6 }}>{t.updated}</p>
        <div className="prose" style={{ marginTop: 18 }}>
          {t.sections.map(([h, p]) => (<React.Fragment key={h}><h2>{h}</h2><p>{p}</p></React.Fragment>))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
