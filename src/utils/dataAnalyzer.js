/**
 * Data Analyzer for Mastodon Wrapped
 * Analyzes user's statuses to generate statistics
 * All time processing uses LOCAL TIME to match user's perceived experience
 */

/**
 * Get local date string (YYYY-MM-DD) from a Date object
 * Uses local timezone to match user's perceived posting time
 */
function getDateString(date, timezoneMode = 'local') {
    const year = timezoneMode === 'utc' ? date.getUTCFullYear() : date.getFullYear();
    const monthIndex = timezoneMode === 'utc' ? date.getUTCMonth() : date.getMonth();
    const dayOfMonth = timezoneMode === 'utc' ? date.getUTCDate() : date.getDate();
    const month = String(monthIndex + 1).padStart(2, '0');
    const day = String(dayOfMonth).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getYearNumber(date, timezoneMode = 'local') {
    return timezoneMode === 'utc' ? date.getUTCFullYear() : date.getFullYear();
}

function getMonthIndex(date, timezoneMode = 'local') {
    return timezoneMode === 'utc' ? date.getUTCMonth() : date.getMonth();
}

function getHourNumber(date, timezoneMode = 'local') {
    return timezoneMode === 'utc' ? date.getUTCHours() : date.getHours();
}

function getWeekdayNumber(date, timezoneMode = 'local') {
    return timezoneMode === 'utc' ? date.getUTCDay() : date.getDay();
}

/**
 * Analyze all statuses and generate comprehensive statistics
 * @param {Array} statuses - Array of status objects
 * @param {Object} account - User account object
 * @param {string} lang - Language code ('en' or 'zh')
 * @param {number} [year] - Year to analyze (defaults to current local year)
 */
export function analyzeStatuses(statuses, account, lang = 'en', year, timezoneMode = 'local') {
    if (!statuses || statuses.length === 0) {
        return null;
    }

    const targetYear = year || new Date().getFullYear();

    // Filter statuses by selected timezone year
    const yearStatuses = statuses.filter(s => {
        const d = new Date(s.created_at);
        return getYearNumber(d, timezoneMode) === targetYear;
    });

    // Publish scope (as requested): originals (text+media) + boosts (reblogs), excluding replies
    const publishedStatuses = yearStatuses.filter(s => !s.in_reply_to_id);
    const originalStatuses = publishedStatuses.filter(s => !s.reblog);
    const boostStatuses = publishedStatuses.filter(s => s.reblog);

    // Calculate total published posts (originals + boosts, excluding replies)
    const totalPosts = originalStatuses.length + boostStatuses.length;
    if (totalPosts === 0) return null;

    // Three mutually exclusive categories
    const reblogs = boostStatuses.length;
    const replies = yearStatuses.filter(s => s.in_reply_to_id && !s.reblog).length;
    const originalPosts = originalStatuses.length;

    // Breakdown of originals (excluding replies)
    const originalWithMedia = originalStatuses.filter(s => s.media_attachments?.length > 0);
    const mediaPosts = originalWithMedia.length;
    const textPosts = originalPosts - mediaPosts;

    // Engagement scope (per your requirement):
    // - Likes should NOT include likes of the boosted (original) status content.
    // - Mastodon treats favoriting a boost as favoriting the original, so boosts don't have their own "likes received" signal.
    // Therefore we only count likes received for statuses authored by the user (originalStatuses).
    const totalFavorites = originalStatuses.reduce((sum, s) => sum + (s.favourites_count || 0), 0);
    // Keep these as "received by your authored posts" metrics (originalStatuses) to avoid attributing other people's content.
    const totalReblogs = originalStatuses.reduce((sum, s) => sum + (s.reblogs_count || 0), 0);
    const totalReplies = originalStatuses.reduce((sum, s) => sum + (s.replies_count || 0), 0);

    const longestStreak = calculateLongestStreak(publishedStatuses, timezoneMode);
    const socialImpactScore = Math.floor(
        (totalReblogs * 2) + totalFavorites + (totalPosts * 0.1) + (longestStreak * 5)
    );

    const persona = determinePersona(yearStatuses.length, originalPosts, reblogs, replies, lang);
    const chronotype = determineChronotype(publishedStatuses, lang, timezoneMode);

    const contentLabels = {
        en: { text: 'Text', reblogs: 'Boosts', media: 'Media' },
        zh: { text: '纯文本', reblogs: '转发', media: '带图/视频' }
    };
    const labels = contentLabels[lang] || contentLabels.en;

    const contentDistribution = [
        { name: labels.text, value: textPosts, color: '#3b82f6' },
        { name: labels.reblogs, value: reblogs, color: '#22c55e' },
        { name: labels.media, value: mediaPosts, color: '#f59e0b' },
    ].filter(item => item.value > 0);

    const monthlyPosts = getMonthlyDistribution(publishedStatuses, lang, timezoneMode);
    const hourlyPosts = getHourlyDistribution(publishedStatuses, timezoneMode);
    const weekdayPosts = getWeekdayDistribution(publishedStatuses, lang, timezoneMode);
    // Hashtags should reflect what the user authored, not what they boosted
    const hashtags = getHashtagStats(yearStatuses.filter(s => !s.reblog));
    const activityCalendar = getActivityCalendar(publishedStatuses, timezoneMode);
    const mostActiveDay = getMostActiveDay(publishedStatuses, timezoneMode);
    const busiestHour = hourlyPosts.reduce((max, curr) => curr.count > max.count ? curr : max, { count: -1, hour: 0 });
    const mostActiveMonth = monthlyPosts.reduce((max, curr) => curr.count > max.count ? curr : max, { count: -1, name: '-' });

    return {
        account,
        year: targetYear,
        totalPosts,
        originalPosts,
        reblogs,
        mediaPosts,
        textPosts,
        socialImpactScore,
        persona,
        chronotype,
        contentDistribution,
        totalFavorites,
        totalReblogs,
        totalReplies,
        avgFavoritesPerPost: totalPosts > 0 ? Math.round(totalFavorites / totalPosts) : 0,
        monthlyPosts,
        hourlyPosts,
        weekdayPosts,
        busiestHour,
        mostActiveMonth,
        topHashtags: hashtags.slice(0, 10),
        uniqueHashtags: hashtags.length,
        activityCalendar,
        longestStreak,
        mostActiveDay,
        dateRange: { start: new Date(targetYear, 0, 1), end: new Date() },
        timezoneMode,
    };
}

function determinePersona(total, original, reblogs, replies, lang = 'en') {
    if (total === 0) {
        return lang === 'zh' ? { name: '生活家', desc: '新来的朋友' } : { name: 'Newcomer', desc: 'A new friend to the community' };
    }

    if (original / total > 0.6) {
        return lang === 'zh'
            ? { name: '广播塔', desc: '你更喜欢输出自己的观点，是社区的声音源。' }
            : { name: 'The Broadcaster', desc: 'You prefer sharing your own thoughts and are a voice in the community.' };
    }
    if (reblogs / total > 0.6) {
        return lang === 'zh'
            ? { name: '策展人', desc: '你热衷于分享他人的精彩内容，是优质的信息过滤器。' }
            : { name: 'The Curator', desc: 'You love sharing others\' great content and are a quality information filter.' };
    }

    return lang === 'zh'
        ? { name: '平衡大师', desc: '你的原创和转发比例很均衡，是社区的中坚力量。' }
        : { name: 'The Balancer', desc: 'Your balance of original posts and boosts makes you the backbone of the community.' };
}

function determineChronotype(statuses, lang = 'en', timezoneMode = 'local') {
    if (statuses.length === 0) {
        return lang === 'zh' ? { name: '生活家', desc: '作息规律' } : { name: 'The Regular', desc: 'Regular schedule' };
    }

    const hours = statuses.map(s => getHourNumber(new Date(s.created_at), timezoneMode));
    const total = hours.length;

    const nightCount = hours.filter(h => h >= 0 && h < 5).length;
    const morningCount = hours.filter(h => h >= 5 && h < 10).length;
    const workCount = hours.filter(h => h >= 10 && h < 18).length;

    if (nightCount / total > 0.15) {
        return lang === 'zh'
            ? { name: '守夜人', desc: '深夜是你的灵感时刻，活跃度极高。' }
            : { name: 'Night Owl', desc: 'Late night is your inspiration time, with high activity.' };
    }
    if (morningCount / total > 0.30) {
        return lang === 'zh'
            ? { name: '早起鸟', desc: '你喜欢在清晨开启一天的社交活动。' }
            : { name: 'Early Bird', desc: 'You like to start your day with social activities in the early morning.' };
    }
    if (workCount / total > 0.60) {
        return lang === 'zh'
            ? { name: '摸鱼大师', desc: '工作时间活跃度极高...是工作太闲还是太忙？' }
            : { name: 'Slacker', desc: 'Extremely active during work hours... too much free time or too busy?' };
    }

    return lang === 'zh'
        ? { name: '生活家', desc: '作息规律，主要在业余时间活跃。' }
        : { name: 'The Regular', desc: 'Regular schedule, mainly active in your free time.' };
}

function getMonthlyDistribution(statuses, lang = 'en', timezoneMode = 'local') {
    const monthNames = {
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    };
    const names = monthNames[lang] || monthNames.en;
    // Use month: 1-12 instead of 0-11 for proper display
    const months = names.map((name, i) => ({ name, month: i + 1, count: 0 }));

    statuses.forEach(status => {
        const month = getMonthIndex(new Date(status.created_at), timezoneMode);
        months[month].count++;
    });

    return months;
}

function getHourlyDistribution(statuses, timezoneMode = 'local') {
    const hours = Array(24).fill(0).map((_, i) => ({
        hour: i,
        label: `${i}:00`,
        count: 0
    }));

    statuses.forEach(status => {
        const hour = getHourNumber(new Date(status.created_at), timezoneMode);
        hours[hour].count++;
    });

    return hours;
}

function getWeekdayDistribution(statuses, lang = 'en', timezoneMode = 'local') {
    const dayNames = {
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    };
    const names = dayNames[lang] || dayNames.en;
    const days = names.map((name, i) => ({ name, day: i, count: 0 }));

    statuses.forEach(status => {
        const day = getWeekdayNumber(new Date(status.created_at), timezoneMode);
        days[day].count++;
    });

    return days;
}

function getHashtagStats(statuses) {
    const hashtagCounts = {};

    statuses.forEach(status => {
        status.tags?.forEach(tag => {
            const name = tag.name.toLowerCase();
            hashtagCounts[name] = (hashtagCounts[name] || 0) + 1;
        });
    });

    return Object.entries(hashtagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
}

function getActivityCalendar(statuses, timezoneMode = 'local') {
    const calendar = {};
    statuses.forEach(status => {
        const date = getDateString(new Date(status.created_at), timezoneMode);
        calendar[date] = (calendar[date] || 0) + 1;
    });
    return calendar;
}

function calculateLongestStreak(statuses, timezoneMode = 'local') {
    if (statuses.length === 0) return 0;

    const dates = new Set(
        statuses.map(s => getDateString(new Date(s.created_at), timezoneMode))
    );
    const sortedDates = Array.from(dates).sort();

    const parseYmdToLocalNoon = (ymd) => {
        const [y, m, d] = String(ymd || '').split('-').map(n => Number(n));
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

function getMostActiveDay(statuses, timezoneMode = 'local') {
    const dayCounts = {};

    statuses.forEach(status => {
        const date = getDateString(new Date(status.created_at), timezoneMode);
        dayCounts[date] = (dayCounts[date] || 0) + 1;
    });

    let maxDay = null;
    let maxCount = 0;

    Object.entries(dayCounts).forEach(([date, count]) => {
        if (count > maxCount) {
            maxCount = count;
            maxDay = date;
        }
    });

    return maxDay ? { date: maxDay, count: maxCount } : null;
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
 * Format date based on language
 */
export function formatDate(dateStr, lang = 'en') {
    const date = new Date(dateStr);
    if (lang === 'zh') {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Strip HTML tags from content (XSS-safe)
 */
export function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
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

    // Escape HTML entities first to prevent XSS attacks
    let result = escapeHtml(displayName);

    if (!emojis || emojis.length === 0) return result;

    for (const emoji of emojis) {
        // Security: Validate shortcode format (only alphanumeric and underscores)
        if (!emoji.shortcode || !/^[a-z0-9_]+$/i.test(emoji.shortcode)) {
            console.warn('Invalid emoji shortcode:', emoji.shortcode);
            continue; // Skip invalid emoji
        }

        // Security: Validate URL protocol - only allow HTTPS
        const emojiUrl = emoji.static_url || emoji.url;
        if (!emojiUrl || typeof emojiUrl !== 'string') {
            console.warn('Missing or invalid emoji URL');
            continue;
        }

        // Ensure URL starts with https:// (not javascript:, data:, etc.)
        if (!emojiUrl.startsWith('https://')) {
            console.warn('Unsafe emoji URL protocol:', emojiUrl);
            continue;
        }

        // Additional URL validation
        try {
            const url = new URL(emojiUrl);
            if (url.protocol !== 'https:') {
                console.warn('Non-HTTPS emoji URL:', emojiUrl);
                continue;
            }
        } catch {
            console.warn('Invalid emoji URL format:', emojiUrl);
            continue;
        }

        const escapedShortcode = escapeHtml(emoji.shortcode);
        const escapedUrl = escapeHtml(emojiUrl);
        const shortcode = `:${emoji.shortcode}:`;

        // Use escaped URL in img tag
        const imgTag = `<img src="${escapedUrl}" alt="${escapedShortcode}" class="emoji" draggable="false" loading="lazy" />`;
        result = result.split(shortcode).join(imgTag);
    }

    return result;
}
