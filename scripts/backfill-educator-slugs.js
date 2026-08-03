/**
 * SEMESTA ISLAM — Educator Slug Backfill (EXP-11)
 *
 * Idempotent, repeatable, collision-safe. Fills `slug` on EducatorProfile
 * rows where slug is currently NULL. Never overwrites an existing slug.
 *
 * Slugs are derived deterministically from the educator's display name
 * (user profile fullName, falling back to the account email prefix).
 *
 *   npm run db:backfill-slugs
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const RESERVED_SLUGS = new Set([
  'verification',
  'workspace',
  'directory',
  'new',
  'edit',
  'dashboard',
]);

const HONORIFICS = new Set([
  'ustadz',
  'ustadzah',
  'ustadzh',
  'kyai',
  'kiai',
  'kh',
  'gus',
  'habib',
  'syekh',
  'syeikh',
  'sheikh',
  'h',
  'hj',
  'dr',
  'prof',
  'drs',
  'lc',
  'ma',
  'mpd',
  'mthi',
  'sag',
  'sh',
]);

function isHonorificToken(token) {
  return HONORIFICS.has(token);
}

/**
 * Deterministic slugify — mirrors src/lib/slugs/index.ts.
 * Kept as a standalone JS port so the script can run with plain Node.
 */
function slugify(input) {
  const source = (input ?? '').trim();
  if (!source) return '';

  const tokens = source.split(/[\s,·،]+/).filter(Boolean);

  const normalized = [];
  for (const raw of tokens) {
    const cleaned = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’'`".,·()\[\]{}_&]/g, '')
      .toLowerCase()
      .trim();
    if (cleaned) normalized.push(cleaned);
  }

  const identityTokens = normalized.filter((token) => !isHonorificToken(token));
  const keep = identityTokens.length > 0 ? identityTokens : normalized;

  return keep
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Deterministic collision handling. Existing slugs are immutable; a
 * colliding desired slug gets an incrementing numeric suffix.
 */
function uniqueSlug(desired, taken) {
  const base = desired || 'item';
  if (!taken.has(base)) return base;

  let suffix = 2;
  let candidate = `${base}-${suffix}`;
  while (taken.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

async function main() {
  const educators = await prisma.educatorProfile.findMany({
    select: {
      id: true,
      slug: true,
      user: { select: { email: true, profile: { select: { fullName: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const taken = new Set();
  for (const e of educators) {
    if (e.slug) taken.add(e.slug);
  }

  const updates = [];
  for (const educator of educators) {
    if (educator.slug) continue; // existing slugs are immutable during backfill

    const fullName = educator.user.profile?.fullName;
    const baseName =
      fullName || (educator.user.email || '').split('@')[0].replace(/[._-]+/g, ' ');

    let desired = slugify(baseName);
    if (!desired) desired = 'pendidik';

    // Reserved route words can never be canonical entity slugs.
    if (RESERVED_SLUGS.has(desired)) {
      desired = uniqueSlug(`${desired}-pendidik`, taken);
    }

    const finalSlug = uniqueSlug(desired, taken);
    taken.add(finalSlug);
    updates.push({ id: educator.id, slug: finalSlug });
  }

  if (updates.length === 0) {
    console.log(`No educators without a slug. Skipped (${taken.size} existing).`);
    return;
  }

  for (const u of updates) {
    await prisma.educatorProfile.update({
      where: { id: u.id },
      data: { slug: u.slug },
    });
  }

  console.log(`Backfilled ${updates.length} educator slug(s):`);
  for (const u of updates) {
    console.log(`  ${u.id} -> ${u.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
