# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-23

### Added
- **Backend APIs**:
  - `GET /api/v1/stats/comparison`: Computes daily (Today vs Yesterday) and weekly (This Week vs Last Week) comparison metrics.
  - `GET /api/v1/stats/marquee`: Computes aggregate real-time metrics for all active tenants.
  - `GET /api/v1/stats/methods`: Aggregates HTTP request methods breakdown (GET, POST, PUT, DELETE).
  - `GET /api/v1/stats/status-codes`: Aggregates API response status code groups (2xx, 3xx, 4xx, 5xx).
  - `GET /api/v1/stats/peak-hours`: Aggregates hourly request distributions over 24 hours.
- **Frontend Components**:
  - `MarqueeHeader.tsx`: An infinite-scrolling marquee bar placed at the very top of the layout displaying live stats.

### Changed
- **Dashboard UI (`Dashboard.tsx`)**:
  - Redesigned dashboard to display multiple new dimensions:
    - **KPI cards** and **Growth comparison analysis** (Today vs Yesterday, This Week vs Last Week).
    - **API Call Trend** (Line Chart) and **Daily Peak Hours** (24-hour Histogram).
    - **Feature Usage Ranking** (Horizontal Bar Chart).
    - **HTTP Methods & Response Status Codes** (Doughnut charts).
    - **Top Active Users** ranking list (with totals and last active timestamps).
- **Global Layout (`Layout.tsx`)**:
  - Refactored layout to support the marquee header pinned at the top.
- **Vite/Nginx API Client (`api.ts` & `index.css`)**:
  - Exposed comparison and marquee API methods.
  - Added CSS animation keyframes and rules for the infinite-scrolling marquee animation.
- **Backend API & Log Processing**:
  - Excluded the noisy `materials.show` permission logs from stats calculations to keep metrics accurate. Kept writing them to database and pushing them over WebSockets.
- **Frontend Pages**:
  - Filtered out `materials.show` logs in the `ActivityLog` tab (`ActivityLog.tsx`) so they are hidden from the live activities table.

### Fixed
- **Timezone handling**:
  - Standardized dashboard timestamps and chart labels to `Asia/Taipei` (UTC+8).
  - Converted backend peak-hour aggregation to Taiwan time before grouping by hour.

### Changed
- **Dashboard visual system**:
  - Updated the dark theme to a Grafana-inspired high-density panel layout with restrained borders and orange accent color.
  - Replaced emoji controls and KPI symbols with a shared Lucide-style SVG icon set.
  - Replaced the daily peak-hours area chart with a 24-hour histogram for clearer hourly comparison.
  - Added a Grafana-style dashboard toolbar with breadcrumbs, time range, refresh, share, and edit controls.
  - Increased dashboard typography, chart labels, KPI values, navigation labels, and panel spacing for better readability.
