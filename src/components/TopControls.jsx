import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from './ui.jsx';

function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, background: '#10141b', border: '1px solid #232c38', borderRadius: 9, padding: 3 }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          display: 'flex', alignItems: 'center', gap: 6, border: 'none',
          background: value === o.v ? '#0f9d6b' : 'transparent',
          color: value === o.v ? '#fff' : '#aeb7c6',
          fontSize: 12.5, fontWeight: 600, padding: '6px 11px', borderRadius: 7, transition: 'all .15s',
        }}>
          {o.icon && <Icon name={o.icon} size={14} sw={2} />}
          {o.l}
        </button>
      ))}
    </div>
  );
}

export default function TopControls() {
  const { lang, setLang, device, setDevice, role, setRole, mRole, setMRole, setMRoute } = useApp();

  return (
    <div style={{
      width: '100%', background: '#0b0e14', borderBottom: '1px solid #1c232e',
      padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: '#0f9d6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Icon name="car2" size={16} sw={2} />
        </div>
        <span style={{ color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-.01em' }}>DriveFlow</span>
        <span style={{ color: '#5d6675', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginLeft: 4 }}>Prototype</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {device === 'desktop' ? (
          <Seg
            options={[{ v: 'owner', l: 'Owner' }, { v: 'administrator', l: 'Administrator' }, { v: 'receptionist', l: 'Receptionist' }]}
            value={role} onChange={v => setRole(v)}
          />
        ) : (
          <Seg
            options={[{ v: 'instructor', l: 'Instructor' }, { v: 'student', l: 'Student' }]}
            value={mRole} onChange={v => { setMRole(v); setMRoute(v === 'student' ? 'home' : 'today'); }}
          />
        )}
        <Seg
          options={[{ v: 'desktop', l: 'Desktop', icon: 'monitor' }, { v: 'mobile', l: 'Mobile', icon: 'mobile' }]}
          value={device} onChange={v => setDevice(v)}
        />
        <Seg
          options={[{ v: 'en', l: 'EN' }, { v: 'sq', l: 'SQ' }]}
          value={lang} onChange={v => setLang(v)}
        />
      </div>
    </div>
  );
}
