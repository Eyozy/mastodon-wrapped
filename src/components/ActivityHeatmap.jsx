import React, { useState, useCallback, useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./ActivityHeatmap.css";

// Unified color configuration - single source of truth for heatmap colors
const HEATMAP_LEVELS = [
  { min: 10, className: "color-scale-4", fill: "#1d4ed8", stroke: "#1e40af", title: "10+" },
  { min: 7, className: "color-scale-3", fill: "#2563eb", stroke: "#1d4ed8", title: "7-9" },
  { min: 4, className: "color-scale-2", fill: "#60a5fa", stroke: "#3b82f6", title: "4-6" },
  { min: 1, className: "color-scale-1", fill: "#93c5fd", stroke: "#60a5fa", title: "1-3" },
  { min: 0, className: "color-empty", fill: "#f8fafc", stroke: "#e2e8f0", title: "0" },
];

// Get color config based on count - pure function
const getColorConfig = (count) => {
  if (!count || count === 0) return HEATMAP_LEVELS[HEATMAP_LEVELS.length - 1];
  return HEATMAP_LEVELS.find((level) => count >= level.min) || HEATMAP_LEVELS[HEATMAP_LEVELS.length - 1];
};

function parseLocalDateFromYmd(dateStr) {
  // Avoid `new Date("YYYY-MM-DD")` (Safari/WebView parsing + UTC offset issues).
  const [y, m, d] = String(dateStr || "").split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  // Use noon as an anchor to avoid DST-midnight millisecond drift in some timezones.
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * ActivityHeatmap - Calendar heatmap displaying user's activity throughout the year
 * @param {Object} props
 * @param {Object} props.activityCalendar - Mapping object from date to post count
 * @param {number} props.year - The year to display
 */
export default function ActivityHeatmap({ activityCalendar, year, t }) {
  const [hoveredData, setHoveredData] = useState(null);

  // Convert data format to react-calendar-heatmap required format
  const heatmapData = useMemo(() =>
    Object.entries(activityCalendar || {})
      .map(([dateStr, count]) => {
        const date = parseLocalDateFromYmd(dateStr);
        if (!date) return null;
        return {
          date, // Use Date objects for consistent parsing across browsers
          dateStr, // Preserve original string for UI/tooltip
          count,
        };
      })
      .filter(Boolean),
    [activityCalendar]
  );

  // react-calendar-heatmap's `numDays` prop is deprecated; use `startDate` instead.
  // To avoid off-by-one range issues in this library version, we set startDate to the day
  // before Jan 1, so the rendered range starts on Jan 1 for the target year.
  const startDate = useMemo(() => new Date(year - 1, 11, 31, 12, 0, 0, 0), [year]);
  const endDate = useMemo(() => new Date(year, 11, 31, 12, 0, 0, 0), [year]);

  // Custom tooltip content - memoized to avoid recreation
  const getTooltipDataAttrs = useCallback((value) => {
    if (!value || !value.date) {
      return { title: t ? t("no_data") : "无数据" };
    }
    return {
      title: `${value.dateStr || value.date}: ${value.count} ${
        t ? t("toots") : "条嘟文"
      }`,
    };
  }, [t]);

  // Determine color class based on post count - uses unified config
  const getClassForValue = useCallback((value) => {
    return getColorConfig(value?.count).className;
  }, []);

  // Optimize performance - inlines color logic using unified config
  const transformDayElement = useCallback((element, value) => {
    const config = getColorConfig(value?.count);

    return React.cloneElement(element, {
      className: element.props.className || "",
      fill: config.fill,
      stroke: config.stroke,
      strokeWidth: 1,
      rx: 2,
      ry: 2,
      style: {
        fill: config.fill,
        stroke: config.stroke,
        strokeWidth: 1,
        rx: 2,
        ry: 2,
        outline: "none",
      },
    });
  }, []);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleMouseOver = useCallback((event, value) => setHoveredData(value), []);
  const handleMouseLeave = useCallback(() => setHoveredData(null), []);

  return (
    <div className="activity-heatmap-container">
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={heatmapData}
        classForValue={getClassForValue}
        tooltipDataAttrs={getTooltipDataAttrs}
        showWeekdayLabels={true}
        showMonthLabels={true}
        gutterSize={3}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        transformDayElement={transformDayElement}
      />

      {/* Interactive data display - replaces native Tooltip - Fixed height to prevent flicker */}
      <div
        className="heatmap-hover-text"
        style={{
          height: "24px",
          textAlign: "center",
          marginTop: "8px",
          marginBottom: "0px",
          fontSize: "13px",
          fontWeight: "500",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hoveredData && (hoveredData.dateStr || hoveredData.date) ? (
          <span>
            {hoveredData.dateStr || hoveredData.date}:{" "}
            <span style={{ color: "#3b82f6", fontWeight: "bold" }}>
              {hoveredData.count}
            </span>{" "}
            {t ? t("toots") : "条嘟文"}
          </span>
        ) : (
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
            {t ? t("heatmap_hover") : "Hover to view details"}
          </span>
        )}
      </div>

      {/* Legend - uses unified color config */}
      <div className="heatmap-legend">
        <span className="legend-label">{t ? t("legend_less") : "Less"}</span>
        <div className="legend-scale">
          {/* Render legend boxes in reverse order (empty to full) */}
          {[...HEATMAP_LEVELS].reverse().map((level) => (
            <div
              key={level.className}
              className="legend-box"
              style={{ backgroundColor: level.fill, borderColor: level.stroke }}
              title={level.title}
            />
          ))}
        </div>
        <span className="legend-label">{t ? t("legend_more") : "More"}</span>
      </div>
    </div>
  );
}
