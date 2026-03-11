import { describe, it, expect } from 'vitest';
import { formatNumber, emojifyDisplayName } from '../src/utils/dataAnalyzer';

describe('formatNumber', () => {
  it('formats numbers below 1000', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10.0K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(10000000)).toBe('10.0M');
  });
});

describe('emojifyDisplayName', () => {
  it('returns empty string for empty input', () => {
    expect(emojifyDisplayName('', [])).toBe('');
    expect(emojifyDisplayName(null, [])).toBe('');
  });

  it('escapes HTML in display name', () => {
    const result = emojifyDisplayName('<script>alert(1)</script>', []);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('replaces emoji shortcodes with img tags', () => {
    const emojis = [
      { shortcode: 'smile', static_url: 'https://example.com/smile.png' },
    ];
    const result = emojifyDisplayName('Hello :smile: world', emojis);
    expect(result).toContain('<img');
    expect(result).toContain('smile.png');
  });

  it('ignores invalid emoji shortcodes', () => {
    const emojis = [
      { shortcode: '<invalid>', static_url: 'https://example.com/test.png' },
    ];
    const result = emojifyDisplayName('Hello :<invalid>: world', emojis);
    expect(result).not.toContain('<img');
    expect(result).toContain(':&lt;invalid&gt;:');
  });
});
