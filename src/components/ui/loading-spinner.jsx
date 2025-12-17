import { cn } from "../../lib/utils"
import "./loading-spinner.css"

export function LoadingSpinner({ className, size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent spinner-rotate" />
    </div>
  )
}

export function LoadingDots({ className }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-blue-600 rounded-full loading-dot"
          style={{ animationDelay: `${index * 0.2}s` }}
        />
      ))}
    </div>
  )
}

export function LoadingPulse({ className }) {
  return (
    <div className={cn("flex space-x-2", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-3 h-12 bg-blue-600 rounded-full loading-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  )
}

export function CircularProgress({ progress, size = 120, strokeWidth = 8, className }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-blue-600 circular-progress-animate"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}