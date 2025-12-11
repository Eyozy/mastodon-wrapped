/**
 * Data Analyzer for Mastodon Wrapped
 * Analyzes user's statuses to generate statistics
 */

/**
 * Analyze all statuses and generate comprehensive statistics
 * @param {object[]} statuses - Array of Mastodon status objects
 * @param {object} account - The user's account object
 * @param {string} lang - Language code ('en' or 'zh')
 * @returns {object} - Analyzed statistics
 */
export function analyzeStatuses(statuses, account, lang = 'en') {
    if (!statuses || statuses.length === 0) {
        return null;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Filter to only include statuses from the current year
    const yearStatuses = statuses.filter(s => {
        const d = new Date(s.created_at);
        return d >= startOfYear && d <= endOfYear;
    });

    // Basic counts
    const totalPosts = yearStatuses.length;
    if (totalPosts === 0) return null; // No posts this year

    const originalPosts = yearStatuses.filter(s => !s.reblog && (!s.media_attachments || s.media_attachments.length === 0)).length;
    const reblogs = yearStatuses.filter(s => s.reblog).length;
    const mediaPosts = yearStatuses.filter(s => !s.reblog && s.media_attachments && s.media_attachments.length > 0).length;
    const replies = yearStatuses.filter(s => s.in_reply_to_id).length;

    // Basic stats for original content (excluding reblogs) to calculate engagement accurately
    const myOriginalPosts = yearStatuses.filter(s => !s.reblog);

    // Engagement stats
    const totalFavorites = myOriginalPosts.reduce((sum, s) => sum + (s.favourites_count || 0), 0);
    const totalReblogs = myOriginalPosts.reduce((sum, s) => sum + (s.reblogs_count || 0), 0);
    const totalReplies = myOriginalPosts.reduce((sum, s) => sum + (s.replies_count || 0), 0);

    // Streak calculation
    const longestStreak = calculateLongestStreak(yearStatuses);

    // --- New Advanced Analytics ---

    // 1. Social Impact Score
    // Score = (Reblogs * 2) + Favorites + (Total Posts * 0.1) + (Longest Streak * 5)
    const socialImpactScore = Math.floor(
        (totalReblogs * 2) +
        totalFavorites +
        (totalPosts * 0.1) +
        (longestStreak * 5)
    );

    // 2. Top Toot of the Year
    // Score = (Reblogs * 2) + Favorites + Replies
    // Tie-breaker: Content length
    const topToot = getTopToot(myOriginalPosts);

    // 3. Mastodon Persona
    const persona = determinePersona(yearStatuses.length, originalPosts + mediaPosts, reblogs, replies, lang);

    // 4. Chronotype (Posting Time Pattern)
    const chronotype = determineChronotype(yearStatuses, lang);


    // Content Distribution for Pie Chart
    const contentLabels = {
        en: {
            original: 'Originals',
            reblogs: 'Boosts',
            media: 'Media Posts'
        },
        zh: {
            original: '原创内容',
            reblogs: '转发',
            media: '带媒体内容'
        }
    };

    const labels = contentLabels[lang] || contentLabels.en;

    const contentDistribution = [
        { name: labels.original, value: originalPosts, color: '#3b82f6' },
        { name: labels.reblogs, value: reblogs, color: '#22c55e' },
        { name: labels.media, value: mediaPosts, color: '#f59e0b' },
    ].filter(item => item.value > 0);

    // Monthly distribution
    const monthlyPosts = getMonthlyDistribution(yearStatuses, lang);

    // Hourly distribution (Activity Rhythm)
    const hourlyPosts = getHourlyDistribution(yearStatuses);

    // Day of week distribution
    const weekdayPosts = getWeekdayDistribution(yearStatuses, lang);

    // Hashtag analysis
    const hashtags = getHashtagStats(yearStatuses);

    // Activity calendar (daily posts)
    const activityCalendar = getActivityCalendar(yearStatuses);

    // Most active day
    const mostActiveDay = getMostActiveDay(yearStatuses);

    // Busiest Hour (from hourlyPosts)
    const busiestHour = hourlyPosts.reduce((max, curr) => curr.count > max.count ? curr : max, { count: -1, hour: 0 });

    // Most active month (from monthlyPosts)
    const mostActiveMonth = monthlyPosts.reduce((max, curr) => curr.count > max.count ? curr : max, { count: -1, name: '-' });

    return {
        // User info
        account,
        year: currentYear,

        // Basic stats
        totalPosts,
        originalPosts,
        reblogs,
        replies,
        mediaPosts,

        // Advanced Stats
        socialImpactScore,
        topToot,
        persona,
        chronotype,

        // Distribution
        contentDistribution,

        // Engagement
        totalFavorites,
        totalReblogs,
        totalReplies,
        avgFavoritesPerPost: myOriginalPosts.length > 0 ? Math.round(totalFavorites / myOriginalPosts.length) : 0,

        // Time analysis
        monthlyPosts,
        hourlyPosts,
        weekdayPosts,
        busiestHour,
        mostActiveMonth,

        // Hashtags
        topHashtags: hashtags.slice(0, 10),
        uniqueHashtags: hashtags.length,

        // Calendar
        activityCalendar,

        // Streaks and records
        longestStreak,
        mostActiveDay,

        // Meta
        dateRange: {
            start: startOfYear,
            end: now,
        },
    };
}

/**
 * Calculate Top Toot based on engagement score
 */
function getTopToot(originalPosts) {
    if (originalPosts.length === 0) return null;

    return originalPosts.reduce((best, current) => {
        // Updated weights: Replies * 3 (high engagement), Reblogs * 2 (spread), Favourites * 1.5 (approval)
        const currentScore = (current.reblogs_count * 2) + (current.favourites_count * 1.5) + (current.replies_count * 3);
        const bestScore = (best.reblogs_count * 2) + (best.favourites_count * 1.5) + (best.replies_count * 3);

        if (currentScore > bestScore) {
            return current;
        } else if (currentScore === bestScore) {
            // Tie-breaker: Content length
            return current.content.length > best.content.length ? current : best;
        }
        return best;
    }, originalPosts[0]);
}

/**
 * Determine Mastodon Persona
 */
function determinePersona(total, original, reblogs, replies, lang = 'en') {
    if (total === 0) return lang === 'zh' ? { name: '生活家', desc: '新来的朋友' } : { name: 'Newcomer', desc: 'A new friend to the community' };

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

/**
 * Determine Chronotype
 */
function determineChronotype(statuses, lang = 'en') {
    if (statuses.length === 0) return lang === 'zh' ? { name: '生活家', desc: '作息规律' } : { name: 'The Regular', desc: 'Regular schedule' };

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

/**
 * Get monthly post distribution
 */
function getMonthlyDistribution(statuses, lang = 'en') {
    const months = {};
    const monthNames = {
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    };

    const names = monthNames[lang] || monthNames.en;

    // Initialize all months
    for (let i = 0; i < 12; i++) {
        months[i] = { name: names[i], count: 0 };
    }

    statuses.forEach(status => {
        const month = new Date(status.created_at).getMonth();
        months[month].count++;
    });

    return Object.values(months);
}

/**
 * Get hourly post distribution
 */
function getHourlyDistribution(statuses) {
    // 0-23 hour slots
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

/**
 * Get weekday post distribution
 */
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

/**
 * Extract and count hashtag usage
 */
function getHashtagStats(statuses) {
    const hashtagCounts = {};

    statuses.forEach(status => {
        if (status.tags && status.tags.length > 0) {
            status.tags.forEach(tag => {
                const name = tag.name.toLowerCase();
                hashtagCounts[name] = (hashtagCounts[name] || 0) + 1;
            });
        }
    });

    return Object.entries(hashtagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Generate activity calendar data
 */
function getActivityCalendar(statuses) {
    const calendar = {};

    statuses.forEach(status => {
        const date = new Date(status.created_at).toISOString().split('T')[0];
        calendar[date] = (calendar[date] || 0) + 1;
    });

    return calendar;
}

/**
 * Calculate longest posting streak
 */
function calculateLongestStreak(statuses) {
    if (statuses.length === 0) return 0;

    const dates = new Set(
        statuses.map(s => new Date(s.created_at).toISOString().split('T')[0])
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

/**
 * Find the most active day
 */
function getMostActiveDay(statuses) {
    const dayCounts = {};

    statuses.forEach(status => {
        const date = new Date(status.created_at).toISOString().split('T')[0];
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
 * Analyze media attachments
 */
function getMediaStats(statuses) {
    let images = 0;
    let videos = 0;
    let audio = 0;

    statuses.forEach(status => {
        if (status.media_attachments && status.media_attachments.length > 0) {
            status.media_attachments.forEach(media => {
                if (media.type === 'image' || media.type === 'gifv') {
                    images++;
                } else if (media.type === 'video') {
                    videos++;
                } else if (media.type === 'audio') {
                    audio++;
                }
            });
        }
    });

    return { images, videos, audio, total: images + videos + audio };
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format date based on language
 */
export function formatDate(dateStr, lang = 'en') {
    const date = new Date(dateStr);
    if (lang === 'zh') {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

/**
 * Strip HTML tags from content
 */
export function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}
