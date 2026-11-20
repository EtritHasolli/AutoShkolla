// Product-wide constants. Change the name here once the trademark search is
// done (see the Obsidian "Marketing & Brand" note) — every screen reads it.
export const BRAND = 'AutoShkolla';

// Pricing tiers from "Pricing & Packages". The note's rule is: don't quote
// prices before 10+ discovery interviews — so the public site shows the tiers
// (by school size) but hides the amounts until this flag is flipped.
export const SHOW_PRICES = false;

export const PLANS = [
  { id: 'Fillestar', instructors: '1–2', monthly: 25, setup: 0 },
  { id: 'Standard', instructors: '3–6', monthly: 50, setup: 50, popular: true },
  { id: 'Premium', instructors: '7+', monthly: 90, setup: 100 },
];

// Where the website's "Download for Android" button points. Upload the built
// APK (android/app/build/outputs/apk/…) to this path on the host, or replace it
// with a GitHub Releases link.
export const APK_URL = '/downloads/AutoShkolla.apk';

// Contact shown on the website. Empty values are hidden.
export const CONTACT = {
  email: '',
  phone: '',
  whatsapp: '',
};

// Default lesson packages a new school starts with (editable in Packages).
// Features are free text the school writes (shown as-is on the public page).
export const DEFAULT_PACKAGES = [
  { id: 'pk-b20', name: 'Bazë', cat: 'B', lessons: 20, price: 260, features: ['20 orë vozitjeje', 'Materiale teorike', '1 tentim i provimit praktik'] },
  { id: 'pk-b30', name: 'Standard', cat: 'B', lessons: 30, price: 360, popular: true, features: ['30 orë vozitjeje', 'Materiale teorike dhe teste online', '2 tentime të provimit', 'Prioritet në orar'] },
  { id: 'pk-b40', name: 'Komplet', cat: 'B', lessons: 40, price: 460, features: ['40 orë vozitjeje', 'Vozitje në autostradë', 'Tentime pa limit', 'Prioritet në orar'] },
];

export const LICENCE_CATS = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'CE', 'D1', 'D'];
