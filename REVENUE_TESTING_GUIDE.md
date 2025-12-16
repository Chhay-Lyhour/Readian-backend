# 🚀 Quick Testing Guide - Revenue Analytics

## Prerequisites
- Server running on `http://localhost:5001`
- Admin user access token
- At least 1-2 users with active subscriptions (basic or premium)

---

## Step 1: Create Test Users with Subscriptions

Use Postman or your frontend to create/update users:

```json
// PATCH /api/admin/users/:userId
{
  "plan": "basic",
  "subscriptionStatus": "active",
  "subscriptionDuration": 30
}
```

This will automatically calculate `subscriptionExpiresAt` as 30 days from now.

---

## Step 2: Test Revenue Growth Endpoints

### Test 1: Last 7 Days
```bash
GET http://localhost:5001/api/analytics/admin/revenue-growth?period=week

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Revenue growth analytics retrieved successfully.",
  "data": {
    "period": "week",
    "periodLabel": "Last 7 Days",
    "startDate": "2025-12-09T...",
    "endDate": "2025-12-16T...",
    "data": [
      {
        "date": "2025-12-09",
        "revenue": 0,
        "subscriptions": 0,
        "cumulative": 0
      },
      {
        "date": "2025-12-10",
        "revenue": 5,
        "subscriptions": 1,
        "cumulative": 5
      }
      // ... 7 days total
    ],
    "summary": {
      "totalRevenue": 15.00,
      "revenueInPeriod": 10.00,
      "monthlyRecurringRevenue": 15.00,
      "activeSubscriptions": 2,
      "revenueByPlan": [
        {
          "plan": "basic",
          "revenue": 5,
          "subscriptions": 1,
          "price": 5
        },
        {
          "plan": "premium",
          "revenue": 10,
          "subscriptions": 1,
          "price": 10
        }
      ],
      "growthRate": "66.67"
    }
  }
}
```

### Test 2: Last 30 Days
```bash
GET http://localhost:5001/api/analytics/admin/revenue-growth?period=month
```

**Expected:** Same structure, but 30 data points

### Test 3: Last 12 Months
```bash
GET http://localhost:5001/api/analytics/admin/revenue-growth?period=year
```

**Expected:** Same structure, but 12 data points (grouped by month)

---

## Step 3: Test Complete Dashboard

```bash
GET http://localhost:5001/api/analytics/admin/dashboard

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "currentStats": {
      "totalUsers": 150,
      "totalBooks": 50,
      "totalChapters": 250,
      "totalDownloads": 320,
      "subscriptionBreakdown": {
        "free": 100,
        "basic": 30,
        "premium": 20
      },
      "topBooks": [...],
      "topAuthors": [...],
      "revenue": {
        "total": 350,
        "monthly": 150
      }
    },
    "userGrowth": {
      "week": { ... },
      "month": { ... },
      "year": { ... }
    },
    "revenueGrowth": {
      "week": { ... },
      "month": { ... },
      "year": { ... }
    }
  }
}
```

---

## Step 4: Verify Data in Different Scenarios

### Scenario 1: No Active Subscriptions
**Result:** All revenue values should be 0

### Scenario 2: 1 Basic Subscriber
**Result:** 
- totalRevenue: $5
- MRR: $5
- activeSubscriptions: 1

### Scenario 3: 1 Basic + 1 Premium
**Result:**
- totalRevenue: $15 ($5 + $10)
- MRR: $15
- activeSubscriptions: 2

### Scenario 4: Subscription Started Yesterday
**Result:** Should show up in week view with yesterday's date

---

## Step 5: Test Error Handling

### Invalid Period
```bash
GET http://localhost:5001/api/analytics/admin/revenue-growth?period=invalid
```

**Expected:**
```json
{
  "status": "error",
  "message": "Invalid period. Must be one of: week, month, year"
}
```

### No Authentication
```bash
GET http://localhost:5001/api/analytics/admin/revenue-growth?period=week
# (without Authorization header)
```

**Expected:** 401 Unauthorized error

---

## Step 6: Frontend Chart Testing

