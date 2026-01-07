import { useState } from "react";
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
  t,
  onCancel,
}) {
  const footerYearRange = `2025 - ${new Date().getFullYear()}`;

  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");

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

      <div className="landing-content animate-fade-in-up">
        <div className="landing-header">
          <h1 className="title animate-fade-in-up delay-1">Mastodon Wrapped</h1>

          <p className="subtitle animate-fade-in-up delay-2">
            {t("subtitle_auto")}
          </p>
        </div>

        <form
          className="search-form animate-fade-in-up delay-3"
          onSubmit={handleSubmit}
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
            <p className="error-message animate-fade-in">{errorProp}</p>
          )}

          {error && <p className="error-message animate-fade-in">{error}</p>}

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
        </form>

        <div className="quick-instances animate-fade-in delay-4">
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
        </div>

        <p className="privacy-note animate-fade-in delay-5">
          <LockIcon /> {t("privacy")}
        </p>

        <div className="kofi-container animate-fade-in delay-6">
          <a
            href="https://ko-fi.com/Y8Y41QN96M"
            target="_blank"
            rel="noopener noreferrer"
            className="kofi-link"
            aria-label="Buy Me a Coffee on Ko-fi"
          >
            <img
              className="kofi-img"
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
              loading="lazy"
            />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer animate-fade-in delay-6">
        <p>
          &copy; {t("footer_copyright", { year: footerYearRange })}
        </p>
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
          {" "}
          <span className="footer-sep">·</span>{" "}
          <a
            href="https://github.com/Eyozy/mastodon-wrapped"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-underline"
          >
            GitHub
          </a>
        </p>
      </footer>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={isLoading}
        progress={loadingProgress}
        message={loadingMessage || t("fetching")}
        t={t}
        onCancel={onCancel}
      />
    </div>
  );
}
