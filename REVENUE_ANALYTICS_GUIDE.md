# Revenue Analytics Implementation Guide

## Overview

Since we don't have a transaction table yet, the revenue analytics are calculated based on **active subscriptions** in the User model. We estimate subscription activation dates and calculate revenue based on subscription plans.

---

## How Revenue is Calculated

### Pricing Model
```javascript
const planPricing = {
  basic: $5/month,
  premium: $10/month,
  free: $0/month
};
```

### Revenue Calculation Method

1. **Find Active Subscribers**
   - Query all users with `subscriptionStatus: "active"`
   - Plans: `basic` or `premium` (free users don't contribute revenue)
   - Must have `subscriptionExpiresAt` set

2. **Estimate Subscription Start Date**
   ```javascript
   startDate = subscriptionExpiresAt - (subscriptionDuration in days)
   ```
   Example:
   - Expiration: Jan 15, 2026
   - Duration: 30 days
   - Start Date: Dec 16, 2025

3. **Calculate Revenue by Date**
   - For each subscription that started within the period, add plan price to that date
   - Group by day (week/month) or by month (year)

4. **Cumulative Revenue**
   - Running total of revenue over the period

---

## API Endpoints

### 1. Revenue Growth by Week
```http
GET /api/analytics/admin/revenue-growth?period=week
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "periodLabel": "Last 7 Days",
    "startDate": "2025-12-09T00:00:00.000Z",
    "endDate": "2025-12-16T00:00:00.000Z",
    "data": [
      {
        "date": "2025-12-09",
        "revenue": 0,
        "subscriptions": 0,
        "cumulative": 0
      },
      {
        "date": "2025-12-10",
        "revenue": 10,
        "subscriptions": 1,
        "cumulative": 10
      },
      {
        "date": "2025-12-11",
        "revenue": 15,
        "subscriptions": 2,
        "cumulative": 25
      },
      // ... more days
    ],
    "summary": {
      "totalRevenue": 250.00,
      "revenueInPeriod": 45.00,
      "monthlyRecurringRevenue": 150.00,
      "activeSubscriptions": 20,
      "revenueByPlan": [
        {
          "plan": "basic",
          "revenue": 50,
          "subscriptions": 10,
          "price": 5
        },
        {
          "plan": "premium",
          "revenue": 100,
          "subscriptions": 10,
          "price": 10
        }
      ],
      "growthRate": "18.00"
    }
  }
}
```

### 2. Revenue Growth by Month
```http
GET /api/analytics/admin/revenue-growth?period=month
```

**Response:** Same structure as week, but with 30 days of data.

### 3. Revenue Growth by Year
```http
GET /api/analytics/admin/revenue-growth?period=year
```

**Response:** Same structure, but grouped by month (12 months).

---

## Data Structure Explained

### Main Data Array
```javascript
{
  "date": "2025-12-10",          // Date of subscription activation
  "revenue": 10,                 // New revenue on this date
  "subscriptions": 1,            // Number of new subscriptions
  "cumulative": 10               // Running total of revenue
}
```

### Summary Object
```javascript
{
  "totalRevenue": 250.00,              // All-time revenue from active subs
  "revenueInPeriod": 45.00,            // Revenue generated in this period
  "monthlyRecurringRevenue": 150.00,   // MRR (all active subscriptions)
  "activeSubscriptions": 20,           // Total active paid subscriptions
  "revenueByPlan": [...],              // Breakdown by plan
  "growthRate": "18.00"                // Growth percentage
}
```

---

## Frontend Implementation with Chart.js

### Example: Revenue Growth Line Chart

```javascript
// Fetch revenue data
const fetchRevenueGrowth = async (period = 'week') => {
  const response = await fetch(
    `/api/analytics/admin/revenue-growth?period=${period}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  const result = await response.json();
  return result.data;
};

