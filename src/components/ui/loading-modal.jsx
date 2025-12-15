import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./progress";
import {
  LoadingSpinner,
  LoadingPulse,
  CircularProgress,
} from "./loading-spinner";
import { cn } from "../../lib/utils";

export function LoadingModal({
  isOpen,
  progress = 0,
  message = "正在加载中...",
  showPercentage = true,
  showCircularProgress = false,
  steps = [],
  currentStep = -1,
  t,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-white"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center w-full max-w-md"
          >
            {/* Spinner */}
            <div className="mb-8">
              <LoadingSpinner size="xl" className="text-primary" />
            </div>

            {/* Title */}
            <motion.h2
              className="mb-6 text-3xl font-bold leading-relaxed tracking-wide text-center text-slate-800 font-display"
              key={message}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {message}
            </motion.h2>

            {/* Subtitle */}
            <p className="mb-24 text-base font-medium tracking-wider text-center text-slate-400">
              {t ? t("analyzing") : "正在全方位分析你的年度数据..."}
            </p>

            {/* Linear Progress Bar with Left Data */}
            <div className="flex items-center w-full mb-8 space-x-8">
              <span className="text-3xl font-bold text-slate-700 min-w-16 text-right font-display">
                {progress.toFixed(0)}%
              </span>
              <div className="relative flex-1">
                <Progress
                  value={progress}
                  className="h-5 rounded-full bg-slate-100"
                  indicatorClassName="bg-indigo-500 rounded-full shadow-lg shadow-indigo-200"
                />
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
              {t ? t("local_processing") : "数据仅在本地浏览器处理"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function InlineLoading({
  progress = 0,
  message = "正在加载...",
  size = "sm",
  className,
}) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <LoadingSpinner size={size} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{message}</p>
        <Progress value={progress} className="h-1 mt-1" />
      </div>
      <span className="text-xs font-medium text-gray-500">
        {progress.toFixed(0)}%
      </span>
    </div>
  );
}
