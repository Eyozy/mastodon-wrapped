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

        {/* Core Stats Grid (3 Columns Desktop) */}
        <motion.section className="stats-grid-section" variants={itemVariants}>
          <div className="stats-grid-container">
            {/* 1. Impact Score / Rank */}
            <div className="grid-card impact-card-small">
              <div className="card-icon"><i className="ri-trophy-line"></i></div>
              <div className="card-content">
                <span className="card-label">{t('impact_score')}</span>
                <div className="card-value-row">
                  <span className="card-value highlight-text">{formatNumber(stats.socialImpactScore)}</span>
                  <span className="card-subtext">
                    {stats.socialImpactScore >= 10000 ? 'Top 1%' : 
                     stats.socialImpactScore >= 5000 ? 'Top 5%' : 
                     stats.socialImpactScore >= 1000 ? 'Top 15%' : 
                     stats.socialImpactScore >= 500 ? 'Top 30%' : 
                     stats.socialImpactScore >= 100 ? 'Top 50%' : 'Growing'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Chronotype (Night Owl etc) - Requested specifically */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-time-line" style={{color: '#8b5cf6'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('chronotype_label')}</span>
                <span className="card-value" style={{color: '#8b5cf6', fontSize: '1rem'}}>{stats.chronotype.name}</span>
              </div>
            </div>

            {/* 3. Persona */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-user-star-line" style={{color: '#f97316'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('persona_label')}</span>
                <span className="card-value" style={{color: '#f97316', fontSize: '1rem'}}>{stats.persona.name}</span>
              </div>
            </div>

            {/* 4. Total Posts */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-quill-pen-line" style={{color: '#3b82f6'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('total_posts')}</span>
                <span className="card-value" style={{color: '#3b82f6'}}>{formatNumber(stats.totalPosts)}</span>
              </div>
            </div>

            {/* 5. Originals */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-edit-line" style={{color: '#0ea5e9'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('original_posts')}</span>
                <span className="card-value" style={{color: '#0ea5e9'}}>{formatNumber(stats.originalPosts)}</span>
              </div>
            </div>

            {/* 6. Likes Received (Stars -> Likes) */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-heart-line" style={{color: '#ec4899'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('favorites_received').replace('Stars', 'Likes')}</span> 
                {/* Fallback if translation key is generic, usually 'favorites_received' maps to 'Favorites' or 'Likes' depending on locale */}
                <span className="card-value" style={{color: '#ec4899'}}>{formatNumber(stats.totalFavorites)}</span>
              </div>
            </div>

            {/* 7. Boosts Received (Reblogs) */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-repeat-line" style={{color: '#10b981'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('reblogs_received')}</span>
                <span className="card-value" style={{color: '#10b981'}}>{formatNumber(stats.totalReblogs)}</span>
              </div>
            </div>

             {/* 8. Longest Streak */}
             <div className="grid-card">
              <div className="card-icon"><i className="ri-fire-line" style={{color: '#f59e0b'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('longest_streak')}</span>
                <span className="card-value" style={{color: '#f59e0b'}}>{stats.longestStreak} {t('days')}</span>
              </div>
            </div>

            {/* 9. Average Likes per Post */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-star-smile-line" style={{color: '#f59e0b'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('avg_favorites')}</span>
                <span className="card-value" style={{color: '#f59e0b'}}>{stats.avgFavoritesPerPost || 0}</span>
              </div>
            </div>

            {/* 10. Most Active Month */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-calendar-line" style={{color: '#8b5cf6'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('most_active_month')}</span>
                <span className="card-value" style={{color: '#8b5cf6'}}>{stats.mostActiveMonth?.name || '-'}</span>
              </div>
            </div>

            {/* 11. Most Active Day */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-calendar-check-line" style={{color: '#06b6d4'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('most_active_day')}</span>
                <span className="card-value" style={{color: '#06b6d4'}}>{stats.mostActiveDay?.date || '-'}</span>
              </div>
            </div>

            {/* 12. Busiest Hour */}
            <div className="grid-card">
              <div className="card-icon"><i className="ri-time-line" style={{color: '#f43f5e'}}></i></div>
              <div className="card-content">
                <span className="card-label">{t('busiest_hour')}</span>
                <span className="card-value" style={{color: '#f43f5e'}}>{stats.busiestHour?.hour !== undefined ? `${stats.busiestHour.hour}:00` : '-'}</span>
              </div>
            </div>
            
          </div>
        </motion.section>

        {/* Charts Row: Trend, Activity, Distribution (3 Columns) */}
        <motion.section className="charts-summary-section" variants={itemVariants}>
           {/* 1. Monthly Trend (Posts) */}
           <div className="chart-wrapper">
              <div className="chart-header-compact">
                <div className="header-icon-title">
                  <i className="ri-line-chart-line"></i>
                  <span className="header-title">{t('trend_title')}</span>
                </div>
                <div className="header-stat">
                  {formatNumber(stats.totalPosts)} <span className="stat-unit">Posts</span>
                </div>
              </div>
              <div className="trend-mini-chart">
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={stats.monthlyPosts} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      dot={false}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                      labelStyle={{color: '#64748b', marginBottom:'2px'}}
                      itemStyle={{color: '#8b5cf6', fontWeight: 'bold'}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* 2. Activity Rhythm (Hourly) - NEW */}
           <div className="chart-wrapper">
              <div className="chart-header-compact">
                <div className="header-icon-title">
                  <i className="ri-time-line"></i>
                  <span className="header-title">{t ? t('activity_rhythm') : 'Activity'}</span>
                </div>
                <div className="header-stat">
                  {stats.busiestHour ? `${stats.busiestHour.label}` : '-'} <span className="stat-unit">Peak</span>
                </div>
              </div>
              <div className="trend-mini-chart">
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={stats.hourlyPosts} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="count" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorActivity)" />
                    <Tooltip 
                      contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                      labelStyle={{color: '#64748b'}}
                      itemStyle={{color: '#0ea5e9', fontWeight: 'bold'}}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* 3. Content Distribution */}
           <div className="chart-wrapper">
              <div className="chart-header-compact">
                <div className="header-icon-title">
                  <i className="ri-pie-chart-line"></i>
                  <span className="header-title">{t('distribution_title')}</span>
                </div>
              </div>
              
              <div className="distribution-stacked-bar">
                 {(() => {
                    // Calculate total for percentages
                    const total = stats.contentDistribution.reduce((acc, curr) => acc + curr.value, 0) || 1;
                    
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
                                    backgroundColor: item.color 
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
                                  <span className="legend-dot" style={{backgroundColor: item.color}}></span>
                                  <span className="legend-text">{item.name}: {item.value} ({pct}%)</span>
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
