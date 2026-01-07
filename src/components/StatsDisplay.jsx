import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { downloadReportAsImage } from "../utils/imageDownloader";
import { ArrowUpIcon } from "./ui/icons";
import "./StatsDisplay.css";
import StatsReport from "./StatsReport";

export default function StatsDisplay({
  stats,
  onReset,
  t,
  availableYears = [],
  timezoneMode = "local",
  onYearChange,
  onTimezoneChange,
}) {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Refs for safe async operations
  const isMountedRef = useRef(true);
  const downloadLockRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Early return after hooks to comply with Rules of Hooks
  if (!stats) return null;

  const formatUtcOffset = (offsetMinutes) => {
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `UTC${sign}${hh}:${mm}`;
  };

  const localOffsetMinutes = -new Date().getTimezoneOffset();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDownload = async () => {
    // Synchronous lock to prevent race conditions
    if (downloadLockRef.current) return;
    downloadLockRef.current = true;

    // 1. Start Export Mode: Renders the hidden "Ghost" component
    setIsExporting(true);
    setIsDownloading(true);

    try {
      // 2. Wait for Recharts to render in the new 900px container
      // Since isExport disables animations, we only need minimal layout time
      await new Promise((resolve) => setTimeout(resolve, 150));

      const year = new Date().getFullYear();
      const filename = `mastodon-wrapped-${stats.account.acct}-${year}.png`;

      // 3. Capture the Ghost Component (ID: "export-stats-container")
      await downloadReportAsImage("export-stats-container", filename);
    } catch (e) {
      console.error(e);
      if (isMountedRef.current) {
        alert(t("error_download"));
      }
    } finally {
      downloadLockRef.current = false;
      setIsDownloading(false);
      setIsExporting(false);
    }
  };

  return (
    <div className="relative stats-display">
      <div className="bg-gradient"></div>
      <div className="bg-glow"></div>

      {/* Main Visible Report */}
      <StatsReport
        stats={stats}
        t={t}
        availableYears={availableYears}
        timezoneMode={timezoneMode}
        onReset={onReset}
        onDownload={handleDownload}
        isDownloading={isDownloading || isExporting}
        onYearChange={onYearChange}
        onTimezoneChange={onTimezoneChange}
        formatUtcOffset={formatUtcOffset}
        localOffsetMinutes={localOffsetMinutes}
        showControls={true}
      />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, bottom: 20 }}
            animate={{ opacity: 1, bottom: 40 }}
            exit={{ opacity: 0, bottom: 20 }}
            className="fixed z-50 rounded-full shadow-lg right-8 back-to-top-btn"
            aria-label="Back to top"
          >
            <ArrowUpIcon className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* GHOST COMPONENT FOR EXPORTING 
          This is strictly 900x1200 and hidden from view. 
          Recharts will render correctly here because the parent width is fixed. 
      */}
      {isExporting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "-9999px",
            width: "900px",
            height: "auto",
            zIndex: -1,
            background: "white",
          }}
        >
          <StatsReport
            containerId="export-stats-container"
            className="force-desktop" // Force desktop Layout via CSS overrides
            stats={stats}
            t={t}
            availableYears={availableYears}
            timezoneMode={timezoneMode}
            onReset={() => {}} // No-ops for ghost
            onDownload={() => {}}
            isDownloading={false}
            onYearChange={() => {}}
            onTimezoneChange={() => {}}
            formatUtcOffset={formatUtcOffset}
            localOffsetMinutes={localOffsetMinutes}
            showControls={false} // Hide buttons in the export
            isExport={true} // Enable static rendering (no-animation)
          />
        </div>
      )}
    </div>
  );
}
