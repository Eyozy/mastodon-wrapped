/**
 * Data Analyzer for Mastodon Wrapped
 * Analyzes user's statuses to generate statistics
 * All time processing uses LOCAL TIME to match user's perceived experience
 */

const TIMEZONE_LOCAL = 'local';
const TIMEZONE_UTC = 'utc';

const MONTH_NAMES = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  zh: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'],
};

/**
 * Get local date string (YYYY-MM-DD) from a Date object
 * Uses local timezone to match user's perceived posting time
 */
function getDateString(date, timezoneMode = TIMEZONE_LOCAL) {
  const year =
    timezoneMode === TIMEZONE_UTC ? date.getUTCFullYear() : date.getFullYear();
  const monthIndex =
    timezoneMode === TIMEZONE_UTC ? date.getUTCMonth() : date.getMonth();
  const dayOfMonth =
    timezoneMode === TIMEZONE_UTC ? date.getUTCDate() : date.getDate();
  const month = String(monthIndex + 1).padStart(2, '0');
  const day = String(dayOfMonth).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYearNumber(date, timezoneMode = TIMEZONE_LOCAL) {
  return timezoneMode === TIMEZONE_UTC
    ? date.getUTCFullYear()
    : date.getFullYear();
}

function getMonthIndex(date, timezoneMode = TIMEZONE_LOCAL) {
  return timezoneMode === TIMEZONE_UTC ? date.getUTCMonth() : date.getMonth();
}

function getHourNumber(date, timezoneMode = TIMEZONE_LOCAL) {
  return timezoneMode === TIMEZONE_UTC ? date.getUTCHours() : date.getHours();
}

/**
 * Analyze all statuses and generate comprehensive statistics
 * @param {Array} statuses - Array of status objects
 * @param {Object} options - Options object
 * @param {Object} options.account - User account object
 * @param {string} [options.lang='en'] - Language code ('en' or 'zh')
 * @param {number} [options.year] - Year to analyze (defaults to current local year)
 * @param {string} [options.timezoneMode='local'] - Timezone mode ('local' or 'utc')
 */
export function analyzeStatuses(
  statuses,
  { account, lang = 'en', year, timezoneMode = TIMEZONE_LOCAL } = {}
) {
  if (!statuses || statuses.length === 0) {
    return null;
  }

  if (!account) {
    return null;
  }

  const targetYear = year || new Date().getFullYear();

  // Single pass: parse dates and pre-compute all time-related data
  const parsedStatuses = statuses.map((s) => {
    const parsed = new Date(s.created_at);
    return {
      status: s,
      date: parsed,
      year: getYearNumber(parsed, timezoneMode),
      month: getMonthIndex(parsed, timezoneMode),
      hour: getHourNumber(parsed, timezoneMode),
      dateString: getDateString(parsed, timezoneMode),
    };
  });

  // Filter by target year using pre-computed data
  const yearStatuses = parsedStatuses.filter((p) => p.year === targetYear);

  // Publish scope (as requested): originals (text+media) + boosts (reblogs), excluding replies
  const publishedStatuses = yearStatuses.filter(
    (p) => !p.status.in_reply_to_id
  );
  const originalStatuses = publishedStatuses.filter((p) => !p.status.reblog);
  const boostStatuses = publishedStatuses.filter((p) => p.status.reblog);

  // Calculate total published posts (originals + boosts, excluding replies)
  const totalPosts = originalStatuses.length + boostStatuses.length;
  if (totalPosts === 0) return null;

  // Three mutually exclusive categories
  const reblogs = boostStatuses.length;
  const replies = yearStatuses.filter(
    (p) => p.status.in_reply_to_id && !p.status.reblog
  ).length;
  const originalPosts = originalStatuses.length;

  // Breakdown of originals (excluding replies)
  const originalWithMedia = originalStatuses.filter(
    (p) => p.status.media_attachments?.length > 0
  );
  const mediaPosts = originalWithMedia.length;
  const textPosts = originalPosts - mediaPosts;

  // Engagement scope: likes and reblogs for original statuses
  const totalFavorites = originalStatuses.reduce(
    (sum, p) => sum + (p.status.favourites_count || 0),
    0
  );
  const totalReblogs = originalStatuses.reduce(
    (sum, p) => sum + (p.status.reblogs_count || 0),
    0
  );

  const longestStreak = calculateLongestStreak(publishedStatuses);
  const socialImpactScore = Math.floor(
    totalReblogs * 2 + totalFavorites + totalPosts * 0.1 + longestStreak * 5
  );

  const persona = determinePersona(
    yearStatuses.length,
    originalPosts,
    reblogs,
    replies,
    lang
  );

  const contentLabels = {
    en: { text: 'Text', reblogs: 'Boosts', media: 'Media' },
    zh: { text: '纯文本', reblogs: '转发', media: '带图/视频' },
  };
  const labels = contentLabels[lang] || contentLabels.en;

  const contentDistribution = [
    { name: labels.text, value: textPosts, color: '#3b82f6' },
    { name: labels.reblogs, value: reblogs, color: '#22c55e' },
    { name: labels.media, value: mediaPosts, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  // All time stats computed in single pass
  const {
    monthlyPosts,
    hourlyPosts,
    activityCalendar,
    mostActiveDay,
    busiestHour,
    mostActiveMonth,
    chronotype,
  } = computeTimeStats(publishedStatuses, lang);

  return {
    account,
    year: targetYear,
    totalPosts,
    originalPosts,
    reblogs,
    socialImpactScore,
    persona,
    chronotype,
    contentDistribution,
    totalFavorites,
    avgFavoritesPerPost:
      totalPosts > 0 ? Math.round(totalFavorites / totalPosts) : 0,
    monthlyPosts,
    hourlyPosts,
    busiestHour,
    mostActiveMonth,
    activityCalendar,
    longestStreak,
    mostActiveDay,
    timezoneMode,
  };
}

/**
 * Compute all time-based statistics in a single pass
 * @param {Array} parsedStatuses - Array of parsed status objects with pre-computed date/time
 * @param {string} lang - Language code
 */
function computeTimeStats(parsedStatuses, lang) {
  const names = MONTH_NAMES[lang] || MONTH_NAMES.en;

  const months = names.map((name, i) => ({ name, month: i + 1, count: 0 }));
  const hours = Array(24)
    .fill(0)
    .map((_, i) => ({ hour: i, label: `${i}:00`, count: 0 }));
  const dayCounts = {};
  const hourCounts = { night: 0, morning: 0, work: 0 };

  // p.month is 0-11 (from getMonthIndex), array index is also 0-11
  parsedStatuses.forEach((p) => {
    months[p.month].count++;
    hours[p.hour].count++;
    dayCounts[p.dateString] = (dayCounts[p.dateString] || 0) + 1;

    if (p.hour >= 0 && p.hour < 5) hourCounts.night++;
    else if (p.hour >= 5 && p.hour < 10) hourCounts.morning++;
    else if (p.hour >= 10 && p.hour < 18) hourCounts.work++;
  });

  const total = parsedStatuses.length;
  const chronotype = determineChronotypeFromCounts(hourCounts, total, lang);

  const busiestHour = hours.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    { count: -1, hour: 0 }
  );
  const mostActiveMonth = months.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    { count: -1, name: '-' }
  );

  let maxDay = null,
    maxCount = 0;
  Object.entries(dayCounts).forEach(([date, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxDay = date;
    }
  });

  return {
    monthlyPosts: months,
    hourlyPosts: hours,
    activityCalendar: dayCounts,
    mostActiveDay: maxDay ? { date: maxDay, count: maxCount } : null,
    busiestHour,
    mostActiveMonth,
    chronotype,
  };
}

function determineChronotypeFromCounts(hourCounts, total, lang) {
  if (total === 0) {
    return lang === 'zh'
      ? { name: '生活家', desc: '作息规律' }
      : { name: 'The Regular', desc: 'Regular schedule' };
  }
  if (hourCounts.night / total > 0.15) {
    return lang === 'zh'
      ? { name: '守夜人', desc: '深夜是你的灵感时刻，活跃度极高。' }
      : {
          name: 'Night Owl',
          desc: 'Late night is your inspiration time, with high activity.',
        };
  }
  if (hourCounts.morning / total > 0.3) {
    return lang === 'zh'
      ? { name: '早起鸟', desc: '你喜欢在清晨开启一天的社交活动。' }
      : {
          name: 'Early Bird',
          desc: 'You like to start your day with social activities in the early morning.',
        };
  }
  if (hourCounts.work / total > 0.6) {
    return lang === 'zh'
      ? { name: '摸鱼大师', desc: '工作时间活跃度极高...是工作太闲还是太忙？' }
      : {
          name: 'Slacker',
          desc: 'Extremely active during work hours... too much free time or too busy?',
        };
  }
  return lang === 'zh'
    ? { name: '生活家', desc: '作息规律，主要在业余时间活跃。' }
    : {
        name: 'The Regular',
        desc: 'Regular schedule, mainly active in your free time.',
      };
}

function determinePersona(total, original, reblogs, replies, lang = 'en') {
  if (total === 0) {
    return lang === 'zh'
      ? { name: '生活家', desc: '新来的朋友' }
      : { name: 'Newcomer', desc: 'A new friend to the community' };
  }

  if (original / total > 0.6) {
    return lang === 'zh'
      ? { name: '广播塔', desc: '你更喜欢输出自己的观点，是社区的声音源。' }
      : {
          name: 'The Broadcaster',
          desc: 'You prefer sharing your own thoughts and are a voice in the community.',
        };
  }
  if (reblogs / total > 0.6) {
    return lang === 'zh'
      ? {
          name: '策展人',
          desc: '你热衷于分享他人的精彩内容，是优质的信息过滤器。',
        }
      : {
          name: 'The Curator',
          desc: "You love sharing others' great content and are a quality information filter.",
        };
  }

  return lang === 'zh'
    ? { name: '平衡大师', desc: '你的原创和转发比例很均衡，是社区的中坚力量。' }
    : {
        name: 'The Balancer',
        desc: 'Your balance of original posts and boosts makes you the backbone of the community.',
      };
}

function calculateLongestStreak(parsedStatuses) {
  if (parsedStatuses.length === 0) return 0;

  const dates = new Set(parsedStatuses.map((p) => p.dateString));
  const sortedDates = Array.from(dates).sort();

  const parseYmdToLocalNoon = (ymd) => {
    const [y, m, d] = String(ymd || '')
      .split('-')
      .map((n) => Number(n));
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d, 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseYmdToLocalNoon(sortedDates[i - 1]);
    const currDate = parseYmdToLocalNoon(sortedDates[i]);
    if (!prevDate || !currDate) {
      currentStreak = 1;
      continue;
    }
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Escape HTML entities to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML insertion
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert Mastodon custom emoji shortcodes to img tags
 * @param {string} displayName - The display name that may contain emoji shortcodes like :emoji:
 * @param {Array} emojis - Array of emoji objects from Mastodon API with { shortcode, url, static_url }
 * @returns {string} HTML string with emoji shortcodes replaced by img tags
 */
export function emojifyDisplayName(displayName, emojis) {
  if (!displayName) return '';

  let result = escapeHtml(displayName);

  if (!emojis || emojis.length === 0) return result;

  for (const emoji of emojis) {
    if (!emoji.shortcode || !/^[a-z0-9_]+$/i.test(emoji.shortcode)) continue;

    const emojiUrl = emoji.static_url || emoji.url;
    if (!emojiUrl || typeof emojiUrl !== 'string') continue;

    try {
      const parsed = new URL(emojiUrl);
      if (parsed.protocol !== 'https:') continue;
    } catch {
      continue;
    }

    const imgTag = `<img src="${escapeHtml(emojiUrl)}" alt="${escapeHtml(emoji.shortcode)}" class="emoji" draggable="false" loading="lazy" />`;
    result = result.split(`:${emoji.shortcode}:`).join(imgTag);
  }

  return result;
}
