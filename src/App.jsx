import { useState, useRef, lazy, Suspense } from "react";
import {
  getUserData,
  getDefaultYear,
  lookupAccount,
  getAvailableYears,
  getAvailableYearsFromAccount,
  parseHandle,
} from "./services/mastodonApi";
import { analyzeStatuses } from "./utils/dataAnalyzer";
import { getTranslation } from "./utils/translations";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// Lazy load large components to improve initial page load performance
const LandingPage = lazy(() => import("./components/LandingPage"));
const StatsDisplay = lazy(() => import("./components/StatsDisplay"));

function App() {
  const detectLanguage = () => {
    const browserLang = navigator.language;
    return browserLang.startsWith("zh") ? "zh" : "en";
  };

  const [lang, setLang] = useState(detectLanguage());
  const [appState, setAppState] = useState("landing");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(getDefaultYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [timezoneMode, setTimezoneMode] = useState("local"); // 'local' | 'utc'
  const [currentHandle, setCurrentHandle] = useState("");

  // Ref to hold the current AbortController for request cancellation
  const abortControllerRef = useRef(null);

  const t = (key, params) => getTranslation(lang, key, params);
  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "zh" : "en"));

  const handleFetchStats = async (handle, yearOverride, timezoneOverride) => {
    const tz = timezoneOverride || timezoneMode;
    setTimezoneMode(tz);
    setCurrentHandle(handle);

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAppState("loading");
    setLoadingMessage(t("fetching"));
    setLoadingProgress(5);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoadingProgress(8);

      // First, look up the account and get available years
      const parsed = parseHandle(handle);
      if (!parsed) {
        throw new Error(
          lang === "zh"
            ? "请输入有效的 Mastodon 账户地址，格式：用户名@实例"
            : "Please enter a valid Mastodon handle, format: username@instance"
        );
      }

      const { username, instance } = parsed;
      const lookupMsg =
        lang === "zh" ? "正在查找用户..." : "Looking up user...";
      setLoadingMessage(lookupMsg);
      const account = await lookupAccount(
        instance,
        username,
        controller.signal
      );
      setLoadingProgress(12);

      // Get years from account registration date (fallback to recent-post inference if unavailable)
      let yearsInfo = null;
      if (account?.created_at) {
        yearsInfo = getAvailableYearsFromAccount(account);
      } else {
        yearsInfo = await getAvailableYears(instance, account.id, controller.signal);
      }

      const { years, defaultYear } = yearsInfo;
      setAvailableYears(years);
      setLoadingProgress(15);

      // Use yearOverride if provided, otherwise use auto-detected defaultYear
      const targetYear =
        yearOverride !== undefined ? yearOverride : defaultYear;
      setSelectedYear(targetYear);

      const data = await getUserData(
        handle,
        (msg) => {
          if (typeof msg === "string") {
            setLoadingMessage(msg);
          } else if (typeof msg === "number") {
            const progress = Math.min(15 + (msg / 50) * 0.6, 75);
            setLoadingProgress(Math.round(progress));
          }
        },
        lang,
        controller.signal,
        targetYear,
        tz
      );

      setLoadingMessage(t("analyzing"));
      setLoadingProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const analysisResult = analyzeStatuses(
        data.statuses,
        data.account,
        lang,
        targetYear,
        tz
      );
      if (!analysisResult) {
        throw new Error(
          lang === "zh"
            ? `未找到该用户在 ${targetYear} 年的公开嘟文。`
            : `No public toots found for ${targetYear}.`
        );
      }

      setLoadingProgress(95);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setStats(analysisResult);
      setLoadingProgress(100);

      setTimeout(() => setAppState("stats"), 500);
    } catch (err) {
      // Ignore abort errors - they're intentional cancellations
      if (err.name === "AbortError") {
        return;
      }

      setError(
        err.message ||
          (lang === "zh" ? "获取数据时发生错误" : "Error fetching data")
      );
      setAppState("landing");
    } finally {
      // Clean up abort controller reference for this specific request
      // This ensures proper cleanup whether the request completed, failed, or was aborted
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  // Safely extract handle from stats for year/timezone switching
  const getHandleFromStats = () => {
    if (currentHandle) return currentHandle;
    if (!stats?.account) return "";
    try {
      const url = new URL(stats.account.url);
      return `${stats.account.acct}@${url.hostname}`;
    } catch {
      // Fallback to split method if URL parsing fails
      const hostPart = stats.account.url?.split("/")[2];
      return hostPart ? `${stats.account.acct}@${hostPart}` : "";
    }
  };

  const handleReset = () => {
    setAppState("landing");
    setStats(null);
    setError("");
    setLoadingProgress(0);
    setLoadingMessage("");
  };

  return (
    <ErrorBoundary lang={lang}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="animate-pulse text-slate-400">Loading...</div>
          </div>
        }
      >
        <main className="relative app">
          {appState === "landing" && (
            <div className="fixed z-50 language-switcher top-4 right-4">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 text-sm font-medium transition-all border rounded-full shadow-sm bg-white/80 backdrop-blur-sm border-slate-200 text-slate-600 hover:bg-white hover:text-indigo-600"
                aria-label={lang === "en" ? "Switch to Chinese" : "切换到英文"}
              >
                {lang === "en" ? "中文" : "English"}
              </button>
            </div>
          )}

          {appState !== "stats" && (
            <LandingPage
              onSubmit={handleFetchStats}
              isLoading={appState === "loading"}
              loadingMessage={loadingMessage}
              loadingProgress={loadingProgress}
              error={appState === "landing" ? error : ""}
              t={t}
            />
          )}

          {appState === "stats" && stats && (
            <StatsDisplay
              stats={stats}
              onReset={handleReset}
              t={t}
              availableYears={availableYears}
              timezoneMode={timezoneMode}
              onYearChange={(year) =>
                handleFetchStats(getHandleFromStats(), year, timezoneMode)
              }
              onTimezoneChange={(tz) =>
                handleFetchStats(getHandleFromStats(), selectedYear, tz)
              }
            />
          )}
        </main>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