### Copy this HTML file to test locally:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Revenue Analytics Test</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .chart-box { height: 400px; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; }
    .controls { margin-bottom: 20px; }
    button { padding: 10px 20px; margin-right: 10px; cursor: pointer; }
    .active { background: #3b82f6; color: white; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .metric-value { font-size: 32px; font-weight: bold; color: #10b981; }
    .metric-label { color: #6b7280; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Revenue Analytics Dashboard</h1>
    
    <div class="controls">
      <button onclick="loadData('week')" id="btn-week" class="active">Last 7 Days</button>
      <button onclick="loadData('month')" id="btn-month">Last 30 Days</button>
      <button onclick="loadData('year')" id="btn-year">Last 12 Months</button>
    </div>

    <div class="metrics">
      <div class="metric">
        <div class="metric-value" id="totalRevenue">$0</div>
        <div class="metric-label">Total Revenue</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="periodRevenue">$0</div>
        <div class="metric-label">Period Revenue</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="mrr">$0</div>
        <div class="metric-label">MRR</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="activeSubs">0</div>
        <div class="metric-label">Active Subs</div>
      </div>
    </div>

    <div class="chart-box">
      <canvas id="revenueChart"></canvas>
    </div>

    <div class="chart-box" style="height: 300px;">
      <canvas id="planChart"></canvas>
    </div>
  </div>

  <script>
    // CHANGE THIS TO YOUR ACCESS TOKEN
    const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
    const API_URL = 'http://localhost:5001/api/analytics/admin/revenue-growth';

    let revenueChart = null;
    let planChart = null;
    let currentPeriod = 'week';

    async function loadData(period) {
      currentPeriod = period;
      
      // Update button styles
      document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      document.getElementById(`btn-${period}`).classList.add('active');

      try {
        const response = await fetch(`${API_URL}?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const data = result.data;

        console.log('Revenue Data:', data);

        // Update metrics
        document.getElementById('totalRevenue').textContent = `$${data.summary.totalRevenue}`;
        document.getElementById('periodRevenue').textContent = `$${data.summary.revenueInPeriod}`;
        document.getElementById('mrr').textContent = `$${data.summary.monthlyRecurringRevenue}`;
        document.getElementById('activeSubs').textContent = data.summary.activeSubscriptions;

        // Render revenue chart
        renderRevenueChart(data);
        renderPlanChart(data.summary.revenueByPlan);

      } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Check console for details.');
      }
    }

    function renderRevenueChart(data) {
      if (revenueChart) revenueChart.destroy();

      const ctx = document.getElementById('revenueChart').getContext('2d');
      revenueChart = new Chart(ctx, {
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
              tension: 0.4,
              borderDash: [5, 5]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Revenue Growth - ${data.periodLabel}`,
              font: { size: 16 }
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
    }

    function renderPlanChart(revenueByPlan) {
      if (planChart) planChart.destroy();

      const ctx = document.getElementById('planChart').getContext('2d');
      planChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: revenueByPlan.map(item => item.plan.toUpperCase()),
          datasets: [{
            data: revenueByPlan.map(item => item.revenue),
            backgroundColor: ['#3b82f6', '#8b5cf6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Revenue Distribution by Plan',
              font: { size: 16 }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const item = revenueByPlan[context.dataIndex];
                  return [
                    `${label}: $${value}`,
                    `Subscriptions: ${item.subscriptions}`,
                    `Price: $${item.price}/month`
                  ];
                }
              }
            }
          }
        }
      });
    }

    // Load initial data
    loadData('week');
  </script>
</body>
</html>
```

**Instructions:**
1. Replace `YOUR_ACCESS_TOKEN_HERE` with your actual admin token
2. Open the HTML file in a browser
3. Click the period buttons to switch views
4. Check browser console for any errors

---

## Common Issues & Solutions

### Issue: All revenue is 0
**Solution:** Make sure you have users with:
- `subscriptionStatus: "active"`
- `plan: "basic"` or `"premium"` (not "free")
- `subscriptionExpiresAt` is set and in the future

### Issue: No data points show up
**Solution:** The subscription might have started outside the period range. Try:
- Creating a new subscription today
- Checking the "month" or "year" view for older subscriptions

### Issue: 401 Unauthorized
**Solution:** 
- Make sure you're using an admin user token
- Check token hasn't expired (refresh if needed)

### Issue: Chart doesn't render
**Solution:**
- Check browser console for JavaScript errors
- Verify Chart.js is loaded (check Network tab)
- Ensure canvas element exists before rendering

---

## Success Checklist

✅ Server starts without errors  
✅ Can call `/api/analytics/admin/revenue-growth?period=week`  
✅ Response has correct structure with data array  
✅ Summary includes totalRevenue, MRR, activeSubscriptions  
✅ Revenue by plan breakdown is accurate  
✅ Chart renders with proper data points  
✅ Switching periods updates the chart  
✅ Metrics cards show correct values  

---

## Next Steps After Testing

1. **Integrate into Admin Dashboard**
   - Add revenue charts alongside user growth charts
   - Create unified dashboard view

2. **Add More Visualizations**
   - Bar chart for plan comparison
   - Area chart for cumulative revenue
   - Sparklines for quick metrics

3. **Export Functionality**
   - CSV export for revenue data
   - PDF reports for stakeholders

4. **Real-time Updates**
   - WebSocket or polling for live updates
   - Auto-refresh dashboard every minute

5. **Plan for Transaction Table**
   - When ready, migrate to real transaction-based analytics
   - Will provide historical accuracy and refund tracking

---

**Happy Testing! 🎉**

If you encounter any issues, check:
1. Server logs for errors
2. Browser console for JavaScript errors
3. Network tab for failed API calls
4. Make sure test data exists (active subscriptions)

