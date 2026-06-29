import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, btnGhostStyle, euro } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';

const pkgs = [
  { n: '20', price: 260, pop: false, feat: ['20 driving lessons', 'Theory materials', '1 practical exam attempt'] },
  { n: '30', price: 360, pop: true, feat: ['30 driving lessons', 'Theory materials', '2 exam attempts', 'Priority scheduling'] },
  { n: '40', price: 460, pop: false, feat: ['40 driving lessons', 'Theory + extra practice', 'Unlimited exam attempts', 'Highway training', 'Priority scheduling'] },
];

export default function Packages() {
  const { openModal, showToast, T } = useApp();
  return (
    <div style={{ padding: '22px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, color: C.mut }}>Standard lesson packages and custom plans</div>
        </div>
        <button onClick={() => showToast('Custom package (demo)')} style={btnGhostStyle()}>
          <Icon name="plus" size={16} sw={2.2} /> Custom package
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {pkgs.map(p => (
          <div key={p.n} style={{ background: p.pop ? C.side : C.surf, border: '1px solid ' + (p.pop ? C.sideLine : C.line), borderRadius: 16, padding: '24px 22px', position: 'relative', color: p.pop ? '#fff' : C.ink }}>
            {p.pop && <div style={{ position: 'absolute', top: 16, right: 16, background: C.pri, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 7 }}>Popular</div>}
            <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 600, color: p.pop ? '#9fb4d6' : C.mut }}>Package</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 4px' }}>
              <span style={{ fontFamily: font.disp, fontSize: 40, fontWeight: 700, letterSpacing: '-.03em' }}>{p.n}</span>
              <span style={{ fontSize: 15, color: p.pop ? '#9fb4d6' : C.mut, fontWeight: 600 }}>lessons</span>
            </div>
            <div style={{ fontFamily: font.disp, fontSize: 24, fontWeight: 700, color: p.pop ? '#62a0ff' : C.pri, marginBottom: 18 }}>{euro(p.price)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {p.feat.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: p.pop ? '#d6dfec' : C.ink2 }}>
                  <span style={{ color: p.pop ? '#62a0ff' : C.grn, display: 'flex' }}><Icon name="check" size={16} sw={2.4} /></span>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={() => openModal({ type: 'student', pkg: p.n })} style={{ width: '100%', marginTop: 20, border: 'none', background: p.pop ? C.pri : C.priBg, color: p.pop ? '#fff' : C.pri, fontSize: 13.5, fontWeight: 600, padding: '11px', borderRadius: 10 }}>
              Assign to student
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
