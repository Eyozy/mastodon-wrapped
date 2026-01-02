import { motion as Motion } from "framer-motion";
import { MastodonIcon, CheckIcon } from "./ui/icons";
import "./LoadingScreen.css";

export default function LoadingScreen({
  message,
  progress,
  loadingSteps = [],
  currentLoadingStep = -1,
}) {
  return (
    <div className="loading-screen">
      <div className="bg-gradient"></div>
      <div className="bg-glow"></div>

      <Motion.div
        className="loading-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="loading-animation">
          <div className="loading-ring">
            <div className="loading-ring-1"></div>
            <div className="loading-ring-2"></div>
            <div className="loading-ring-3"></div>
          </div>

          <Motion.div
            className="loading-logo"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <MastodonIcon />
          </Motion.div>
        </div>

        <Motion.p
          className="loading-message"
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message || "Loading..."}
        </Motion.p>

        {progress !== undefined && (
          <div className="loading-progress">
            <div className="progress-bar">
              <Motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {loadingSteps.length > 0 && (
          <div className="loading-steps">
            {loadingSteps.map((step, index) => (
              <div
                key={index}
                className={`step-item ${
                  index <= currentLoadingStep ? "active" : ""
                } ${index < currentLoadingStep ? "completed" : ""}`}
              >
                <div className="step-icon">
                  {index < currentLoadingStep ? (
                    <CheckIcon />
                  ) : index === currentLoadingStep ? (
                    <span className="step-dot"></span>
                  ) : (
                    <span className="step-dot-inactive"></span>
                  )}
                </div>
                <span className="step-label">{step}</span>
              </div>
            ))}
          </div>
        )}
      </Motion.div>
    </div>
  );
}
