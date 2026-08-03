import React from 'react';
import { getServerIdentity, isDemoMode } from '@/lib/auth/session';
import { Header, type HeaderIdentity } from './Header';

export async function HeaderServer() {
  const identity = await getServerIdentity();
  const demoMode = isDemoMode();

  const identityProp: HeaderIdentity | null = identity
    ? { userId: identity.userId, email: identity.email, roles: identity.roles }
    : null;

  return <Header identity={identityProp} demoMode={demoMode} />;
}
