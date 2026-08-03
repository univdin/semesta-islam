import { listEducatorSummaries } from '@/lib/educators/service';
import { DirectoryClient } from './DirectoryClient';

export const dynamic = 'force-dynamic';

export default async function DirectoryPage() {
  const educators = await listEducatorSummaries();
  return <DirectoryClient educators={educators} />;
}
