import { useState } from 'react';
import LandingPage from './components/LandingPage';
import StatsDisplay from './components/StatsDisplay';
import { getUserData } from './services/mastodonApi';
import { analyzeStatuses } from './utils/dataAnalyzer';
import { getTranslation } from './utils/translations';
import './App.css';

function App() {
  const detectLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  };

  const [lang, setLang] = useState(detectLanguage());
  const [appState, setAppState] = useState('landing');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const t = (key, params) => getTranslation(lang, key, params);
  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const handleFetchStats = async (handle) => {
    setAppState('loading');
    setLoadingMessage(t('fetching'));
    setLoadingProgress(5);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingProgress(10);

      const data = await getUserData(handle, (msg) => {
        if (typeof msg === 'string') {
          setLoadingMessage(msg);
        } else if (typeof msg === 'number') {
          const progress = Math.min(10 + (msg / 50) * 0.65, 75);
          setLoadingProgress(Math.round(progress));
        }
      }, lang);

      setLoadingMessage(t('analyzing'));
      setLoadingProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      const analysisResult = analyzeStatuses(data.statuses, data.account, lang);
      if (!analysisResult) {
        throw new Error(lang === 'zh' 
          ? `未找到该用户在 ${new Date().getFullYear()} 年的公开嘟文。` 
          : `No public toots found for ${new Date().getFullYear()}.`);
      }

      setLoadingProgress(95);
      await new Promise(resolve => setTimeout(resolve, 300));

      setStats(analysisResult);
      setLoadingProgress(100);

      setTimeout(() => setAppState('stats'), 500);

    } catch (err) {
      console.error(err);
      setError(err.message || (lang === 'zh' ? '获取数据时发生错误' : 'Error fetching data'));
      setAppState('landing');
    }
  };

  const handleReset = () => {
    setAppState('landing');
    setStats(null);
    setError('');
    setLoadingProgress(0);
    setLoadingMessage('');
  };

  return (
    <div className="app relative">
      {appState === 'landing' && (
        <div className="language-switcher fixed top-4 right-4 z-50">
          <button 
            onClick={toggleLanguage}
            className="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-white hover:text-indigo-600 transition-all shadow-sm"
          >
            {lang === 'en' ? '中文' : 'English'}
          </button>
        </div>
      )}

      {appState !== 'stats' && (
        <LandingPage
          onSubmit={handleFetchStats}
          isLoading={appState === 'loading'}
          loadingMessage={loadingMessage}
          loadingProgress={loadingProgress}
          error={appState === 'landing' ? error : ''}
          lang={lang}
          t={t}
        />
      )}

      {appState === 'stats' && stats && (
        <StatsDisplay
          stats={stats}
          onReset={handleReset}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
}

export default App;
