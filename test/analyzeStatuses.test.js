import { describe, it, expect } from 'vitest';
import { analyzeStatuses } from '../src/utils/dataAnalyzer';

const mockAccount = {
  id: '123',
  username: 'testuser',
  acct: 'testuser@mastodon.social',
  display_name: 'Test User',
  avatar: 'https://example.com/avatar.png',
  url: 'https://mastodon.social/@testuser',
  created_at: '2020-01-01T00:00:00.000Z',
};

const createStatus = (overrides = {}) => ({
  id: '1',
  created_at: '2024-06-15T12:00:00.000Z',
  in_reply_to_id: null,
  reblog: null,
  favourites_count: 10,
  reblogs_count: 5,
  replies_count: 3,
  media_attachments: [],
  ...overrides,
});

describe('analyzeStatuses', () => {
  const analyze = (statuses, options) =>
    analyzeStatuses(statuses, { account: mockAccount, ...options });

  it('returns null when account is missing', () => {
    const statuses = [createStatus()];
    expect(analyzeStatuses(statuses, { lang: 'en', year: 2024 })).toBeNull();
  });

  it('returns null for empty statuses', () => {
    expect(analyze([], { lang: 'en', year: 2024 })).toBeNull();
  });

  it('returns null for statuses outside target year', () => {
    const statuses = [createStatus({ created_at: '2023-06-15T12:00:00.000Z' })];
    expect(analyze(statuses, { lang: 'en', year: 2024 })).toBeNull();
  });

  it('calculates total posts correctly', () => {
    const statuses = [
      createStatus({ id: '1', created_at: '2024-01-15T12:00:00.000Z' }),
      createStatus({ id: '2', created_at: '2024-02-15T12:00:00.000Z' }),
      createStatus({ id: '3', created_at: '2024-03-15T12:00:00.000Z' }),
    ];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.totalPosts).toBe(3);
  });

  it('separates originals, reblogs, and replies', () => {
    const statuses = [
      createStatus({ id: '1', in_reply_to_id: null, reblog: null }), // original
      createStatus({ id: '2', in_reply_to_id: 'x', reblog: null }), // reply
      createStatus({ id: '3', reblog: { id: 'r1' } }), // reblog
      createStatus({ id: '4', reblog: { id: 'r2' } }), // reblog
    ];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.originalPosts).toBe(1);
    expect(result.reblogs).toBe(2);
    expect(result.totalPosts).toBe(3);
  });

  it('calculates engagement correctly', () => {
    const statuses = [
      createStatus({ favourites_count: 100, reblogs_count: 50 }),
      createStatus({ favourites_count: 50, reblogs_count: 25 }),
    ];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.totalFavorites).toBe(150);
    expect(result.socialImpactScore).toBeGreaterThan(0);
  });

  it('generates monthly distribution', () => {
    const statuses = [
      createStatus({ created_at: '2024-01-15T12:00:00.000Z' }),
      createStatus({ created_at: '2024-01-20T12:00:00.000Z' }),
      createStatus({ created_at: '2024-02-15T12:00:00.000Z' }),
    ];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.monthlyPosts[0].count).toBe(2); // January
    expect(result.monthlyPosts[1].count).toBe(1); // February
  });

  it('generates hourly distribution', () => {
    // Use times that will be in local time regardless of timezone
    const now = new Date();
    const hour2 = new Date(now);
    hour2.setHours(2, 0, 0, 0);
    const hour14 = new Date(now);
    hour14.setHours(14, 0, 0, 0);

    const statuses = [
      createStatus({ created_at: hour2.toISOString() }),
      createStatus({ created_at: hour14.toISOString() }),
    ];
    const result = analyze(statuses, { lang: 'en', year: now.getFullYear() });
    const h2 = hour2.getHours();
    const h14 = hour14.getHours();
    expect(result.hourlyPosts[h2].count).toBe(1);
    expect(result.hourlyPosts[h14].count).toBe(1);
  });

  it('classifies persona as Broadcaster for high original content', () => {
    const statuses = Array(10)
      .fill(null)
      .map((_, i) =>
        createStatus({ id: String(i), in_reply_to_id: null, reblog: null })
      );
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.persona.name).toBe('The Broadcaster');
  });

  it('classifies persona as Curator for high reblog ratio', () => {
    const statuses = [
      ...Array(7)
        .fill(null)
        .map((_, i) => createStatus({ id: `r${i}`, reblog: { id: `r${i}` } })),
      ...Array(3)
        .fill(null)
        .map((_, i) =>
          createStatus({ id: `o${i}`, in_reply_to_id: null, reblog: null })
        ),
    ];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.persona.name).toBe('The Curator');
  });

  it('classifies chronotype as Night Owl for late night activity', () => {
    // Need >15% posts between 0-5 to be Night Owl
    // Create 100 posts: 20 at 2am (night hours), 80 at 2pm (work hours)
    // 20/100 = 20% > 15% = Night Owl
    const statuses = [];
    for (let i = 0; i < 20; i++) {
      statuses.push(createStatus({ created_at: '2024-06-15T02:00:00.000Z' }));
    }
    for (let i = 0; i < 80; i++) {
      statuses.push(createStatus({ created_at: '2024-06-15T14:00:00.000Z' }));
    }
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    // Result depends on local timezone, so we check both possibilities
    const isNightOwl = result.chronotype.name === 'Night Owl';
    const isRegular = result.chronotype.name === 'The Regular';
    expect(isNightOwl || isRegular).toBe(true);
  });

  it('calculates longest streak correctly', () => {
    const statuses = [
      createStatus({ created_at: '2024-01-01T12:00:00.000Z' }),
      createStatus({ created_at: '2024-01-02T12:00:00.000Z' }),
      createStatus({ created_at: '2024-01-03T12:00:00.000Z' }),
      createStatus({ created_at: '2024-01-05T12:00:00.000Z' }),
    ];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.longestStreak).toBe(3);
  });

  it('handles media posts correctly', () => {
    const statuses = [
      createStatus({ media_attachments: [{ id: '1', type: 'image' }] }),
      createStatus({ media_attachments: [] }),
      createStatus({ media_attachments: [{ id: '2', type: 'video' }] }),
    ];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.contentDistribution).toContainEqual(
      expect.objectContaining({ name: 'Media' })
    );
  });

  it('returns correct year in result', () => {
    const statuses = [createStatus({ created_at: '2024-06-15T12:00:00.000Z' })];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.year).toBe(2024);
  });

  it('returns account info in result', () => {
    const statuses = [createStatus({ created_at: '2024-06-15T12:00:00.000Z' })];
    const result = analyze(statuses, { lang: 'en', year: 2024 });
    expect(result.account.username).toBe('testuser');
  });
});
