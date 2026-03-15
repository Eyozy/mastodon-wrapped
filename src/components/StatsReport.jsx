// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { formatNumber, emojifyDisplayName } from '../utils/dataAnalyzer';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ArrowLeftIcon,
  DownloadIcon,
  LoaderIcon,
  TrophyIcon,
  TimeIcon,
  UserStarIcon,
  QuillPenIcon,
  EditIcon,
  HeartIcon,
  RepeatIcon,
  FireIcon,
  StarSmileIcon,
  CalendarIcon,
  CalendarCheckIcon,
  LineChartIcon,
  PieChartIcon,
} from './ui/icons';
import ActivityHeatmap from './ActivityHeatmap';

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

// Chart color tokens
const CHART_COLORS = {
  purple: CHART_COLORS.purple,
  orange: CHART_COLORS.orange,
  blue: CHART_COLORS.blue,
  sky: CHART_COLORS.sky,
  pink: CHART_COLORS.pink,
  green: CHART_COLORS.green,
  amber: CHART_COLORS.amber,
  cyan: CHART_COLORS.cyan,
  rose: CHART_COLORS.rose,
  slate: CHART_COLORS.slate,
};

export default function StatsReport({
  stats,
  t,
  availableYears = [],
  timezoneMode = 'local',
  onReset,
  onDownload,
  isDownloading,
  onYearChange,
  onTimezoneChange,
  className = '',
  containerId = 'stats-container', // Allow overriding ID for the ghost component
  formatUtcOffset,
  localOffsetMinutes,
  showControls = true, // Option to hide controls in export mode if desired
  isExport = false, // New prop to detect export mode
}) {
  const containerVariants = isExport
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      };

  const itemVariants = isExport
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      id={containerId}
      className={`stats-container ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Back Button */}
      <motion.header className="stats-header" variants={itemVariants}>
        {showControls && (
          <>
            <button
              className="back-button"
              onClick={onReset}
              aria-label={t('back')}
            >
              <ArrowLeftIcon />
            </button>
            <button
              id="download-btn"
              className="download-button"
              onClick={onDownload}
              disabled={isDownloading}
              aria-label={t('download_image')}
            >
              {isDownloading ? (
                <>
                  <LoaderIcon />
                  <span>{t('downloading')}</span>
                </>
              ) : (
                <>
                  <DownloadIcon />
                  <span>{t('download_image')}</span>
                </>
              )}
            </button>
          </>
        )}

        <div className="user-info">
          <img
            src={stats.account.avatar}
            alt={`${
              stats.account.display_name || stats.account.username
            }'s avatar`}
            className="user-avatar"
            loading={isExport ? 'eager' : 'lazy'}
            onError={(e) => {
              // Fallback to a default avatar on load failure
              e.target.onerror = null; // Prevent infinite loop
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e2e8f0'/%3E%3Ccircle cx='50' cy='40' r='18' fill='%2394a3b8'/%3E%3Cellipse cx='50' cy='80' rx='28' ry='20' fill='%2394a3b8'/%3E%3C/svg%3E";
            }}
          />
          <div className="user-details">
            <h1
              className="user-name"
              dangerouslySetInnerHTML={{
                __html: emojifyDisplayName(
                  stats.account.display_name || stats.account.username,
                  stats.account.emojis
                ),
              }}
            />
            <p className="user-handle">@{stats.account.acct}</p>
          </div>
        </div>
        <h2 className="stats-title">
          <span className="stats-title-text">
            {t('report_title', { year: stats.year })}
          </span>
          <span className="stats-controls-row">
            {showControls && availableYears.length > 1 && (
              <span className="year-selector">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    className={`year-btn ${
                      year === stats.year ? 'active' : ''
                    }`}
                    onClick={() => onYearChange && onYearChange(year)}
                    disabled={year === stats.year}
                  >
                    {year}
                  </button>
                ))}
              </span>
            )}

            {showControls && (
              <span className="timezone-selector">
                <span className="timezone-label">{t('timezone_label')}</span>
                <select
                  className="timezone-select"
                  value={timezoneMode}
                  onChange={(e) => onTimezoneChange?.(e.target.value)}
                >
                  <option value="local">
                    {t('timezone_local')} ({formatUtcOffset(localOffsetMinutes)}
                    )
                  </option>
                  <option value="utc">{t('timezone_utc')}</option>
                </select>
              </span>
            )}
          </span>
        </h2>
      </motion.header>

      {/* Core Stats Grid (3 Columns Desktop) */}
      <motion.section className="stats-grid-section" variants={itemVariants}>
        <div className="stats-grid-container">
          {/* 1. Impact Score / Rank */}
          <div className="grid-card impact-card-small">
            <div className="card-icon">
              <TrophyIcon />
            </div>
            <div className="card-content">
              <span className="card-label">{t('impact_score')}</span>
              <span className="card-value highlight-text">
                {formatNumber(stats.socialImpactScore)}
              </span>
            </div>
          </div>

          {/* 2. Chronotype (Night Owl etc) - Requested specifically */}
          <div className="grid-card">
            <div className="card-icon">
              <TimeIcon style={{ color: CHART_COLORS.purple }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('chronotype_label')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.purple }}>
                {stats.chronotype.name}
              </span>
            </div>
          </div>

          {/* 3. Persona */}
          <div className="grid-card">
            <div className="card-icon">
              <UserStarIcon style={{ color: CHART_COLORS.orange }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('persona_label')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.orange }}>
                {stats.persona.name}
              </span>
            </div>
          </div>

          {/* 4. Total Posts */}
          <div className="grid-card">
            <div className="card-icon">
              <QuillPenIcon style={{ color: CHART_COLORS.blue }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('total_posts')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.blue }}>
                {formatNumber(stats.totalPosts)}
              </span>
            </div>
          </div>

          {/* 5. Originals */}
          <div className="grid-card">
            <div className="card-icon">
              <EditIcon style={{ color: CHART_COLORS.sky }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('original_posts')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.sky }}>
                {formatNumber(stats.originalPosts)}
              </span>
            </div>
          </div>

          {/* 6. Likes Received */}
          <div className="grid-card">
            <div className="card-icon">
              <HeartIcon style={{ color: CHART_COLORS.pink }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('favorites_received')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.pink }}>
                {formatNumber(stats.totalFavorites)}
              </span>
            </div>
          </div>

          {/* 7. Boosts (Reblogs) */}
          <div className="grid-card">
            <div className="card-icon">
              <RepeatIcon style={{ color: CHART_COLORS.green }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('reblogs_sent')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.green }}>
                {formatNumber(stats.reblogs)}
              </span>
            </div>
          </div>

          {/* 8. Longest Streak */}
          <div className="grid-card">
            <div className="card-icon">
              <FireIcon style={{ color: CHART_COLORS.amber }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('longest_streak')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.amber }}>
                {stats.longestStreak} {t('days')}
              </span>
            </div>
          </div>

          {/* 9. Average Likes per Post */}
          <div className="grid-card">
            <div className="card-icon">
              <StarSmileIcon style={{ color: CHART_COLORS.amber }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('avg_favorites')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.amber }}>
                {stats.avgFavoritesPerPost || 0}
              </span>
            </div>
          </div>

          {/* 10. Most Active Month */}
          <div className="grid-card">
            <div className="card-icon">
              <CalendarIcon style={{ color: CHART_COLORS.purple }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('most_active_month')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.purple }}>
                {stats.mostActiveMonth?.name || '-'}
              </span>
            </div>
          </div>

          {/* 11. Most Active Day */}
          <div className="grid-card">
            <div className="card-icon">
              <CalendarCheckIcon style={{ color: CHART_COLORS.cyan }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('most_active_day')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.cyan }}>
                {stats.mostActiveDay?.date || '-'}
              </span>
            </div>
          </div>

          {/* 12. Busiest Hour */}
          <div className="grid-card">
            <div className="card-icon">
              <TimeIcon style={{ color: CHART_COLORS.rose }} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('busiest_hour')}</span>
              <span className="card-value" style={{ color: CHART_COLORS.rose }}>
                {stats.busiestHour ? stats.busiestHour.label : '-'}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Charts Row: Trend and Activity */}
      <motion.section
        className="charts-summary-section"
        variants={itemVariants}
      >
        {/* 1. Monthly Trend (Posts) */}
        <div className="chart-wrapper">
          <div className="chart-header-compact">
            <div className="header-icon-title">
              <LineChartIcon />
              <span className="header-title">{t('trend_title')}</span>
            </div>
            <div className="header-stat">
              {formatNumber(stats.totalPosts)}{' '}
              <span className="stat-unit">Posts</span>
            </div>
          </div>
          <div className="trend-mini-chart">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart
                data={stats.monthlyPosts}
                margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
              >
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={!isExport} // Disable animation for export
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={{ color: CHART_COLORS.slate, marginBottom: '2px' }}
                  itemStyle={{ color: CHART_COLORS.purple, fontWeight: 'bold' }}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.name;
                    }
                    return value;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Activity Rhythm (Hourly) */}
        <div className="chart-wrapper">
          <div className="chart-header-compact">
            <div className="header-icon-title">
              <TimeIcon />
              <span className="header-title">{t('activity_rhythm')}</span>
            </div>
            <div className="header-stat">
              {stats.busiestHour ? stats.busiestHour.label : '-'}{' '}
              <span className="stat-unit">Peak</span>
            </div>
          </div>
          <div className="trend-mini-chart">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart
                data={stats.hourlyPosts}
                margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
              >
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0ea5e9"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={!isExport} // Disable animation for export
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={{ color: CHART_COLORS.slate }}
                  itemStyle={{ color: CHART_COLORS.sky, fontWeight: 'bold' }}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.label;
                    }
                    return value;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>

      <motion.section className="distribution-section" variants={itemVariants}>
        <div className="chart-wrapper">
          <div className="chart-header-compact">
            <div className="header-icon-title">
              <PieChartIcon />
              <span className="header-title">{t('distribution_title')}</span>
            </div>
          </div>

          <div className="distribution-stacked-bar">
            {(() => {
              // Calculate total for percentages
              const total =
                stats.contentDistribution.reduce(
                  (acc, curr) => acc + curr.value,
                  0
                ) || 1;

              return (
                <>
                  <div className="stacked-bar-container">
                    {stats.contentDistribution.map((item, idx) => {
                      const pct = ((item.value / total) * 100).toFixed(1);
                      return (
                        <div
                          key={idx}
                          className="stacked-segment"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="stacked-legend">
                    {stats.contentDistribution.map((item, idx) => {
                      const pct = ((item.value / total) * 100).toFixed(0);
                      return (
                        <div key={idx} className="legend-item">
                          <span className="legend-meta">
                            <span
                              className="legend-dot"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="legend-text">{item.name}</span>
                          </span>
                          <span className="legend-value">
                            {item.value} / {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </motion.section>

      {/* Calendar Heatmap */}
      <motion.section className="chart-section" variants={itemVariants}>
        <div className="chart-card glass-card">
          <ActivityHeatmap
            activityCalendar={stats.activityCalendar}
            year={stats.year}
            t={t}
          />
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer className="stats-footer" variants={itemVariants}>
        <p className="footer-note">
          Mastodon Wrapped • {t('generated_at')}{' '}
          {new Date().toLocaleDateString()}
        </p>
      </motion.footer>
    </motion.div>
  );
}