// Render chart
const renderRevenueChart = (data) => {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  
  const labels = data.data.map(item => item.date);
  const revenues = data.data.map(item => item.revenue);
  const cumulative = data.data.map(item => item.cumulative);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Daily Revenue',
          data: revenues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Cumulative Revenue',
          data: cumulative,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Revenue Growth - ${data.periodLabel}`
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(2);
            }
          }
        }
      }
    }
  });
};

// Usage
const revenueData = await fetchRevenueGrowth('week');
renderRevenueChart(revenueData);
```

---

## Revenue Metrics Explained

### 1. Total Revenue
- Sum of all revenue from currently active subscriptions
- Example: 20 active subscriptions × average $7.50 = $150

### 2. Revenue in Period
- New revenue generated during the selected period
- Only counts subscriptions that started within the period

### 3. Monthly Recurring Revenue (MRR)
- Predictable monthly income from all active subscriptions
- Formula: `(basic_count × $5) + (premium_count × $10)`
- Critical metric for SaaS business health

### 4. Growth Rate
- Percentage of revenue growth in the period
- Formula: `(revenueInPeriod / totalRevenue) × 100`

---

## Period Options

### Week (Last 7 Days)
- Shows daily revenue for past 7 days
- Best for: Short-term trends, daily monitoring
- Format: `YYYY-MM-DD` (e.g., "2025-12-10")

### Month (Last 30 Days)
- Shows daily revenue for past 30 days
- Best for: Monthly reports, medium-term trends
- Format: `YYYY-MM-DD`

### Year (Last 12 Months)
- Shows monthly revenue for past 12 months
- Best for: Long-term trends, annual planning
- Format: `YYYY-MM` (e.g., "2025-12")

---

## Revenue by Plan Breakdown

```javascript
{
  "revenueByPlan": [
    {
      "plan": "basic",
      "revenue": 50,          // Total from basic subs
      "subscriptions": 10,    // Number of basic subs
      "price": 5              // Price per sub
    },
    {
      "plan": "premium",
      "revenue": 100,         // Total from premium subs
      "subscriptions": 10,    // Number of premium subs
      "price": 10             // Price per sub
    }
  ]
}
```

### Visualizing Plan Distribution

```javascript
// Pie chart for revenue by plan
const renderPlanDistribution = (revenueByPlan) => {
  const ctx = document.getElementById('planPieChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: revenueByPlan.map(item => item.plan.toUpperCase()),
      datasets: [{
        data: revenueByPlan.map(item => item.revenue),
        backgroundColor: ['#3b82f6', '#8b5cf6']
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Revenue Distribution by Plan'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: $${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};
```

---

## Complete Dashboard Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Admin Revenue Analytics</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .chart-container {
      position: relative;
      height: 400px;
      margin-bottom: 30px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      padding: 20px;
      border-radius: 8px;
      background: #f3f4f6;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>Revenue Analytics Dashboard</h1>
  
  <!-- Period Selector -->
  <select id="periodSelector">
    <option value="week">Last 7 Days</option>
    <option value="month">Last 30 Days</option>
    <option value="year">Last 12 Months</option>
  </select>

  <!-- Metrics Cards -->
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-value" id="totalRevenue">$0</div>
      <div class="metric-label">Total Revenue</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="periodRevenue">$0</div>
      <div class="metric-label">Period Revenue</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="mrr">$0</div>
      <div class="metric-label">MRR</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="activeSubs">0</div>
      <div class="metric-label">Active Subscriptions</div>
    </div>
  </div>

  <!-- Revenue Chart -->
  <div class="chart-container">
    <canvas id="revenueChart"></canvas>
  </div>

  <!-- Plan Distribution Chart -->
  <div class="chart-container">
    <canvas id="planChart"></canvas>
  </div>

  <script>
    const accessToken = localStorage.getItem('accessToken');
    let revenueChart = null;
    let planChart = null;

    const fetchAndRenderRevenue = async (period) => {
      const response = await fetch(
        `/api/analytics/admin/revenue-growth?period=${period}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      const result = await response.json();
      const data = result.data;

      // Update metrics
      document.getElementById('totalRevenue').textContent = 
        `$${data.summary.totalRevenue}`;
      document.getElementById('periodRevenue').textContent = 
        `$${data.summary.revenueInPeriod}`;
      document.getElementById('mrr').textContent = 
        `$${data.summary.monthlyRecurringRevenue}`;
      document.getElementById('activeSubs').textContent = 
        data.summary.activeSubscriptions;

      // Render revenue chart
      if (revenueChart) revenueChart.destroy();
      const ctx1 = document.getElementById('revenueChart').getContext('2d');
      revenueChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: data.data.map(item => item.date),
          datasets: [
            {
              label: 'Daily Revenue',
              data: data.data.map(item => item.revenue),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Cumulative Revenue',
              data: data.data.map(item => item.cumulative),
              borderColor: '#3b82f6',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Revenue Growth - ${data.periodLabel}`
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => '$' + value.toFixed(2)
              }
            }
          }
        }
      });

      // Render plan distribution chart
      if (planChart) planChart.destroy();
      const ctx2 = document.getElementById('planChart').getContext('2d');
      planChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: data.summary.revenueByPlan.map(item => 
            item.plan.toUpperCase()
          ),
          datasets: [{
            data: data.summary.revenueByPlan.map(item => item.revenue),
            backgroundColor: ['#3b82f6', '#8b5cf6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Revenue by Plan'
            }
          }
        }
      });
    };

    // Period selector
    document.getElementById('periodSelector').addEventListener('change', (e) => {
      fetchAndRenderRevenue(e.target.value);
    });

    // Initial load
    fetchAndRenderRevenue('week');
  </script>
</body>
</html>
```

---

## Important Notes

### Limitations
1. **No Historical Transactions**: We're estimating based on current active subscriptions
2. **Subscription Start Date Estimation**: We calculate backwards from expiration date
3. **No Refunds or Cancellations Tracked**: Only shows active subscriptions
4. **No Payment Gateway Integration**: Using fixed pricing

### Future Improvements
When you add a transaction table, update the analytics to:
1. Use actual transaction dates instead of estimated dates
2. Track refunds, cancellations, upgrades, downgrades
3. Show actual payment amounts (may differ from plan pricing)
4. Track failed payments and revenue churn

---

## Testing the API

### Using Postman or curl

```bash
# Week view
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/analytics/admin/revenue-growth?period=week

# Month view
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/analytics/admin/revenue-growth?period=month

# Year view
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/analytics/admin/revenue-growth?period=year
```

---

## Summary

✅ **Revenue calculated from active subscriptions**  
✅ **Three time periods: week, month, year**  
✅ **Includes daily/monthly revenue breakdown**  
✅ **Cumulative revenue tracking**  
✅ **Revenue by plan distribution**  
✅ **Monthly Recurring Revenue (MRR)**  
✅ **Growth rate calculation**  
✅ **Ready for Chart.js visualization**  

The revenue analytics provide comprehensive insights into your subscription business, even without a transaction table!

---

**Last Updated:** December 16, 2025  
**Version:** 1.0.0

