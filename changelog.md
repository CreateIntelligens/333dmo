# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-21

### Added
- **Backend APIs**:
  - `GET /api/v1/stats/comparison`: Computes daily (Today vs Yesterday) and weekly (This Week vs Last Week) comparison metrics for API requests, active users, and unique features for the selected tenant.
  - `GET /api/v1/stats/marquee`: Computes aggregate real-time metrics (online users in the last 10 minutes, total API counts in the past 24 hours) for all active tenants.
- **Frontend Components**:
  - `MarqueeHeader.tsx`: An infinite-scrolling marquee bar placed at the very top of the layout. Displays live online users and 24h API stats for each station (tenant) with smooth hover-to-pause animation and a pulsing live status indicator.

### Changed
- **Dashboard UI (`Dashboard.tsx`)**:
  - Integrated comparison widgets showing daily and weekly trends.
  - Improved layout and visual indicators (green and red badges for positive/negative growth).
- **Global Layout (`Layout.tsx`)**:
  - Refactored layout to support the marquee header pinned at the top.
- **Vite/Nginx API Client (`api.ts` & `index.css`)**:
  - Exposed comparison and marquee API methods.
  - Added CSS animation keyframes and rules for the infinite-scrolling marquee animation.
- **Backend API & Log Processing**:
  - Excluded the noisy `materials.show` permission logs from stats calculations to keep metrics accurate. Kept writing them to database and pushing them over WebSockets.
- **Frontend Pages**:
  - Filtered out `materials.show` logs in the `ActivityLog` tab (`ActivityLog.tsx`) so they are hidden from the live activities table.
