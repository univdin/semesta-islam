import { getServerIdentity, isDemoMode } from '@/lib/auth/session';
import { getEducatorIdForUser } from '@/lib/educators/service';
import { EducatorVerificationClient } from './EducatorVerificationClient';

export const dynamic = 'force-dynamic';

const DEMO_EDUCATOR_ID = '30000000-0000-0000-0000-000000000101';

export default async function EducatorVerificationPage() {
  const identity = await getServerIdentity();
  const demoMode = isDemoMode();

  let educatorId: string | null = null;
  let demoFallback = false;

  if (identity) {
    educatorId = await getEducatorIdForUser(identity.userId);
  } else if (demoMode) {
    educatorId = DEMO_EDUCATOR_ID;
    demoFallback = true;
  }

  return (
    <EducatorVerificationClient
      educatorId={educatorId}
      demoFallback={demoFallback}
      identityEmail={identity?.email ?? null}
    />
  );
}
