# 📊 Analytics Dashboard - Complete Frontend Implementation Guide

## Overview
This guide provides complete, copy-paste ready code for implementing the admin analytics dashboard with user growth and revenue tracking.

---

## 🎯 API Endpoints

### Available Endpoints:
```
GET /api/analytics/public                           (No auth)
GET /api/analytics/admin/dashboard                  (Auth required)
GET /api/analytics/admin/user-growth?period={period}    (Auth required)
GET /api/analytics/admin/revenue-growth?period={period} (Auth required)
```

**Period Options:** `week` | `month` | `year`

---

## 📦 Step 1: Install Dependencies

```bash
npm install victory axios
```

---

## 🔧 Step 2: API Service Layer

Create `src/services/analyticsApi.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Analytics API functions
export const analyticsApi = {
  /**
   * Get complete admin dashboard with all analytics
   * Includes: current stats, user growth (week/month/year), revenue growth (week/month/year)
   */
  getDashboard: async () => {
    const response = await api.get('/analytics/admin/dashboard');
    return response.data.data;
  },

  /**
   * Get user growth for specific period
   * @param {string} period - 'week' | 'month' | 'year'
   */
  getUserGrowth: async (period = 'week') => {
    const response = await api.get('/analytics/admin/user-growth', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Get revenue growth for specific period
   * @param {string} period - 'week' | 'month' | 'year'
   */
  getRevenueGrowth: async (period = 'week') => {
    const response = await api.get('/analytics/admin/revenue-growth', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Get public analytics (top books and authors)
   * No authentication required
   */
  getPublicAnalytics: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/public`);
    return response.data.data;
  },
};

export default analyticsApi;
```

---

## 🎣 Step 3: Custom Hooks

Create `src/hooks/useAnalytics.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../services/analyticsApi';

/**
 * Hook for complete dashboard analytics
 * Returns all data at once (current stats + growth for all periods)
 */
export const useDashboardAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyticsApi.getDashboard();
      setData(result);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard analytics';
      setError(errorMessage);
      console.error('Dashboard analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
};

/**
 * Hook for user growth analytics with period selection
 * @param {string} period - 'week' | 'month' | 'year'
 */
export const useUserGrowth = (period = 'week') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyticsApi.getUserGrowth(period);
        setData(result);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user growth';
        setError(errorMessage);
        console.error('User growth error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
};

/**
 * Hook for revenue growth analytics with period selection
 * @param {string} period - 'week' | 'month' | 'year'
 */
