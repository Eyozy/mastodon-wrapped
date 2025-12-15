import { useState } from "react";
import { motion } from "framer-motion";
import { POPULAR_INSTANCES } from "../services/mastodonApi";
import { LoadingModal } from "./ui/loading-modal";
import { SparklingIcon, LockIcon } from "./ui/icons";
import "./LandingPage.css";

export default function LandingPage({
  onSubmit,
  isLoading,
  loadingMessage,
  error: errorProp,
  loadingProgress = 0,
  lang,
  t,
}) {
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!handle.trim()) {
      setError(t("error_empty"));
      return;
    }

    // Basic validation - should contain @
    if (!handle.includes("@")) {
      setError(t("error_invalid"));
      return;
    }

    setError("");
    onSubmit(handle.trim());
  };

  const handleQuickSelect = (instance) => {
    const username = handle.split("@")[0].replace("@", "");
    if (username) {
      setHandle(`${username}@${instance.name}`);
    }
  };

  return (
    <div className="landing-page">
      <div className="bg-gradient"></div>
      <div className="bg-glow"></div>

      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="landing-header">
          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Mastodon Wrapped
          </motion.h1>

          <motion.p
            className="subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t("subtitle", { year: currentYear })}
          </motion.p>
        </div>

        <motion.form
          className="search-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="input-wrapper">
            <span className="input-prefix">@</span>
            <input
              type="text"
              className="input handle-input"
              placeholder={t("placeholder")}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <p className="input-helper">{t("helper")}</p>

          {errorProp && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {errorProp}
            </motion.p>
          )}

          {error && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-small"></span>
                {loadingMessage || t("loading")}
              </>
            ) : (
              <>
                <SparklingIcon />
                {t("cta")}
              </>
            )}
          </button>
        </motion.form>

        <motion.div
          className="quick-instances"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="quick-label">{t("quick_instances")}</p>
          <div className="instance-buttons">
            {POPULAR_INSTANCES.slice(0, 4).map((instance) => (
              <button
                key={instance.name}
                type="button"
                className="btn-instance"
                onClick={() => handleQuickSelect(instance)}
                disabled={isLoading}
              >
                {instance.name}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="privacy-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <LockIcon /> {t("privacy")}
        </motion.p>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="landing-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>&copy; {t("footer_copyright", { year: currentYear })}</p>
        <p>
          {t("inspiration")}{" "}
          <a
            href="https://x.com/i/status/1998855377409159457"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-underline"
          >
            Kate Deyneka
          </a>
        </p>
      </motion.footer>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={isLoading}
        progress={loadingProgress}
        message={loadingMessage || t("fetching")}
        showPercentage={true}
        showCircularProgress={true}
        t={t}
      />
    </div>
  );
}
