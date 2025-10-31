import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { formatFileSize } from '../../utils/formatters';

/**
 * MetricCard component displays a single metric with icon, title, and value
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {number} props.value - Metric value to display
 * @param {string} props.icon - Bootstrap icon name (e.g., "file-earmark-text")
 * @param {string} props.variant - Bootstrap variant for color (primary, success, info, warning, danger)
 * @param {boolean} props.isStorage - If true, format value as file size
 * @param {boolean} props.loading - Show loading placeholder
 * @param {string} props.suffix - Optional suffix to append to value (e.g., "%")
 * @param {string} props.trend - Optional trend indicator (+/-/=)
 * @param {number} props.trendValue - Optional trend value to display
 */
const MetricCard = ({
  title,
  value,
  icon = 'info-circle',
  variant = 'primary',
  isStorage = false,
  loading = false,
  suffix = '',
  trend = null,
  trendValue = null,
}) => {
  // Get the icon component dynamically
  const IconComponent = Icons[icon.split('-').map((word, index) =>
    index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) :
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')] || Icons.InfoCircle;

  // Format the display value
  const getDisplayValue = () => {
    if (loading) {
      return null;
    }

    if (isStorage) {
      return formatFileSize(value);
    }

    // Format large numbers with commas
    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return value;
  };

  // Get trend icon and color
  const getTrendInfo = () => {
    if (!trend || trendValue === null) {
      return null;
    }

    let trendIcon;
    let trendColor;

    switch (trend) {
      case '+':
        trendIcon = <Icons.ArrowUp size={14} />;
        trendColor = 'text-success';
        break;
      case '-':
        trendIcon = <Icons.ArrowDown size={14} />;
        trendColor = 'text-danger';
        break;
      case '=':
        trendIcon = <Icons.Dash size={14} />;
        trendColor = 'text-muted';
        break;
      default:
        return null;
    }

    return (
      <small className={`ms-2 ${trendColor}`}>
        {trendIcon} {Math.abs(trendValue)}%
      </small>
    );
  };

  // Get card border color based on variant
  const getBorderClass = () => {
    return `border-${variant}`;
  };

  return (
    <Card className={`h-100 ${getBorderClass()}`} style={{ borderLeftWidth: '4px' }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className={`text-${variant}`}>
            <IconComponent size={32} />
          </div>
        </div>

        <div>
          <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {title}
          </h6>

          {loading ? (
            <Placeholder as="div" animation="glow">
              <Placeholder xs={6} size="lg" />
            </Placeholder>
          ) : (
            <div className="d-flex align-items-baseline">
              <h2 className="mb-0" style={{ fontWeight: 700 }}>
                {getDisplayValue()}{suffix}
              </h2>
              {getTrendInfo()}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MetricCard;
