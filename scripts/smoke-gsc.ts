import { requireSearchConsoleClient } from '../src/lib/search-console/service';

async function run() {
  try {
    const json = require('fs').readFileSync('./docs/integrations/univdin-0804df6ca325.json', 'utf8');
    const parsed = JSON.parse(json);
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = parsed.client_email;
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = parsed.private_key;

    const siteUrl = 'sc-domain:ilmify.id'; // Or https://ilmify.id/ depending on what property type it is
    console.log('Testing listProperties...');
    const client = requireSearchConsoleClient({ siteUrl });
    const props = await client.listProperties();
    console.log('Properties:', props);
    
    // Attempt to use sc-domain:ilmify.id or the exact URL returned
    const exactSiteUrl = props.find((p: any) => p.siteUrl.includes('ilmify.id'))?.siteUrl || 'https://ilmify.id/';
    console.log('Using siteUrl:', exactSiteUrl);
    
    const clientWithExact = requireSearchConsoleClient({ siteUrl: exactSiteUrl });
    console.log('Testing queryAnalytics...');
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const analytics = await clientWithExact.queryAnalytics({
      startDate: threeDaysAgo.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      dimensions: ['query'],
      rowLimit: 5
    });
    console.log('Analytics (first 5 queries):', analytics);

  } catch (err) {
    console.error('Error during GSC smoke test:', err);
  }
}

run();
