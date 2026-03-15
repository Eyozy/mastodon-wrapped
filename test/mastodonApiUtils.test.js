import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCachedUserData,
  clearUserDataCache,
  getDefaultYear,
  getAvailableYearsFromAccount,
} from '../src/services/mastodonApi';

describe('userDataCache', () => {
  beforeEach(() => {
    clearUserDataCache();
  });

  it('returns null for uncached handle', () => {
    expect(getCachedUserData('user@m.social', 2024, 'local')).toBeNull();
  });

  it('returns null after clearing cache', () => {
    // getCachedUserData only reads; we can't set from outside,
    // but clearing an empty cache should not throw
    clearUserDataCache();
    expect(getCachedUserData('user@m.social', 2024, 'local')).toBeNull();
  });
});

describe('getDefaultYear', () => {
  it('returns the current year', () => {
    expect(getDefaultYear()).toBe(new Date().getFullYear());
  });
});

describe('getAvailableYearsFromAccount', () => {
  const currentYear = new Date().getFullYear();

  it('returns current year when account is null', () => {
    const { years, defaultYear } = getAvailableYearsFromAccount(null);
    expect(years).toEqual([currentYear]);
    expect(defaultYear).toBe(currentYear);
  });

  it('returns years from creation to current year', () => {
    const account = { created_at: '2022-06-15T00:00:00.000Z' };
    const { years } = getAvailableYearsFromAccount(account);
    expect(years[0]).toBe(currentYear);
    expect(years[years.length - 1]).toBe(2022);
    expect(years).toHaveLength(currentYear - 2022 + 1);
  });

  it('returns descending order', () => {
    const account = { created_at: '2020-01-01T00:00:00.000Z' };
    const { years } = getAvailableYearsFromAccount(account);
    for (let i = 1; i < years.length; i++) {
      expect(years[i - 1]).toBeGreaterThan(years[i]);
    }
  });

  it('handles invalid created_at gracefully', () => {
    const account = { created_at: 'not-a-date' };
    const { years } = getAvailableYearsFromAccount(account);
    expect(years).toEqual([currentYear]);
  });

  it('handles missing created_at', () => {
    const account = {};
    const { years } = getAvailableYearsFromAccount(account);
    expect(years).toEqual([currentYear]);
  });
});
