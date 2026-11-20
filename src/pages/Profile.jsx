import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Button, Field, PasswordInput, SettingRow, Avatar, Badge, LinkButton, LogoMark, PageHeader } from '../components/ui.jsx';
import { LangToggle } from '../components/Shell.jsx';
import { telLink } from '../lib/format.js';
import { BRAND } from '../lib/brand.js';

export default function Profile() {
  const { user, me, role, school, T, changePassword, logout, isDemo, go } = useApp();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const name = me?.name || user?.name || '';
  const roleLabel = T(role === 'instructor' ? 'role_instructor' : role === 'student' ? 'role_student' : role);

  return (
    <div className="page page-narrow">
      <PageHeader title={T('profile')} />
      <Card style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 14 }}>
          <Avatar name={name || '?'} size={56} color={me?.color} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="truncate" style={{ fontWeight: 750, fontSize: 18 }}>{name}</div>
            <div className="muted truncate">{user?.email}</div>
            <div style={{ marginTop: 6 }}><Badge tone="brand">{roleLabel}</Badge></div>
          </div>
        </div>
      </Card>

      {school && (
        <Card style={{ marginBottom: 16 }}>
          <div className="row" style={{ gap: 12 }}>
            <LogoMark size={44} logo={school.logo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="truncate" style={{ fontWeight: 700 }}>{school.name}</div>
              <div className="muted truncate" style={{ fontSize: 13 }}>{[school.address, school.city].filter(Boolean).join(', ')}</div>
            </div>
            {school.phone && <LinkButton href={telLink(school.phone)} icon="phone" title={T('call')} />}
          </div>
          {(role === 'owner' || role === 'administrator') && <Button block variant="soft" icon="settings" style={{ marginTop: 12 }} onClick={() => go('settings')}>{T('settings')}</Button>}
        </Card>
      )}

      <Card title={T('preferences')} style={{ marginBottom: 16 }}>
        <SettingRow title={T('language')}><LangToggle size="md" /></SettingRow>
      </Card>

      {!isDemo && (
        <Card title={T('change_password')} style={{ marginBottom: 16 }}>
          <Field label={T('new_password')} hint={T('min6')}>
            <PasswordInput value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
          </Field>
          <Button variant="primary" loading={busy} disabled={pw.length < 6} onClick={async () => { setBusy(true); if (await changePassword(pw)) setPw(''); setBusy(false); }}>{T('save')}</Button>
        </Card>
      )}

      <Button variant="danger-soft" block size="lg" icon="logout" onClick={logout}>{T('logout')}</Button>
      <div className="soft" style={{ textAlign: 'center', fontSize: 12, marginTop: 16 }}>{BRAND} · v{__APP_VERSION__}</div>
    </div>
  );
}
