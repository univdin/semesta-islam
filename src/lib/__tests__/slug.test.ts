/**
 * SEMESTA ISLAM — Canonical Slug Module (EXP-11) Contract Tests
 * Verifies deterministic slugify, honorific handling, reserved words,
 * validation, and collision suffixing.
 */

import { describe, it, expect } from 'vitest';
import {
  slugify,
  uniqueSlug,
  RESERVED_SLUGS,
  isReservedSlug,
  isValidSlug,
} from '@/lib/slugs';

describe('slugify — normalization', () => {
  it('lowercases and hyphenates a plain name', () => {
    expect(slugify('Ahmad Al-Hafiz')).toBe('ahmad-al-hafiz');
  });

  it('handles Indonesian names', () => {
    expect(slugify('Abdullah Hasibuan')).toBe('abdullah-hasibuan');
    expect(slugify('Fatimah Azzahra')).toBe('fatimah-azzahra');
  });

  it('handles Arabic-derived names', () => {
    expect(slugify('Muhammad Syarif')).toBe('muhammad-syarif');
    expect(slugify("Abdurrahman Al-'Utsaimin")).toBe('abdurrahman-al-utsaimin');
  });

  it('normalizes NFD diacritics', () => {
    expect(slugify('Sofyan Tsauri')).toBe('sofyan-tsauri');
    expect(slugify('Ahmad Zhafir')).toBe('ahmad-zhafir');
  });

  it('normalizes apostrophes, punctuation and whitespace', () => {
    expect(slugify("Ahmad's Team")).toBe('ahmads-team');
    expect(slugify('  Ahmad   Al-Hafiz  ')).toBe('ahmad-al-hafiz');
    expect(slugify('Ahmad, Al-Hafiz (Senior)')).toBe('ahmad-al-hafiz-senior');
  });

  it('collapses repeated hyphens and trims edges', () => {
    expect(slugify('Ahmad -- Al-Hafiz --')).toBe('ahmad-al-hafiz');
  });

  it('is deterministic', () => {
    const input = "Ustadz Dr. Ahmad Al-Hafiz, M.A.";
    expect(slugify(input)).toBe(slugify(input));
    expect(slugify(input)).toBe('ahmad-al-hafiz');
  });
});

describe('slugify — honorific / title handling (real data)', () => {
  it('strips leading honorifics and degree suffixes', () => {
    expect(slugify('Ustadz DR. Ahmad Al-Hafiz, M.A.')).toBe('ahmad-al-hafiz');
    expect(slugify('Ustadzah Fatimah Azzahra, S.Ag.')).toBe('fatimah-azzahra');
    expect(slugify('Ustadz Muhammad Syarif, Lc.')).toBe('muhammad-syarif');
    expect(slugify('Ustadz Abdullah Hasibuan, M.Pd.')).toBe('abdullah-hasibuan');
  });

  it('strips standalone title tokens at any position', () => {
    expect(slugify('KH. Ma\'ruf Amin')).toBe('maruf-amin');
    expect(slugify('Prof. Dr. H. Habib Umar')).toBe('umar');
    expect(slugify('Dr. Hj. Nurul Fauziah, S.H.')).toBe('nurul-fauziah');
  });

  it('preserves a name that is only honorifics (never empties)', () => {
    expect(slugify('KH.')).toBe('kh');
    expect(slugify('Ustadz Dr.')).toBe('ustadz-dr');
  });

  it('preserves identity-bearing embedded tokens', () => {
    expect(slugify('Ahmad Al-Hafiz')).toBe('ahmad-al-hafiz');
    expect(slugify('Syekh Muhammad Al-Husary')).toBe('muhammad-al-husary');
  });
});

describe('reserved words', () => {
  it('exposes the reserved set derived from the route tree', () => {
    expect(RESERVED_SLUGS.has('verification')).toBe(true);
    expect(RESERVED_SLUGS.has('workspace')).toBe(true);
    expect(RESERVED_SLUGS.has('directory')).toBe(true);
    expect(RESERVED_SLUGS.has('new')).toBe(true);
    expect(RESERVED_SLUGS.has('edit')).toBe(true);
    expect(RESERVED_SLUGS.has('dashboard')).toBe(true);
  });

  it('flags reserved slugs', () => {
    expect(isReservedSlug('verification')).toBe(true);
    expect(isReservedSlug('workspace')).toBe(true);
    expect(isReservedSlug('ahmad-al-hafiz')).toBe(false);
  });
});

describe('validation', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('ahmad-al-hafiz')).toBe(true);
    expect(isValidSlug('muhammad-syarif')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('Ahmad')).toBe(false);
    expect(isValidSlug('ahmad--al-hafiz')).toBe(false);
    expect(isValidSlug('-ahmad')).toBe(false);
    expect(isValidSlug('ahmad_')).toBe(false);
    expect(isValidSlug('ahmad al-hafiz')).toBe(false);
  });
});

describe('uniqueSlug — deterministic collision handling', () => {
  it('returns the desired slug when free', () => {
    expect(uniqueSlug('abdul-somad', new Set(['foo']))).toBe('abdul-somad');
  });

  it('suffixes deterministically on collision', () => {
    const taken = new Set(['abdul-somad']);
    expect(uniqueSlug('abdul-somad', taken)).toBe('abdul-somad-2');
  });

  it('increments suffixes for repeated collisions', () => {
    const taken = new Set(['abdul-somad', 'abdul-somad-2', 'abdul-somad-3']);
    expect(uniqueSlug('abdul-somad', taken)).toBe('abdul-somad-4');
  });

  it('never mutates the taken set', () => {
    const taken = new Set(['a']);
    uniqueSlug('a', taken);
    expect(taken).toEqual(new Set(['a']));
  });

  it('is stable across repeated calls', () => {
    const taken = new Set(['a', 'a-2']);
    const first = uniqueSlug('a', taken);
    const second = uniqueSlug('a', taken);
    expect(first).toBe(second);
  });
});