export const useRevenueGrowth = (period = 'week') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyticsApi.getRevenueGrowth(period);
        setData(result);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch revenue growth';
        setError(errorMessage);
        console.error('Revenue growth error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
};
```

---

## 🔘 Step 4: Period Selector Component

Create `src/components/admin/PeriodSelector.jsx`:

```jsx
import React from 'react';
import './PeriodSelector.css';

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last 12 Months' }
  ];

  return (
    <div className="period-selector">
      {periods.map(({ value, label }) => (
        <button
          key={value}
          className={`period-btn ${selectedPeriod === value ? 'active' : ''}`}
          onClick={() => onPeriodChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;
```

Create `src/components/admin/PeriodSelector.css`:

```css
.period-selector {
  display: flex;
  gap: 8px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.period-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
  white-space: nowrap;
}

.period-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.period-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}
```

---

## 📈 Step 5: User Growth Chart Component

Create `src/components/admin/UserGrowthChart.jsx`:

```jsx
import React, { useState } from 'react';
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryAxis, 
  VictoryTheme, 
  VictoryTooltip, 
  VictoryVoronoiContainer,
  VictoryLegend
} from 'victory';
import PeriodSelector from './PeriodSelector';
import { useUserGrowth } from '../../hooks/useAnalytics';
import './UserGrowthChart.css';

const UserGrowthChart = () => {
  const [period, setPeriod] = useState('week');
  const { data, loading, error } = useUserGrowth(period);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">
          <div className="spinner"></div>
          Loading user growth data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>📈 User Growth</h3>
        </div>
        <div className="chart-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>📈 User Growth</h3>
          <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
        </div>
        <div className="chart-empty">
          No user growth data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h3>📈 User Growth</h3>
          <p className="chart-subtitle">{data.periodLabel}</p>
        </div>
        <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
      </div>

      {/* Summary Stats */}
      <div className="chart-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{data.summary.totalUsers.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">New Users</span>
          <span className="stat-value highlight">{data.summary.newUsersInPeriod.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Growth Rate</span>
          <span className="stat-value success">{data.summary.growthRate}%</span>
        </div>
      </div>

      {/* Chart */}
      <VictoryChart
        theme={VictoryTheme.material}
        height={300}
        padding={{ top: 20, bottom: 60, left: 60, right: 20 }}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryAxis
          tickFormat={(t) => t}
          style={{
            tickLabels: { 
              fontSize: 10, 
              angle: period === 'year' ? 0 : -45, 
              textAnchor: period === 'year' ? 'middle' : 'end',
              padding: 5
            }
          }}
        />
        <VictoryAxis
          dependentAxis
          label="Users"
          style={{
            axisLabel: { fontSize: 12, padding: 45 },
            tickLabels: { fontSize: 10 }
          }}
        />
        
        {/* New Users Line */}
        <VictoryLine
          data={data.data}
          x="date"
          y="newUsers"
          style={{
            data: { stroke: "#3b82f6", strokeWidth: 3 }
          }}
          labels={({ datum }) => `New: ${datum.newUsers}`}
          labelComponent={<VictoryTooltip />}
        />
        
        {/* Cumulative Line */}
        <VictoryLine
          data={data.data}
          x="date"
          y="cumulative"
          style={{
            data: { 
              stroke: "#10b981", 
              strokeWidth: 2, 
              strokeDasharray: "5,5" 
            }
          }}
          labels={({ datum }) => `Total: ${datum.cumulative}`}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
      
      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>New Users</span>
        </div>
        <div className="legend-item">
          <span className="legend-color dashed" style={{ backgroundColor: '#10b981' }}></span>
          <span>Cumulative Total</span>
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;
```

Create `src/components/admin/UserGrowthChart.css`:

```css
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.chart-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.chart-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.chart-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-value.highlight {
  color: #3b82f6;
}

.stat-value.success {
  color: #10b981;
}

.chart-legend {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.legend-color {
  width: 24px;
  height: 4px;
  border-radius: 2px;
}

.legend-color.dashed {
  background-image: repeating-linear-gradient(
    to right,
    currentColor,
    currentColor 5px,
    transparent 5px,
    transparent 10px
  );
  height: 4px;
}

.chart-loading,
.chart-empty,
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7280;
  font-size: 16px;
  gap: 16px;
}

.chart-error {
  color: #ef4444;
}

.error-icon {
  font-size: 48px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
  }

  .chart-stats-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 💰 Step 6: Revenue Growth Chart Component

Create `src/components/admin/RevenueGrowthChart.jsx`:

```jsx
import React, { useState } from 'react';
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryAxis, 
  VictoryTheme, 
  VictoryTooltip, 
  VictoryVoronoiContainer 
} from 'victory';
import PeriodSelector from './PeriodSelector';
import { useRevenueGrowth } from '../../hooks/useAnalytics';
import './UserGrowthChart.css'; // Reuse same CSS

const RevenueGrowthChart = () => {
  const [period, setPeriod] = useState('week');
  const { data, loading, error } = useRevenueGrowth(period);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">
          <div className="spinner"></div>
          Loading revenue data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>💰 Revenue Growth</h3>
        </div>
        <div className="chart-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>💰 Revenue Growth</h3>
          <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
        </div>
        <div className="chart-empty">
          No revenue data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h3>💰 Revenue Growth</h3>
          <p className="chart-subtitle">{data.periodLabel}</p>
        </div>
        <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
      </div>

      {/* Summary Stats */}
      <div className="chart-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">${data.summary.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Period Revenue</span>
          <span className="stat-value highlight">${data.summary.revenueInPeriod.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">By Plan</span>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {data.summary.revenueByPlan.map(plan => (
              <div key={plan.plan}>
                {plan.plan}: ${plan.revenue.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <VictoryChart
        theme={VictoryTheme.material}
        height={300}
        padding={{ top: 20, bottom: 60, left: 70, right: 20 }}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryAxis
          tickFormat={(t) => t}
          style={{
            tickLabels: { 
              fontSize: 10, 
              angle: period === 'year' ? 0 : -45, 
              textAnchor: period === 'year' ? 'middle' : 'end',
              padding: 5
            }
          }}
        />
        <VictoryAxis
          dependentAxis
          label="Revenue ($)"
          style={{
            axisLabel: { fontSize: 12, padding: 55 },
            tickLabels: { fontSize: 10 }
          }}
          tickFormat={(t) => `$${t}`}
        />
        
        {/* Daily/Monthly Revenue Line */}
        <VictoryLine
          data={data.data}
          x="date"
          y="revenue"
          style={{
            data: { stroke: "#8b5cf6", strokeWidth: 3 }
          }}
          labels={({ datum }) => `$${datum.revenue.toFixed(2)}`}
          labelComponent={<VictoryTooltip />}
        />
        
        {/* Cumulative Revenue Line */}
        <VictoryLine
          data={data.data}
          x="date"
          y="cumulative"
          style={{
            data: { 
              stroke: "#f59e0b", 
              strokeWidth: 2, 
              strokeDasharray: "5,5" 
            }
          }}
          labels={({ datum }) => `Total: $${datum.cumulative.toFixed(2)}`}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
      
      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
          <span>Period Revenue</span>
        </div>
        <div className="legend-item">
          <span className="legend-color dashed" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>Cumulative Total</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueGrowthChart;
```

---

## 📊 Step 7: Analytics Card Component

Create `src/components/admin/AnalyticsCard.jsx`:

```jsx
import React from 'react';
import './AnalyticsCard.css';

const AnalyticsCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="analytics-card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        {trend && (
          <span className={`card-trend ${trend.type}`}>
            {trend.type === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default AnalyticsCard;
```

Create `src/components/admin/AnalyticsCard.css`:

```css
.analytics-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 8px;
}

.card-trend {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.card-trend.up {
  color: #10b981;
  background: #d1fae5;
}

.card-trend.down {
  color: #ef4444;
  background: #fee2e2;
}

.card-content {
  margin-top: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}
```

---

## 📄 Step 8: Main Dashboard Page

Create `src/pages/admin/AdminAnalyticsDashboard.jsx`:

```jsx
import React from 'react';
import { useDashboardAnalytics } from '../../hooks/useAnalytics';
import UserGrowthChart from '../../components/admin/UserGrowthChart';
import RevenueGrowthChart from '../../components/admin/RevenueGrowthChart';
import AnalyticsCard from '../../components/admin/AnalyticsCard';
import './AdminAnalyticsDashboard.css';

const AdminAnalyticsDashboard = () => {
  const { data, loading, error, refresh } = useDashboardAnalytics();

  if (loading) {
    return (
      <div className="admin-analytics-dashboard">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-analytics-dashboard">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={refresh} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.currentStats;

  return (
    <div className="admin-analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>📊 Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Overview of your platform performance
          </p>
        </div>
        <button onClick={refresh} className="refresh-btn" disabled={loading}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="analytics-grid">
        <AnalyticsCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          subtitle="All registered users"
          icon="👥"
        />
        <AnalyticsCard
          title="Active Subscriptions"
          value={
            (
              (stats?.basicSubscribers || 0) + 
              (stats?.premiumSubscribers || 0)
            ).toLocaleString()
          }
          subtitle={`${stats?.basicSubscribers || 0} Basic, ${stats?.premiumSubscribers || 0} Premium`}
          icon="⭐"
        />
        <AnalyticsCard
          title="Total Books"
          value={stats?.totalBooks?.toLocaleString() || '0'}
          subtitle={`${stats?.publishedBooks || 0} Published`}
          icon="📚"
        />
        <AnalyticsCard
          title="Total Views"
          value={stats?.books?.totalViews?.toLocaleString() || '0'}
          subtitle="Across all books"
          icon="👁️"
        />
      </div>

      {/* Growth Charts */}
      <div className="charts-section">
        <UserGrowthChart />
        <RevenueGrowthChart />
      </div>

      {/* Additional Stats */}
      {stats && (
        <div className="stats-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">📖</span>
              <div>
                <p className="stat-value">
                  {stats?.totalChapters?.toLocaleString() || '0'}
                </p>
                <p className="stat-label">Total Chapters</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <div>
                <p className="stat-value">
                  {stats?.books?.totalLikes?.toLocaleString() || '0'}
                </p>
                <p className="stat-label">Total Likes</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <div>
                <p className="stat-value">
                  {stats?.books?.averageRating?.toFixed(1) || '0.0'}
                </p>
                <p className="stat-label">Average Rating</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📥</span>
              <div>
                <p className="stat-value">
                  {stats?.books?.totalDownloads?.toLocaleString() || '0'}
                </p>
                <p className="stat-label">Total Downloads</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsDashboard;
```

Create `src/pages/admin/AdminAnalyticsDashboard.css`:

```css
.admin-analytics-dashboard {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  background: #f9fafb;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.dashboard-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 16px;
}

.refresh-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

.stats-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-section h2 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 24px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 5px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-container h2 {
  color: #ef4444;
  margin: 0;
}

.error-container p {
  color: #6b7280;
  margin: 8px 0;
}

.retry-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 16px;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Responsive */
@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-analytics-dashboard {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 🛣️ Step 9: Add Route to Your App

In your router file (e.g., `App.jsx` or `routes.jsx`):

```jsx
import AdminAnalyticsDashboard from './pages/admin/AdminAnalyticsDashboard';

// Add to your routes
<Route 
  path="/admin/analytics" 
  element={<AdminAnalyticsDashboard />} 
/>
```

---

## 🔐 Step 10: Environment Variables

Create or update `.env`:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

For production:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

---

## ✅ Testing Checklist

### Before Testing:
- [ ] Backend server is running
- [ ] You're logged in and have a valid token
- [ ] Token is stored in localStorage

### Frontend Testing:
- [ ] Dashboard loads without errors
- [ ] Summary cards show correct data
- [ ] User growth chart displays
- [ ] Revenue growth chart displays
- [ ] Period toggles work (Last 7 Days, Last 30 Days, Last 12 Months)
- [ ] Refresh button works
- [ ] Charts update when period changes
- [ ] Responsive design works on mobile

### Test Commands:
```bash
# Start frontend
npm start

# Navigate to
http://localhost:3000/admin/analytics
```

---

## 🎨 Customization Options

### Change Colors:

In the CSS files, update these colors:
- Primary: `#3b82f6` (blue)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (orange)
- Danger: `#ef4444` (red)

### Add More Stats:

```jsx
<AnalyticsCard
  title="Your Stat"
  value="123"
  subtitle="Description"
  icon="🎯"
/>
```

---

## 🐛 Common Issues

### 401 Unauthorized Error
**Solution:** Make sure you're logged in and token is valid
```javascript
// Check token in browser console
console.log(localStorage.getItem('authToken'));
```

### Charts Not Displaying
**Solution:** Ensure Victory is installed
```bash
npm install victory
```

### CORS Error
**Solution:** Backend CORS is already configured for `http://localhost:5173`

---

## 📚 File Structure Summary

```
src/
├── services/
│   └── analyticsApi.js
├── hooks/
│   └── useAnalytics.js
├── components/
│   └── admin/
│       ├── PeriodSelector.jsx
│       ├── PeriodSelector.css
│       ├── UserGrowthChart.jsx
│       ├── UserGrowthChart.css
│       ├── RevenueGrowthChart.jsx
│       ├── AnalyticsCard.jsx
│       └── AnalyticsCard.css
└── pages/
    └── admin/
        ├── AdminAnalyticsDashboard.jsx
        └── AdminAnalyticsDashboard.css
```

---

## 🎉 You're Done!

**Everything is now set up and ready to use!**

1. Copy all the code above into your project
2. Install dependencies: `npm install victory axios`
3. Add the route to your router
4. Navigate to `/admin/analytics`
5. Enjoy your beautiful analytics dashboard! 📊✨

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Verify backend is running
3. Check auth token is valid
4. Ensure all files are in correct locations

**Happy coding! 🚀**

