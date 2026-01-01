import React, { useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./ActivityHeatmap.css";

/**
 * ActivityHeatmap - Calendar heatmap displaying user's activity throughout the year
 * @param {Object} props
 * @param {Object} props.activityCalendar - Mapping object from date to post count
 * @param {number} props.year - The year to display
 */
export default function ActivityHeatmap({ activityCalendar, year, t }) {
  const [hoveredData, setHoveredData] = useState(null);

  // Convert data format to react-calendar-heatmap required format
  // The library expects date as string "YYYY-MM-DD" format
  const heatmapData = Object.entries(activityCalendar || {}).map(
    ([dateStr, count]) => ({
      date: dateStr, // Keep as string "YYYY-MM-DD"
      count,
    })
  );

  // Set date range: use string format for consistency
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Custom tooltip content
  const getTooltipDataAttrs = (value) => {
    if (!value || !value.date) {
      return { title: t ? t("no_data") : "无数据" };
    }
    return {
      title: `${value.date}: ${value.count} ${t ? t("toots") : "条嘟文"}`,
    };
  };

  // Determine color level based on post count
  const getClassForValue = (value) => {
    if (!value || value.count === 0) {
      return "color-empty";
    }
    if (value.count >= 10) {
      return "color-scale-4";
    }
    if (value.count >= 7) {
      return "color-scale-3";
    }
    if (value.count >= 4) {
      return "color-scale-2";
    }
    return "color-scale-1";
  };

  // Optimize performance to prevent flickering on hover
  const transformDayElement = React.useCallback((element, value, index) => {
    const className = getClassForValue(value);
    let color = "#e2e8f0";
    let stroke = "#cbd5e1";

    if (className === "color-scale-1") {
      color = "#dbeafe";
      stroke = "#bfdbfe";
    }
    if (className === "color-scale-2") {
      color = "#93c5fd";
      stroke = "#60a5fa";
    }
    if (className === "color-scale-3") {
      color = "#3b82f6";
      stroke = "#2563eb";
    }
    if (className === "color-scale-4") {
      color = "#1d4ed8";
      stroke = "#1e40af";
    }
    if (className === "color-empty") {
      color = "#e2e8f0";
      stroke = "#cbd5e1";
    }

    return React.cloneElement(element, {
      className: element.props.className || "",
      fill: color,
      stroke: stroke,
      strokeWidth: 1,
      rx: 2,
      ry: 2,
      style: {
        fill: color,
        stroke: stroke,
        strokeWidth: 1,
        rx: 2,
        ry: 2,
        outline: "none",
      },
    });
  }, []);

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
        onMouseOver={(event, value) => setHoveredData(value)}
        onMouseLeave={() => setHoveredData(null)}
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
        {hoveredData && hoveredData.date ? (
          <span>
            {hoveredData.date}:{" "}
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

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-label">{t ? t("legend_less") : "Less"}</span>
        <div className="legend-scale">
          <div
            className="legend-box"
            style={{ backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" }}
            title="0"
          ></div>
          <div
            className="legend-box"
            style={{ backgroundColor: "#dbeafe", borderColor: "#bfdbfe" }}
            title="1-3"
          ></div>
          <div
            className="legend-box"
            style={{ backgroundColor: "#93c5fd", borderColor: "#60a5fa" }}
            title="4-6"
          ></div>
          <div
            className="legend-box"
            style={{ backgroundColor: "#3b82f6", borderColor: "#2563eb" }}
            title="7-9"
          ></div>
          <div
            className="legend-box"
            style={{ backgroundColor: "#1d4ed8", borderColor: "#1e40af" }}
            title="10+"
          ></div>
        </div>
        <span className="legend-label">{t ? t("legend_more") : "More"}</span>
      </div>
    </div>
  );
}
