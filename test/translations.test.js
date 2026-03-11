import { describe, it, expect } from 'vitest';
import { getTranslation } from '../src/utils/translations';

describe('getTranslation', () => {
  it('returns English translation by default', () => {
    expect(getTranslation('en', 'title')).toBe('{year} Mastodon Wrapped');
    expect(getTranslation('en', 'cta')).toBe('Get Wrapped');
    expect(getTranslation('en', 'placeholder')).toBe(
      'Enter your Mastodon handle'
    );
  });

  it('returns Chinese translation', () => {
    expect(getTranslation('zh', 'title')).toBe('{year} Mastodon Wrapped');
    expect(getTranslation('zh', 'cta')).toBe('获取年度报告');
    expect(getTranslation('zh', 'placeholder')).toBe(
      '请输入你的 Mastodon 账号'
    );
  });

  it('falls back to English for missing translations', () => {
    expect(getTranslation('zh', 'nonexistent_key')).toBe('nonexistent_key');
  });

  it('replaces placeholders correctly', () => {
    expect(getTranslation('en', 'title', { year: 2024 })).toBe(
      '2024 Mastodon Wrapped'
    );
    expect(getTranslation('zh', 'title', { year: 2024 })).toBe(
      '2024 Mastodon Wrapped'
    );
    expect(getTranslation('en', 'placeholder', {})).toBe(
      'Enter your Mastodon handle'
    );
  });
});
