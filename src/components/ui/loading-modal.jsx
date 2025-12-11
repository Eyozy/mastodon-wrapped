import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "./progress"
import { LoadingSpinner, LoadingPulse, CircularProgress } from "./loading-spinner"
import { cn } from "../../lib/utils"

export function LoadingModal({
  isOpen,
  progress = 0,
  message = "正在加载中...",
  showPercentage = true,
  showCircularProgress = false,
  steps = [],
  currentStep = -1,
  t
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            {/* Spinner */}
            <div className="mb-8">
              <LoadingSpinner size="xl" className="text-primary" />
            </div>

            {/* Title */}
            <motion.h2
              className="text-3xl font-bold text-slate-800 mb-6 text-center font-display tracking-wide leading-relaxed"
              key={message}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {message}
            </motion.h2>

            {/* Subtitle */}
            <p className="text-slate-400 mb-24 text-center text-base font-medium tracking-wider">
              {t ? t('analyzing') : '正在全方位分析你的年度数据...'}
            </p>

            {/* Linear Progress Bar with Left Data */}
            <div className="w-full mb-8 flex items-center space-x-8">
               <span className="text-3xl font-bold text-slate-700 min-w-[4rem] text-right font-display">
                {progress.toFixed(0)}%
              </span>
              <div className="flex-1 relative">
                <Progress value={progress} className="h-5 bg-slate-100 rounded-full" indicatorClassName="bg-indigo-500 rounded-full shadow-lg shadow-indigo-200" />
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-medium mt-4">
              {t ? t('local_processing') : '数据仅在本地浏览器处理'}
            </p>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function InlineLoading({
  progress = 0,
  message = "正在加载...",
  size = "sm",
  className
}) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <LoadingSpinner size={size} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{message}</p>
        <Progress value={progress} className="h-1 mt-1" />
      </div>
      <span className="text-xs text-gray-500 font-medium">
        {progress.toFixed(0)}%
      </span>
    </div>
  )
}