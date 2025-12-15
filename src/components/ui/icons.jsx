/**
 * 内联 SVG 图标组件 - 替代 remixicon 字体图标
 * 使用 SVG 可以避免加载整个图标字体库，提升性能
 */

export function SparklingIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M14 4.438V2h-4v2.438a7.051 7.051 0 0 0-4.563 4.563H3v4h2.438A7.051 7.051 0 0 0 10 17.563V20h4v-2.438a7.051 7.051 0 0 0 4.563-4.563H21v-4h-2.438A7.051 7.051 0 0 0 14 4.437zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}

export function CheckIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M10 15.172l9.192-9.192 1.414 1.414L10 18 3.515 11.515l1.414-1.414z" />
    </svg>
  );
}

export function LockIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 0 1 14 0v1zM5 12v8h14v-8H5zm6 2h2v4h-2v-4zm6-4V9A5 5 0 0 0 7 9v1h10z" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" />
    </svg>
  );
}

export function DownloadIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515l1.414-1.414L11 13.172V2h2v11.172z" />
    </svg>
  );
}

export function LoaderIcon({ className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.364 5.636L16.95 7.05A7 7 0 1 0 19 12h2a9 9 0 1 1-2.636-6.364z" />
    </svg>
  );
}

export function ArrowUpIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414z" />
    </svg>
  );
}

export function TrophyIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M13 16.938V19h5v2H6v-2h5v-2.062A8.001 8.001 0 0 1 4 9V3h16v6a8.001 8.001 0 0 1-7 7.938zM6 5v4a6 6 0 0 0 12 0V5H6zM1 5h2v4H1V5zm20 0h2v4h-2V5z" />
    </svg>
  );
}

export function TimeIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z" />
    </svg>
  );
}

export function UserStarIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 14v8H4a8 8 0 0 1 8-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm9.446 7.032l1.504-1.504-2.12-2.12-1.505 1.504-1.504-1.504-2.12 2.121 1.503 1.503-1.504 1.504 2.121 2.12 1.504-1.503 1.504 1.504 2.12-2.12-1.503-1.505z" />
    </svg>
  );
}

export function QuillPenIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6.94 14.036c-.233.623-.448 1.271-.633 1.927.654-.18 1.3-.39 1.922-.622l-1.29-1.305zM20.71 4.63l-1.34-1.34a1 1 0 0 0-1.414 0L8.293 12.95l2.757 2.757 9.66-9.66a1 1 0 0 0 0-1.414zM2.816 18.407A18.1 18.1 0 0 1 5.07 11.89L8.172 15l-.021.021a18.1 18.1 0 0 1-6.52 2.254l1.185 1.131z" />
    </svg>
  );
}

export function EditIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
    </svg>
  );
}

export function HeartIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12.001 4.529a5.998 5.998 0 0 1 8.242.228 6 6 0 0 1 .236 8.236l-8.48 8.492-8.478-8.492a6 6 0 0 1 8.48-8.464z" />
    </svg>
  );
}

export function RepeatIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6 4h15a1 1 0 0 1 1 1v7h-2V6H6v3L1 5l5-4v3zm12 16H3a1 1 0 0 1-1-1v-7h2v6h14v-3l5 4-5 4v-3z" />
    </svg>
  );
}

export function FireIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" />
    </svg>
  );
}

export function StarSmileIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .5l2.942 6.454 7.058.625-5.25 4.781 1.54 6.89L12 15.375 5.71 19.25l1.54-6.89L2 7.58l7.058-.626L12 .5zM8.5 12a3.5 3.5 0 0 0 7 0h-7z" />
    </svg>
  );
}

export function CalendarIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z" />
    </svg>
  );
}

export function CalendarCheckIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M9 1v2h6V1h2v2h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2zm11 9H4v9h16v-9zm-4.964 1.136l1.414 1.414-4.95 4.95-3.536-3.536L9.38 12.55l2.121 2.122 3.536-3.536zM7 5H4v3h16V5h-3v1h-2V5H9v1H7V5z" />
    </svg>
  );
}

export function LineChartIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5 3v16h16v2H3V3h2zm15.293 3.293l1.414 1.414L16 13.414l-3-2.999-4.293 4.292-1.414-1.414L13 7.586l3 2.999 4.293-4.292z" />
    </svg>
  );
}

export function PieChartIcon({ className = "", style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M11 2.05V13h10.95c-.501 5.053-4.765 9-9.95 9-5.523 0-10-4.477-10-10 0-5.185 3.947-9.449 9-9.95zm2 0c4.724.47 8.48 4.227 8.95 8.95H13V2.05z" />
    </svg>
  );
}

export function MastodonIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.432 4.011.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H6.026V8.903c0-1.074.273-1.927.823-2.558.566-.631 1.307-.955 2.228-.955 1.065 0 1.872.409 2.405 1.228l.518.869.519-.869c.533-.819 1.34-1.228 2.405-1.228.92 0 1.662.324 2.228.955.549.631.822 1.484.822 2.558v5.253z" />
    </svg>
  );
}
