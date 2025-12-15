import { useState, useRef, lazy, Suspense } from "react";
import { getUserData } from "./services/mastodonApi";
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

  // Ref to hold the current AbortController for request cancellation
  const abortControllerRef = useRef(null);

  const t = (key, params) => getTranslation(lang, key, params);
  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "zh" : "en"));

  const handleFetchStats = async (handle) => {
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoadingProgress(10);

      const data = await getUserData(
        handle,
        (msg) => {
          if (typeof msg === "string") {
            setLoadingMessage(msg);
          } else if (typeof msg === "number") {
            const progress = Math.min(10 + (msg / 50) * 0.65, 75);
            setLoadingProgress(Math.round(progress));
          }
        },
        lang,
        controller.signal
      );

      setLoadingMessage(t("analyzing"));
      setLoadingProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const analysisResult = analyzeStatuses(data.statuses, data.account, lang);
      if (!analysisResult) {
        throw new Error(
          lang === "zh"
            ? `未找到该用户在 ${new Date().getFullYear()} 年的公开嘟文。`
            : `No public toots found for ${new Date().getFullYear()}.`
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
      console.error(err);
      setError(
        err.message ||
          (lang === "zh" ? "获取数据时发生错误" : "Error fetching data")
      );
      setAppState("landing");
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
              lang={lang}
              t={t}
            />
          )}

          {appState === "stats" && stats && (
            <StatsDisplay
              stats={stats}
              onReset={handleReset}
              lang={lang}
              t={t}
            />
          )}
        </main>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
