import { useState } from 'react';
import LandingPage from './components/LandingPage';
import StatsDisplay from './components/StatsDisplay';
import { getUserData } from './services/mastodonApi';
import { analyzeStatuses } from './utils/dataAnalyzer';
import { getTranslation } from './utils/translations';
import './App.css';

function App() {
  const [lang, setLang] = useState('en');
  const [appState, setAppState] = useState('landing'); // landing, loading, stats, error
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps] = useState([]);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(-1);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const t = (key, params) => getTranslation(lang, key, params);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleFetchStats = async (handle) => {
    setAppState('loading'); 
    setCurrentLoadingStep(0);
    setLoadingMessage(t('fetching'));
    setLoadingProgress(5);
    setError('');

    try {
      // Step 1: Connect to instance
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentLoadingStep(1);
      setLoadingProgress(10);

      // Step 2: Fetch Data
      const data = await getUserData(handle, (msg) => {
        if (typeof msg === 'string') {
          setLoadingMessage(msg);
        } else if (typeof msg === 'number') {
          const progress = Math.min(20 + (msg / 10), 70);
          setLoadingProgress(progress);
          if (progress >= 40 && currentLoadingStep === 1) {
            setCurrentLoadingStep(2);
          }
        }
      }, lang);

      // Step 3: Analyze Data
      setCurrentLoadingStep(3);
      setLoadingMessage(t('analyzing'));
      setLoadingProgress(80);

      await new Promise(resolve => setTimeout(resolve, 500));

      const analysisCheck = analyzeStatuses(data.statuses, data.account, lang);

      if (!analysisCheck) {
        throw new Error(lang === 'zh' ? `未找到该用户在 ${new Date().getFullYear()} 年的公开嘟文。` : `No public toots found for ${new Date().getFullYear()}.`);
      }

      // Step 4: Generate report
      setCurrentLoadingStep(4);
      setLoadingMessage(t('analyzing'));
      setLoadingProgress(95);
      await new Promise(resolve => setTimeout(resolve, 300));

      setStats(analysisCheck);
      setLoadingProgress(100);

      // Step 5: Show Stats
      setTimeout(() => {
        setAppState('stats');
        setCurrentLoadingStep(-1);
      }, 500);

    } catch (err) {
      console.error(err);
      setError(err.message || (lang === 'zh' ? '获取数据时发生错误' : 'Error fetching data'));
      setAppState('landing');
      setCurrentLoadingStep(-1);
    }
  };

  const handleReset = () => {
    setAppState('landing');
    setStats(null);
    setError('');
    setLoadingProgress(0);
    setCurrentLoadingStep(-1);
    setLoadingMessage('');
  };

  return (
    <div className="app relative">
      <div className="language-switcher fixed top-4 right-4 z-50">
        <button 
          onClick={toggleLanguage}
          className="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-white hover:text-indigo-600 transition-all shadow-sm"
        >
          {lang === 'en' ? '中文' : 'English'}
        </button>
      </div>

      {appState !== 'stats' && (
        <LandingPage
          onSubmit={handleFetchStats}
          isLoading={appState === 'loading'}
          loadingMessage={loadingMessage}
          loadingProgress={loadingProgress}
          loadingSteps={loadingSteps} // We might ignore steps UI as user removed it visually
          currentLoadingStep={currentLoadingStep}
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
