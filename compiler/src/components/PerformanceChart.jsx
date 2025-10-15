import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, BarChart3, LineChart, PieChart,
  Activity, Target, Award, Zap, Clock, Star, ArrowUp, ArrowDown,
  Calendar, Filter, Download, RefreshCw, Maximize2, Minimize2
} from 'lucide-react';

const PerformanceChart = ({ 
  data, 
  type = 'line', 
  title, 
  timeRange = '7d',
  onTimeRangeChange,
  className = '',
  height = 300,
  showControls = true,
  interactive = true
}) => {
  const [chartData, setChartData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  const timeRangeOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const metricOptions = [
    { value: 'overall', label: 'Overall Performance', color: '#3B82F6' },
    { value: 'accuracy', label: 'Accuracy', color: '#10B981' },
    { value: 'speed', label: 'Speed', color: '#F59E0B' },
    { value: 'consistency', label: 'Consistency', color: '#8B5CF6' },
    { value: 'efficiency', label: 'Learning Efficiency', color: '#EF4444' }
  ];

  // Mock performance data generator
  const generateMockData = (metric, range) => {
    const points = range === '24h' ? 24 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const baseValue = metric === 'accuracy' ? 85 : metric === 'speed' ? 75 : metric === 'consistency' ? 80 : metric === 'efficiency' ? 70 : 78;
    
    return Array.from({ length: points }, (_, i) => ({
      x: i,
      y: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * 20 + Math.sin(i / points * Math.PI * 2) * 10)),
      label: range === '24h' ? `${i}:00` : range === '7d' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `Day ${i + 1}`,
      date: new Date(Date.now() - (points - i) * (range === '24h' ? 3600000 : 86400000))
    }));
  };

  useEffect(() => {
    if (!data) {
      setChartData(generateMockData(selectedMetric, timeRange));
    } else {
      setChartData(data);
    }
  }, [data, selectedMetric, timeRange]);

  // Advanced line chart renderer
  const renderLineChart = () => {
    if (!chartData || chartData.length === 0) return null;

    const padding = 40;
    const width = chartRef.current?.clientWidth || 400;
    const chartHeight = height - 80;
    const chartWidth = width - padding * 2;

    const maxY = Math.max(...chartData.map(d => d.y));
    const minY = Math.min(...chartData.map(d => d.y));
    const yRange = maxY - minY || 1;

    const points = chartData.map((point, index) => ({
      x: padding + (index / (chartData.length - 1)) * chartWidth,
      y: padding + ((maxY - point.y) / yRange) * chartHeight,
      data: point
    }));

    // Create gradient path
    const pathData = points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      const prevPoint = points[index - 1];
      const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.4;
      const cp1y = prevPoint.y;
      const cp2x = prevPoint.x + (point.x - prevPoint.x) * 0.6;
      const cp2y = point.y;
      return `${path} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${point.x} ${point.y}`;
    }, '');

    const areaPath = `${pathData} L ${points[points.length - 1].x} ${height - 40} L ${padding} ${height - 40} Z`;

    const selectedColor = metricOptions.find(m => m.value === selectedMetric)?.color || '#3B82F6';

    return (
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {/* Grid lines */}
        <defs>
          <linearGradient id={`gradient-${selectedMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={selectedColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={selectedColor} stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map(value => {
          const y = padding + ((maxY - value) / yRange) * chartHeight;
          return (
            <g key={value}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fill="rgba(255,255,255,0.6)"
                fontSize="12"
                textAnchor="end"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#gradient-${selectedMetric})`}
          opacity="0.6"
        />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke={selectedColor}
          strokeWidth="3"
          filter="url(#glow)"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={selectedColor}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200 hover:r-8"
              onMouseEnter={() => setHoveredPoint({ ...point, index })}
              style={{
                filter: hoveredPoint?.index === index ? 'url(#glow)' : 'none'
              }}
            />
            
            {/* Tooltip */}
            {hoveredPoint?.index === index && (
              <foreignObject
                x={point.x - 50}
                y={point.y - 60}
                width="100"
                height="50"
                className="pointer-events-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800 text-white p-2 rounded-lg shadow-lg text-center border border-gray-600"
                >
                  <div className="text-xs text-gray-300">{point.data.label}</div>
                  <div className="text-sm font-bold">{point.data.y.toFixed(1)}%</div>
                </motion.div>
              </foreignObject>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 6)) === 0).map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 20}
            fill="rgba(255,255,255,0.6)"
            fontSize="12"
            textAnchor="middle"
          >
            {point.data.label}
          </text>
        ))}
      </svg>
    );
  };

  // Bar chart renderer
  const renderBarChart = () => {
    if (!chartData || chartData.length === 0) return null;

    const padding = 40;
    const width = chartRef.current?.clientWidth || 400;
    const chartHeight = height - 80;
    const chartWidth = width - padding * 2;

    const maxY = Math.max(...chartData.map(d => d.y));
    const barWidth = chartWidth / chartData.length * 0.8;
    const barSpacing = chartWidth / chartData.length * 0.2;

    const selectedColor = metricOptions.find(m => m.value === selectedMetric)?.color || '#3B82F6';

    return (
      <svg width="100%" height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(value => {
          const y = padding + ((100 - value) / 100) * chartHeight;
          return (
            <g key={value}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fill="rgba(255,255,255,0.6)"
                fontSize="12"
                textAnchor="end"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {chartData.map((point, index) => {
          const x = padding + index * (chartWidth / chartData.length) + barSpacing / 2;
          const barHeight = (point.y / 100) * chartHeight;
          const y = padding + chartHeight - barHeight;

          return (
            <g key={index}>
              <motion.rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={selectedColor}
                opacity="0.8"
                rx="4"
                className="cursor-pointer"
                whileHover={{ opacity: 1, scale: 1.05 }}
                onMouseEnter={() => setHoveredPoint({ x, y, data: point, index })}
                onMouseLeave={() => setHoveredPoint(null)}
                initial={{ height: 0, y: padding + chartHeight }}
                animate={{ height: barHeight, y }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
              
              {/* Value labels */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                className="font-semibold"
              >
                {point.y.toFixed(0)}%
              </text>

              {/* X-axis labels */}
              <text
                x={x + barWidth / 2}
                y={height - 20}
                fill="rgba(255,255,255,0.6)"
                fontSize="12"
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Pie chart renderer for distribution data
  const renderPieChart = () => {
    if (!chartData || chartData.length === 0) return null;

    const centerX = (chartRef.current?.clientWidth || 400) / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    const total = chartData.reduce((sum, d) => sum + d.y, 0);
    let currentAngle = -Math.PI / 2;

    return (
      <svg width="100%" height={height} className="overflow-visible">
        {chartData.map((point, index) => {
          const sliceAngle = (point.y / total) * 2 * Math.PI;
          const endAngle = currentAngle + sliceAngle;
          
          const x1 = centerX + Math.cos(currentAngle) * radius;
          const y1 = centerY + Math.sin(currentAngle) * radius;
          const x2 = centerX + Math.cos(endAngle) * radius;
          const y2 = centerY + Math.sin(endAngle) * radius;
          
          const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          const color = metricOptions[index % metricOptions.length]?.color || '#3B82F6';
          
          // Label position
          const labelAngle = currentAngle + sliceAngle / 2;
          const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
          const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

          currentAngle = endAngle;

          return (
            <g key={index}>
              <motion.path
                d={pathData}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer"
                whileHover={{ opacity: 0.8 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              />
              
              {/* Percentage labels */}
              {point.y / total > 0.05 && (
                <text
                  x={labelX}
                  y={labelY}
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                  className="font-semibold pointer-events-none"
                >
                  {((point.y / total) * 100).toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
        
        {/* Center circle with total */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.3}
          fill="rgba(0,0,0,0.8)"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY - 5}
          fill="white"
          fontSize="14"
          textAnchor="middle"
          className="font-bold"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 15}
          fill="rgba(255,255,255,0.8)"
          fontSize="12"
          textAnchor="middle"
        >
          {total.toFixed(0)}
        </text>
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setChartData(generateMockData(selectedMetric, timeRange));
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exportChart = () => {
    // Export functionality would be implemented here
    console.log('Exporting chart data:', chartData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            {type === 'line' && <LineChart className="h-5 w-5 text-blue-400" />}
            {type === 'bar' && <BarChart3 className="h-5 w-5 text-blue-400" />}
            {type === 'pie' && <PieChart className="h-5 w-5 text-blue-400" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title || 'Performance Chart'}</h3>
            <p className="text-sm text-gray-400">
              {chartData?.length || 0} data points • Last updated just now
            </p>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <motion.button
              onClick={exportChart}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </motion.button>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between p-4 bg-gray-700/50 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Metric selector */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {metricOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time range selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => {
                  const newRange = e.target.value;
                  onTimeRangeChange?.(newRange);
                  setChartData(generateMockData(selectedMetric, newRange));
                }}
                className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Performance indicators */}
          <div className="flex items-center space-x-4 text-sm">
            {chartData?.length > 1 && (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Avg: {(chartData.reduce((sum, d) => sum + d.y, 0) / chartData.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {chartData[chartData.length - 1]?.y > chartData[chartData.length - 2]?.y ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-300">
                    Trend: {chartData[chartData.length - 1]?.y > chartData[chartData.length - 2]?.y ? '+' : ''}
                    {(((chartData[chartData.length - 1]?.y || 0) - (chartData[chartData.length - 2]?.y || 0))).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chart Area */}
      <div 
        ref={chartRef} 
        className="relative bg-gray-900/50 p-4"
        style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}
      >
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-white">Updating chart...</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderChart()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      {type === 'pie' && chartData && (
        <div className="p-4 border-t border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {chartData.map((point, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metricOptions[index % metricOptions.length]?.color }}
                ></div>
                <span className="text-sm text-gray-300 truncate">{point.label}</span>
                <span className="text-sm text-white font-medium">{point.y.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PerformanceChart;