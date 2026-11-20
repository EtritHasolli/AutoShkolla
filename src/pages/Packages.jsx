import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Button, Empty, Icon, Badge, PageHeader } from '../components/ui.jsx';
import { euro } from '../lib/format.js';

export function PackageCard({ p, T, children }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', position: 'relative', borderColor: p.popular ? 'var(--brand)' : undefined, boxShadow: p.popular ? '0 0 0 1px var(--brand), var(--shadow)' : undefined }}>
      {p.popular && <div style={{ position: 'absolute', top: -11, left: 18 }}><Badge tone="accent" style={{ background: 'var(--accent)', color: '#1f1300' }}>{T('popular')}</Badge></div>}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
        <Badge tone="brand">{p.cat}</Badge>
      </div>
      <div className="row" style={{ alignItems: 'baseline', gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.04em' }} className="tnum">{euro(p.price)}</span>
      </div>
      <div className="muted" style={{ fontWeight: 600, marginBottom: 14 }}>{T('n_lessons', { n: p.lessons })}</div>
      <div className="stack" style={{ gap: 8, flex: 1 }}>
        {(p.features || []).map((f, k) => (
          <div key={k} className="row" style={{ gap: 8, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--ink-2)' }}>
            <Icon name="check" size={16} sw={2.4} style={{ color: 'var(--green)', marginTop: 2 }} />{f}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

export default function Packages() {
  const { data, T, openModal, school, savePackages } = useApp();
  const list = data.packages;
  const unpublished = school && !school.packages?.length;
  return (
    <div className="page">
      <PageHeader title={T('packages')} sub={T('packages_sub')} actions={<Button variant="primary" icon="plus" onClick={() => openModal({ type: 'package' })}>{T('add_package')}</Button>} />
      {unpublished && (
        <div className="card row" style={{ gap: 12, padding: 16, marginBottom: 18, background: 'var(--accent-50)', borderColor: '#f7dca5', flexWrap: 'wrap' }}>
          <Icon name="info" size={20} style={{ color: 'var(--accent-600)' }} />
          <div style={{ flex: '1 1 260px', fontSize: 13.5, color: 'var(--ink-2)' }}>{T('packages_unpublished')}</div>
          <Button variant="primary" icon="globe" onClick={() => savePackages(list)}>{T('publish_packages')}</Button>
        </div>
      )}
      {!list.length ? <Card><Empty icon="packages" title={T('no_packages')} /></Card> : (
        <div className="grid-auto" style={{ paddingTop: 10 }}>
          {list.map(p => (
            <PackageCard key={p.id} p={p} T={T}>
              <div className="row" style={{ gap: 8, marginTop: 18 }}>
                <Button variant={p.popular ? 'primary' : 'soft'} style={{ flex: 1 }} icon="students" onClick={() => openModal({ type: 'student', packageId: p.id })}>{T('assign_to_student')}</Button>
                <Button icon="edit" title={T('edit')} onClick={() => openModal({ type: 'package', editId: p.id })} />
              </div>
            </PackageCard>
          ))}
        </div>
      )}
    </div>
  );
}
