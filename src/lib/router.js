// Tiny hash router: the URL mirrors where the user is, so website links are
// shareable (#/school/<id>), the browser back button works, and the Android
// back button walks back through screens instead of closing the app.
//
//   #/                 landing (public website)
//   #/login  #/signup  #/privacy
//   #/school/<id>      public school page
//   #/app/<route>      inside the app
//   #/app/students/<id>

export function parseHash(hash = window.location.hash) {
  const h = hash.replace(/^#\/?/, '');
  // Supabase auth redirects put tokens in the hash — leave those to supabase-js.
  if (/access_token=|error_description=|type=recovery/.test(h)) return { screen: 'landing' };
  const [a, b, c] = h.split('?')[0].split('/').filter(Boolean);
  if (!a) return { screen: 'landing' };
  if (a === 'login' || a === 'signup' || a === 'privacy') return { screen: a };
  if (a === 'school' && b) return { screen: 'school', schoolId: decodeURIComponent(b) };
  if (a === 'app') return { screen: 'app', route: b || 'dashboard', studentId: b === 'students' && c ? decodeURIComponent(c) : null };
  return { screen: 'landing' };
}

export function buildHash(v) {
  switch (v.screen) {
    case 'login': case 'signup': case 'privacy': return '#/' + v.screen;
    case 'school': return '#/school/' + encodeURIComponent(v.schoolId);
    case 'app':
      if (v.route === 'students' && v.studentId) return '#/app/students/' + encodeURIComponent(v.studentId);
      return '#/app/' + (v.route || 'dashboard');
    default: return '#/';
  }
}

export function sameView(a, b) { return buildHash(a) === buildHash(b); }
