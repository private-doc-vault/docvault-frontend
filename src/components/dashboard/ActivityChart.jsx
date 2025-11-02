import React, { useEffect, useState } from 'react';
import { Card, Alert, Placeholder } from 'react-bootstrap';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchActivityData,
  fetchUserActivityData,
  fetchStorageUsageTrend,
} from '../../api/dashboardApi';
import { formatFileSize } from '../../utils/formatters';

/**
 * ActivityChart component displays activity charts using Recharts
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {string} props.type - Chart type: 'documents', 'users', or 'storage'
 * @param {number} props.days - Number of days to display (default: 7 for documents/users, 30 for storage)
 * @param {string} props.chartType - Chart visualization type: 'line', 'bar', or 'area' (default: 'line')
 */
const ActivityChart = ({
  title,
  type = 'documents',
  days = null,
  chartType = 'line',
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine default days based on type
  const defaultDays = type === 'storage' ? 30 : 7;
  const daysToFetch = days !== null ? days : defaultDays;

  /**
   * Fetch chart data based on type
   */
  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      let chartData;

      switch (type) {
        case 'documents':
          chartData = await fetchActivityData(daysToFetch);
          break;
        case 'users':
          chartData = await fetchUserActivityData(daysToFetch);
          break;
        case 'storage':
          chartData = await fetchStorageUsageTrend(daysToFetch);
          break;
        default:
          throw new Error(`Unknown chart type: ${type}`);
      }

      setData(chartData);
    } catch (err) {
      console.error(`Error fetching ${type} chart data:`, err);
      setError(
        `Failed to load chart data. ${err.message || 'Please try again.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [type, daysToFetch]);

  /**
   * Get chart configuration based on type
   */
  const getChartConfig = () => {
    switch (type) {
      case 'documents':
        return {
          dataKey: 'count',
          color: '#0d6efd',
          label: 'Documents',
          yAxisLabel: 'Count',
        };
      case 'users':
        return {
          dataKey: 'activeUsers',
          color: '#0dcaf0',
          label: 'Active Users',
          yAxisLabel: 'Users',
        };
      case 'storage':
        return {
          dataKey: 'usage',
          color: '#ffc107',
          label: 'Storage',
          yAxisLabel: 'Storage (GB)',
          formatValue: (value) => formatFileSize(value),
        };
      default:
        return {
          dataKey: 'value',
          color: '#6c757d',
          label: 'Value',
          yAxisLabel: 'Value',
        };
    }
  };

  const config = getChartConfig();

  /**
   * Custom tooltip formatter
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const displayValue = config.formatValue
        ? config.formatValue(value)
        : value;

      return (
        <div
          className="bg-white border rounded p-2 shadow-sm"
          style={{ fontSize: '0.875rem' }}
        >
          <p className="mb-1 fw-semibold">{label}</p>
          <p className="mb-0" style={{ color: config.color }}>
            {config.label}: {displayValue}
          </p>
        </div>
      );
    }
    return null;
  };

  /**
   * Format Y-axis tick for storage
   */
  const formatYAxisTick = (value) => {
    if (type === 'storage') {
      // Convert bytes to GB for display
      const gb = value / (1024 * 1024 * 1024);
      return gb.toFixed(1);
    }
    return value;
  };

  /**
   * Render the appropriate chart type
   */
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey={config.dataKey}
              fill={config.color}
              name={config.label}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              fill={config.color}
              fillOpacity={0.3}
              name={config.label}
            />
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={config.label}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} style={{ height: '300px' }} />
          </Placeholder>
        ) : error ? (
          <Alert variant="warning" className="mb-0">
            {error}
          </Alert>
        ) : data.length === 0 ? (
          <div className="text-center text-muted py-5">
            <p>No data available for the selected period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default ActivityChart;
