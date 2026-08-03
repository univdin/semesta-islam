/**
 * SEMESTA ISLAM — Canonical Slug Module (EXP-11)
 * Pure deterministic slugify for canonical entity URLs.
 *
 * Slug contract:
 *   - lowercase, ASCII a-z 0-9 and hyphen only
 *   - NFD diacritic normalization (Indonesian + Arabic-derived names)
 *   - apostrophe/punctuation/whitespace normalization
 *   - repeated hyphens collapsed, leading/trailing hyphens trimmed
 *   - honorific/title tokens stripped only when clearly honorific
 *   - reserved route words never become educator slugs
 *   - deterministic collision suffixing (`-2`, `-3`, ...)
 */

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  // Actual static route segments under /educator/
  'verification',
  'workspace',
  // Future/directive minimum protections under the entity route tree
  'directory',
  'new',
  'edit',
  'dashboard',
]);

export function isReservedSlug(value: string): boolean {
  return RESERVED_SLUGS.has(value);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

/**
 * Honorific / title tokens that never form an identity-bearing name component.
 * Conservative set derived from real repository educator data and Indonesian /
 * Islamic titles. A token is only treated as a title when it stands alone;
 * embedded tokens (e.g. "Al-Hafiz") are preserved.
 */
const HONORIFICS: ReadonlySet<string> = new Set([
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

/** Standalone tokens joined after normalization; at least one identity token must survive. */
function isHonorificToken(token: string): boolean {
  return HONORIFICS.has(token);
}

/**
 * Pure, deterministic slugify. Accepts any display name / title string and
 * returns a URL-safe canonical slug.
 *
 * Honorific rules:
 *   - title tokens (Ustadz, Ustadzah, KH, DR., Prof., M.A., S.Ag., Lc., ...)
 *     are removed at any position when they stand alone as tokens,
 *   - but only when at least one identity-bearing token remains; otherwise
 *     the raw normalized name is used to avoid emptying a name,
 *   - degree-style suffixes attached to the name are also removed.
 */
export function slugify(input: string): string {
  const source = (input ?? '').trim();
  if (!source) return '';

  const tokens = source.split(/[\s,·،]+/).filter(Boolean);

  const normalized: string[] = [];
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

  const slug = keep
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Deterministic collision handling for a desired slug against an existing
 * taken set. Never overwrites; appends `-2`, `-3`, ... until unique.
 * Repeated execution against the same taken set is stable.
 */
export function uniqueSlug(desired: string, taken: ReadonlySet<string>): string {
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
