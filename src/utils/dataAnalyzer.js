/**
 * Data Analyzer for Mastodon Wrapped
 * Analyzes user's statuses to generate statistics
 * All time processing uses LOCAL TIME to match user's perceived experience
 */

/**
 * Get local date string (YYYY-MM-DD) from a Date object
 * Uses local timezone to match user's perceived posting time
 */
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Analyze all statuses and generate comprehensive statistics
 * @param {Array} statuses - Array of status objects
 * @param {Object} account - User account object
 * @param {string} lang - Language code ('en' or 'zh')
 * @param {number} [year] - Year to analyze (defaults to current local year)
 */
export function analyzeStatuses(statuses, account, lang = 'en', year) {
    if (!statuses || statuses.length === 0) {
        return null;
    }

    const targetYear = year || new Date().getFullYear();

    // Filter statuses by LOCAL year to match user's perceived time
    const yearStatuses = statuses.filter(s => {
        const d = new Date(s.created_at);
        return d.getFullYear() === targetYear;
    });

    const totalPosts = yearStatuses.length;
    if (totalPosts === 0) return null;

    const myOriginalPosts = yearStatuses.filter(s => !s.reblog);
    const originalPosts = myOriginalPosts.length;
    const reblogs = yearStatuses.filter(s => s.reblog).length;
    const replies = yearStatuses.filter(s => s.in_reply_to_id).length;
    const mediaPosts = myOriginalPosts.filter(s => s.media_attachments?.length > 0).length;
    const textPosts = myOriginalPosts.length - mediaPosts;

    const totalFavorites = myOriginalPosts.reduce((sum, s) => sum + (s.favourites_count || 0), 0);
    const totalReblogs = myOriginalPosts.reduce((sum, s) => sum + (s.reblogs_count || 0), 0);
    const totalReplies = myOriginalPosts.reduce((sum, s) => sum + (s.replies_count || 0), 0);

    const longestStreak = calculateLongestStreak(yearStatuses);
    const socialImpactScore = Math.floor(
        (totalReblogs * 2) + totalFavorites + (totalPosts * 0.1) + (longestStreak * 5)
    );

    const persona = determinePersona(yearStatuses.length, originalPosts, reblogs, replies, lang);
    const chronotype = determineChronotype(yearStatuses, lang);

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

    const monthlyPosts = getMonthlyDistribution(yearStatuses, lang);
    const hourlyPosts = getHourlyDistribution(yearStatuses);
    const weekdayPosts = getWeekdayDistribution(yearStatuses, lang);
    const hashtags = getHashtagStats(yearStatuses);
    const activityCalendar = getActivityCalendar(yearStatuses);
    const mostActiveDay = getMostActiveDay(yearStatuses);
    const busiestHour = hourlyPosts.reduce((max, curr) => curr.count > max.count ? curr : max, { count: -1, hour: 0 });
    const mostActiveMonth = monthlyPosts.reduce((max, curr) => curr.count > max.count ? curr : max, { count: -1, name: '-' });

    return {
        account,
        year: targetYear,
        totalPosts,
        originalPosts,
        reblogs,
        replies,
        mediaPosts,
        textPosts,
        socialImpactScore,
        persona,
        chronotype,
        contentDistribution,
        totalFavorites,
        totalReblogs,
        totalReplies,
        avgFavoritesPerPost: myOriginalPosts.length > 0 ? Math.round(totalFavorites / myOriginalPosts.length) : 0,
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
    if (replies / total > 0.5) {
        return lang === 'zh'
            ? { name: '社交达人', desc: '你活跃在评论区，是连接社区的纽带。' }
            : { name: 'The Socialite', desc: 'You are active in comments and connect the community.' };
    }

    return lang === 'zh'
        ? { name: '平衡大师', desc: '你的原创、转发和回复比例很均衡，是社区的中坚力量。' }
        : { name: 'The Balancer', desc: 'Your balance of original posts, boosts, and replies makes you the backbone of the community.' };
}

function determineChronotype(statuses, lang = 'en') {
    if (statuses.length === 0) {
        return lang === 'zh' ? { name: '生活家', desc: '作息规律' } : { name: 'The Regular', desc: 'Regular schedule' };
    }

    const hours = statuses.map(s => new Date(s.created_at).getHours());
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

function getMonthlyDistribution(statuses, lang = 'en') {
    const monthNames = {
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    };
    const names = monthNames[lang] || monthNames.en;
    // Use month: 1-12 instead of 0-11 for proper display
    const months = names.map((name, i) => ({ name, month: i + 1, count: 0 }));

    statuses.forEach(status => {
        const month = new Date(status.created_at).getMonth();
        months[month].count++;
    });

    return months;
}

function getHourlyDistribution(statuses) {
    const hours = Array(24).fill(0).map((_, i) => ({
        hour: i,
        label: `${i}:00`,
        count: 0
    }));

    statuses.forEach(status => {
        const hour = new Date(status.created_at).getHours();
        hours[hour].count++;
    });

    return hours;
}

function getWeekdayDistribution(statuses, lang = 'en') {
    const dayNames = {
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    };
    const names = dayNames[lang] || dayNames.en;
    const days = names.map((name, i) => ({ name, day: i, count: 0 }));

    statuses.forEach(status => {
        const day = new Date(status.created_at).getDay();
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

function getActivityCalendar(statuses) {
    const calendar = {};
    statuses.forEach(status => {
        const date = getLocalDateString(new Date(status.created_at));
        calendar[date] = (calendar[date] || 0) + 1;
    });
    return calendar;
}

function calculateLongestStreak(statuses) {
    if (statuses.length === 0) return 0;

    const dates = new Set(
        statuses.map(s => getLocalDateString(new Date(s.created_at)))
    );
    const sortedDates = Array.from(dates).sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
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

function getMostActiveDay(statuses) {
    const dayCounts = {};

    statuses.forEach(status => {
        const date = getLocalDateString(new Date(status.created_at));
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
        } catch (_error) {
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

