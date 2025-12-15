import { motion } from "framer-motion";
import { MastodonIcon, CheckIcon } from "./ui/icons";
import "./LoadingScreen.css";

const loadingMessages = [
  "正在连接到 Mastodon 实例...",
  "正在获取你的嘟文...",
  "正在分析年度数据...",
  "正在生成统计报告...",
  "即将完成...",
];

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

      <motion.div
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

          <motion.div
            className="loading-logo"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <MastodonIcon />
          </motion.div>
        </div>

        <motion.p
          className="loading-message"
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message || "正在加载..."}
        </motion.p>

        {progress !== undefined && (
          <div className="loading-progress">
            <div className="progress-bar">
              <motion.div
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
      </motion.div>
    </div>
  );
}
