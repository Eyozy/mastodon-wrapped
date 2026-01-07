import { Progress } from "./progress";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "../../lib/utils";
import "./loading-modal.css";

export function LoadingModal({
  isOpen,
  progress = 0,
  message = "Loading...",
  t,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="loading-modal-backdrop">
      <div className="loading-modal-content">
        {/* Spinner */}
        <div className="mb-8">
          <LoadingSpinner size="xl" className="text-primary" />
        </div>

        {/* Title */}
        <h2
          className="mb-6 text-3xl font-bold leading-relaxed tracking-wide text-center text-slate-800 font-display loading-modal-message"
          key={message}
        >
          {message}
        </h2>

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

        {/* Cancel Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 px-6 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {t ? t("cancel") : "取消"}
          </button>
        )}
      </div>
    </div>
  );
}


export function InlineLoading({
  progress = 0,
  message = "Loading...",
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
