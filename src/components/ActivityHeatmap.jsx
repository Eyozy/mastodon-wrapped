import React, { useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './ActivityHeatmap.css';

/**
 * ActivityHeatmap - 显示用户全年活动的日历热力图
 * @param {Object} props
 * @param {Object} props.activityCalendar - 日期到发布数量的映射对象
 * @param {number} props.year - 年份
 */
export default function ActivityHeatmap({ activityCalendar, year, t }) {
  const [hoveredData, setHoveredData] = useState(null);

  // 转换数据格式为 react-calendar-heatmap 需要的格式
  const heatmapData = Object.entries(activityCalendar).map(([date, count]) => ({
    date,
    count
  }));

  // 设置日期范围：从年初到当前日期或年末
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // 自定义提示信息
  const getTooltipDataAttrs = (value) => {
    if (!value || !value.date) {
      return { 'title': t ? t('no_data') : '无数据' };
    }
    return {
      'title': `${value.date}: ${value.count} ${t ? t('toots') : '条嘟文'}`
    };
  };

  // 根据发布数量确定颜色等级
  const getClassForValue = (value) => {
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    if (value.count >= 10) {
      return 'color-scale-4';
    }
    if (value.count >= 7) {
      return 'color-scale-3';
    }
    if (value.count >= 4) {
      return 'color-scale-2';
    }
    return 'color-scale-1';
  };

  // Optimize performance to prevent flickering on hover
  const transformDayElement = React.useCallback((element, value, index) => {
    const className = getClassForValue(value);
    let color = '#e2e8f0';
    let stroke = '#cbd5e1';
    
    if (className === 'color-scale-1') { color = '#dbeafe'; stroke = '#bfdbfe'; }
    if (className === 'color-scale-2') { color = '#93c5fd'; stroke = '#60a5fa'; }
    if (className === 'color-scale-3') { color = '#3b82f6'; stroke = '#2563eb'; }
    if (className === 'color-scale-4') { color = '#1d4ed8'; stroke = '#1e40af'; }
    if (className === 'color-empty') { color = '#e2e8f0'; stroke = '#cbd5e1'; }
    
    return React.cloneElement(element, {
      style: { 
        fill: color, 
        stroke: stroke,
        strokeWidth: 1,
        rx: 2, 
        ry: 2,
        outline: 'none'
      }
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
      
      {/* 交互式数据展示 - 替代原生 Tooltip - Fixed height to prevent flicker */}
      <div className="heatmap-hover-text" style={{ 
        height: '24px', 
        textAlign: 'center', 
        marginTop: '8px', 
        marginBottom: '0px', 
        fontSize: '13px', 
        fontWeight: '500', 
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
         {hoveredData && hoveredData.date ? (
            <span>{hoveredData.date}: <span style={{color: '#3b82f6', fontWeight: 'bold'}}>{hoveredData.count}</span> {t ? t('toots') : '条嘟文'}</span>
         ) : (
            <span style={{color: '#94a3b8', fontSize: '12px'}}>{t ? t('heatmap_hover') : 'Hover to view details'}</span>
         )}
      </div>

      {/* 图例说明 */}
      <div className="heatmap-legend">
        <span className="legend-label">{t ? t('legend_less') : 'Less'}</span>
        <div className="legend-scale">
          <div className="legend-box" style={{backgroundColor: '#f1f5f9', borderColor: '#e2e8f0'}} title="0"></div>
          <div className="legend-box" style={{backgroundColor: '#dbeafe', borderColor: '#bfdbfe'}} title="1-3"></div>
          <div className="legend-box" style={{backgroundColor: '#93c5fd', borderColor: '#60a5fa'}} title="4-6"></div>
          <div className="legend-box" style={{backgroundColor: '#3b82f6', borderColor: '#2563eb'}} title="7-9"></div>
          <div className="legend-box" style={{backgroundColor: '#1d4ed8', borderColor: '#1e40af'}} title="10+"></div>
        </div>
        <span className="legend-label">{t ? t('legend_more') : 'More'}</span>
      </div>
    </div>
  );
}
