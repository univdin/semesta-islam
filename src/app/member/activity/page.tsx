import { redirect } from 'next/navigation';

// Member activity redirects to the canonical learner activity route.
export const dynamic = 'force-dynamic';

export default function MemberActivityRedirect() {
  redirect('/learner/activity');
}
