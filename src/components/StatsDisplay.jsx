import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber, formatDate, stripHtml } from '../utils/dataAnalyzer';
import { downloadReportAsImage } from '../utils/imageDownloader';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import 'remixicon/fonts/remixicon.css';
import './StatsDisplay.css';
import ActivityHeatmap from './ActivityHeatmap';

export default function StatsDisplay({ stats, onReset, lang, t }) {
  if (!stats) return null;

  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const year = new Date().getFullYear();
      const filename = `mastodon-wrapped-${stats.account.acct}-${year}.png`;

      await downloadReportAsImage('stats-container', filename, (message) => {
        // You can add progress feedback here if needed
        console.log(message);
      });
    } catch (error) {
      console.error('Failed to download image:', error);
      alert(t('error_download'));
    } finally {
      setIsDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="stats-display relative">
      <div className="bg-gradient"></div>
      <div className="bg-glow"></div>

      <motion.div
        id="stats-container"
        className="stats-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with Back Button */}
        <motion.header className="stats-header" variants={itemVariants}>
          <button className="back-button" onClick={onReset} aria-label={t('back')}>
            <i className="ri-arrow-left-line"></i>
          </button>
          <button
            id="download-btn"
            className="download-button"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label={t('download_image')}
          >
            {isDownloading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>{t('downloading')}</span>
              </>
            ) : (
              <>
                <i className="ri-download-line"></i>
                <span>{t('download_image')}</span>
              </>
            )}
          </button>
          <div className="user-info">
            <img
              src={stats.account.avatar}
              alt={stats.account.display_name}
              className="user-avatar"
            />
            <div className="user-details">
              <h1 className="user-name">{stats.account.display_name || stats.account.username}</h1>
              <p className="user-handle">@{stats.account.acct}</p>
            </div>
          </div>
          <h2 className="stats-title">{t('report_title', { year: stats.year })}</h2>
        </motion.header>

        {/* Identity Section */}
        <motion.section className="identity-section" variants={itemVariants}>
          <div className="identity-card persona-card">
            <div className="identity-icon"><i className="ri-user-star-line"></i></div>
            <div className="identity-content">
              <span className="identity-label">{t('persona_label')}</span>
              <h3 className="identity-value">{stats.persona.name}</h3>
              <p className="identity-desc">{stats.persona.desc}</p>
            </div>
          </div>
          <div className="identity-card chronotype-card">
            <div className="identity-icon"><i className="ri-time-line"></i></div>
            <div className="identity-content">
              <span className="identity-label">{t('chronotype_label')}</span>
              <h3 className="identity-value">{stats.chronotype.name}</h3>
              <p className="identity-desc">{stats.chronotype.desc}</p>
            </div>
          </div>
        </motion.section>

        {/* Social Impact Score */}
        <motion.section className="impact-section" variants={itemVariants}>
          <div className="impact-card">
            <div className="impact-header">
              <i className="ri-trophy-line impact-icon"></i>
              <span>{t('impact_score')}</span>
            </div>
            <div className="impact-score">
              {formatNumber(stats.socialImpactScore)}
            </div>
            <div className="impact-breakdown">
              <span><i className="ri-repeat-line"></i> {t('impact_detail_reblog')}</span>
              <span><i className="ri-heart-line"></i> {t('impact_detail_fav')}</span>
              <span><i className="ri-file-text-line"></i> {t('impact_detail_post')}</span>
              <span><i className="ri-fire-line"></i> {t('impact_detail_streak')}</span>
            </div>
          </div>
        </motion.section>

        {/* Compact Stats Grid */}
        <motion.section className="compact-stats-section" variants={itemVariants}>
          <div className="compact-stats-grid">
            <div className="mini-stat-card">
              <span className="mini-label">{t('total_posts')}</span>
              <span className="mini-value">{formatNumber(stats.totalPosts)}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-label">{t('original_posts')}</span>
              <span className="mini-value">{formatNumber(stats.originalPosts)}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-label">{t('favorites_received')}</span>
              <span className="mini-value">{formatNumber(stats.totalFavorites)}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-label">{t('reblogs_received')}</span>
              <span className="mini-value">{formatNumber(stats.totalReblogs)}</span>
            </div>
             <div className="mini-stat-card">
              <span className="mini-label">{t('longest_streak')}</span>
              <span className="mini-value">{stats.longestStreak} {t('days')}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-label">{t('avg_favorites')}</span>
              <span className="mini-value">{stats.avgFavoritesPerPost}</span>
            </div>
          </div>
        </motion.section>

        {/* Charts Row 1 */}
        <div className="charts-row">
          <motion.section className="chart-section half-width" variants={itemVariants}>
            <h3 className="section-title"><i className="ri-line-chart-line"></i> {t('trend_title')}</h3>
            <div className="chart-card">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.monthlyPosts} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <XAxis dataKey="name" interval={0} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section className="chart-section half-width" variants={itemVariants}>
            <h3 className="section-title"><i className="ri-pie-chart-line"></i> {t('distribution_title')}</h3>
            <div className="chart-card">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.contentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        </div>

        {/* Chart Row 2: Activity Rhythm */}
        <motion.section className="chart-section" variants={itemVariants}>
          <h3 className="section-title"><i className="ri-pulse-line"></i> {t('rhythm_title')}</h3>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.hourlyPosts} margin={{ left: -20, right: 15, top: 10, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                    }}
                />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
             <div className="activity-highlights">
              <div className="highlight-item">
                <span className="highlight-label"><i className="ri-calendar-event-line"></i> {t('most_active_month')}</span>
                <span className="highlight-value">{stats.mostActiveMonth.name} ({stats.mostActiveMonth.count} {t('toots')})</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-label"><i className="ri-sun-line"></i> {t('most_active_day')}</span>
                <span className="highlight-value">{stats.mostActiveDay ? stats.mostActiveDay.date : '-'} ({stats.mostActiveDay ? stats.mostActiveDay.count : 0} {t('toots')})</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-label"><i className="ri-time-flash-line"></i> {t('busiest_hour')}</span>
                <span className="highlight-value">{stats.busiestHour.hour}:00 ({stats.busiestHour.count} {t('toots')})</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Calendar Heatmap */}
        <motion.section className="chart-section" variants={itemVariants}>
          <h3 className="section-title"><i className="ri-calendar-check-line"></i> {t('heatmap_title')}</h3>
          <div className="chart-card">
            <ActivityHeatmap
              activityCalendar={stats.activityCalendar}
              year={stats.year}
              t={t}
            />
          </div>
        </motion.section>

        {/* Top Toot */}
        {stats.topToot && (
          <motion.section className="top-toot-section" variants={itemVariants}>
            <h3 className="section-title"><i className="ri-award-line"></i> {t('top_toot_title')}</h3>
             <p className="text-xs text-slate-400 mb-8 mt-2 ml-1">
              {t('top_toot_calc')}
            </p>
            <div className="top-toot-card">
               <div className="quote-icon"><i className="ri-double-quotes-l"></i></div>
               <p className="top-toot-text">{stripHtml(stats.topToot.content)}</p>
               <div className="top-toot-stats">
                 <div className="stat-pill"><i className="ri-heart-fill" style={{color:'#ec4899'}}></i> {stats.topToot.favourites_count}</div>
                 <div className="stat-pill"><i className="ri-repeat-fill" style={{color:'#8b5cf6'}}></i> {stats.topToot.reblogs_count}</div>
                 <div className="stat-pill"><i className="ri-message-3-fill" style={{color:'#3b82f6'}}></i> {stats.topToot.replies_count}</div>
                 <div className="stat-date">{formatDate(stats.topToot.created_at, lang)}</div>
               </div>
            </div>
          </motion.section>
        )}

        {/* Top Hashtags */}
        {stats.topHashtags.length > 0 && (
          <motion.section className="hashtags-section mt-12" variants={itemVariants}>
            <h3 className="section-title"><i className="ri-hashtag"></i> {t('top_hashtags')}</h3>
            <div className="hashtags-grid mt-4">
              {stats.topHashtags.slice(0, 10).map((tag, index) => (
                <div key={tag.name} className="hashtag-item" style={{ '--index': index }}>
                  <span className="hashtag-name">#{tag.name}</span>
                  <span className="hashtag-count">{tag.count}</span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <motion.footer className="stats-footer" variants={itemVariants}>
          <p className="footer-note">
            {t('footer_copyright', { year: stats.year })} • {t('generated_at')} {new Date().toLocaleDateString()}
          </p>
        </motion.footer>
      </motion.div>

       {/* Back to Top Button */}
       <AnimatePresence>
        {showTopBtn && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, bottom: 20 }}
            animate={{ opacity: 1, bottom: 40 }}
            exit={{ opacity: 0, bottom: 20 }}
            className="fixed right-8 z-50 rounded-full shadow-lg back-to-top-btn"
            aria-label="Back to top"
          >
            <i className="ri-arrow-up-line text-xl"></i>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
