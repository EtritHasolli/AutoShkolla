import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from './ui.jsx';
import { C } from '../data/seed.js';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', background: C.ink, color: '#fff', padding: '11px 20px', borderRadius: 11, fontSize: 13.5, fontWeight: 600, zIndex: 300, boxShadow: '0 16px 40px -12px rgba(0,0,0,.5)', animation: 'df-rise .2s', display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ color: C.grn, display: 'flex' }}><Icon name="check" size={17} sw={2.4} /></span>
      {toast}
    </div>
  );
}
