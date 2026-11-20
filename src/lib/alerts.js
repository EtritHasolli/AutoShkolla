import { daysUntil } from './format.js';

// Vehicle deadlines that need attention: insurance / registration expiring
// within 30 days, service due within 14 days, or the car is in the garage.
export function vehicleAlerts(vehicles) {
  const out = [];
  for (const v of vehicles) {
    for (const [kind, date, window] of [['ins', v.ins, 30], ['reg', v.reg, 30], ['service', v.service, 14]]) {
      if (!date) continue;
      const d = daysUntil(date);
      if (d <= window) out.push({ key: v.id + kind, vehicle: v, kind, days: d, tone: d < 0 ? 'red' : d <= 7 ? 'red' : 'amber' });
    }
    if (v.status === 'maintenance') out.push({ key: v.id + 'm', vehicle: v, kind: 'maint', days: 999, tone: 'amber' });
  }
  return out.sort((a, b) => a.days - b.days);
}

export function alertText(a, T) {
  const label = a.kind === 'ins' ? T('alert_ins') : a.kind === 'reg' ? T('alert_reg') : a.kind === 'service' ? T('alert_service') : '';
  if (a.kind === 'maint') return { title: a.vehicle.name, sub: T('alert_in_service') };
  if (a.kind === 'service') return { title: a.vehicle.name + ' · ' + label, sub: a.days < 0 ? T('alert_overdue') : T('alert_due_in', { n: a.days }) };
  return { title: a.vehicle.name + ' · ' + label, sub: a.days < 0 ? T('alert_expired') : T('alert_in_days', { n: a.days }) };
}
