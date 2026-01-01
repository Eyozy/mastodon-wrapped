export const translations = {
    en: {
        // Landing Page
        title: "{year} Mastodon Wrapped",
        subtitle: "Review your Mastodon activity for {year}",
        subtitle_auto: "Review your annual Mastodon activity",
        placeholder: "Enter your Mastodon handle (e.g. user@instance.social)",
        helper: "Example: Gargron@mastodon.social",
        cta: "Get Wrapped",
        loading: "Loading...",
        quick_instances: "Popular Instances:",
        privacy: "We only access public data. No login required.",
        footer_copyright: "{year} Mastodon Wrapped",
        inspiration: "Inspiration by",

        // Loading Screen
        fetching: "Fetching Toots...",
        analyzing: "Analyzing your annual data...",
        local_processing: "Data processed locally in your browser",
        step_profile: "Fetching profile...",
        step_toots: "Fetching toots...",
        step_analyze: "Analyzing data...",

        // Stats Display
        report_title: "{year} Wrapped Report",
        back: "Back",

        // Identity
        persona_label: "Persona",
        chronotype_label: "Chronotype",

        // Impact
        impact_score: "Impact",
        impact_detail_reblog: "Reblog x2",
        impact_detail_fav: "Like x1",
        impact_detail_post: "Post x0.1",
        impact_detail_streak: "Streak x5",

        // Mini Stats
        total_posts: "Posts",
        original_posts: "Originals",
        favorites_received: "Likes",
        reblogs_received: "Boosts",
        longest_streak: "Streak",
        avg_favorites: "Avg Likes",
        days: "days",

        // Charts
        trend_title: "Posting Trend",
        distribution_title: "Content Dist.",
        rhythm_title: "Activity Rhythm",
        activity_rhythm: "Activity Rhythm",
        heatmap_title: "Activity Calendar",

        // Activity Highlights
        most_active_month: "Peak Month",
        most_active_day: "Peak Day",
        busiest_hour: "Peak Hour",

        // Heatmap Legend
        legend_less: "Less",
        legend_more: "More",
        heatmap_hover: "Hover to view details",
        toots: "toots",

        // Top Toot
        top_toot_title: "Top Toot",
        top_toot_calc: "* Score: Replies x3 + Boosts x2 + Likes x1.5",

        // Hashtags
        top_hashtags: "Top Hashtags",

        // Common
        generated_at: "Generated at",
        no_data: "No Data",

        // Download
        download_image: "Download Image",
        downloading: "Downloading...",
        error_download: "Failed to download image. Please try again.",

        // Errors
        error_empty: "Please enter your Mastodon handle",
        error_invalid: "Please enter a valid handle (username@instance)",
    },
    zh: {
        // Landing Page
        title: "{year} Mastodon Wrapped",
        subtitle: "回顾你的 {year} 年度 Mastodon 活动",
        subtitle_auto: "回顾你的 Mastodon 年度活动",
        placeholder: "请输入你的 Mastodon 账号",
        helper: "例：Gargron@mastodon.social",
        cta: "获取年度报告",
        loading: "加载中...",
        quick_instances: "常用实例：",
        privacy: "我们只访问公开的嘟文数据，不需要登录授权",
        footer_copyright: "{year} Mastodon Wrapped",
        inspiration: "灵感来源于",

        // Loading Screen
        fetching: "正在获取嘟文...",
        analyzing: "正在全方位分析你的年度数据...",
        local_processing: "数据仅在本地浏览器处理",
        step_profile: "获取个人信息...",
        step_toots: "获取嘟文数据...",
        step_analyze: "分析数据...",

        // Stats Display
        report_title: "{year} 年度报告",
        back: "返回",

        // Identity
        persona_label: "人格",
        chronotype_label: "作息",

        // Impact
        impact_score: "影响力",
        impact_detail_reblog: "转发 x2",
        impact_detail_fav: "点赞 x1",
        impact_detail_post: "发文 x0.1",
        impact_detail_streak: "连更 x5",

        // Mini Stats
        total_posts: "发布",
        original_posts: "原创",
        favorites_received: "获赞",
        reblogs_received: "转发",
        longest_streak: "连更",
        avg_favorites: "均赞",
        days: "天",

        // Charts
        trend_title: "发布趋势",
        distribution_title: "内容分布",
        rhythm_title: "活跃节奏",
        activity_rhythm: "活跃节奏",
        heatmap_title: "年度活动日历",

        // Activity Highlights
        most_active_month: "活跃月",
        most_active_day: "活跃日",
        busiest_hour: "高峰期",

        // Heatmap Legend
        legend_less: "少",
        legend_more: "多",
        heatmap_hover: "鼠标悬停方块查看详情",
        toots: "条嘟文",

        // Top Toot
        top_toot_title: "年度最佳嘟文",
        top_toot_calc: "* 计算基于热度指数：回复量 x3 + 转推量 x2 + 点赞量 x1.5",

        // Hashtags
        top_hashtags: "常用标签",

        // Common
        generated_at: "生成于",
        no_data: "无数据",

        // Download
        download_image: "下载图片",
        downloading: "下载中...",
        error_download: "下载图片失败，请重试。",

        // Errors
        error_empty: "请输入你的 Mastodon 账户地址",
        error_invalid: "请输入完整的账户地址，格式：用户名@实例",
    }
};

export function getTranslation(lang, key, params = {}) {
    let text = translations[lang][key] || translations['en'][key] || key;
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    return text;
}
