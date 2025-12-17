# Changelog

## 1.3.3 (2025-12-17)

### Bug Fixes

- **File Attachments**: Fixed file preview URLs incorrectly using internal Docker addresses. Now correctly uses the public MinIO URL for accessible downloads and previews.

## 1.3.2 (2025-12-17)

### Bug Fixes

- **Branding**: Fixed "VibeCal" text still appearing in the mobile header; updated to "VCalendar" for consistency.
- **Mobile UI**: Fixed an issue where user avatars were stretched/squashed in the "All Leaves" list on small screens.

## 1.3.1 (2025-12-17)

### Experimental Features

- **Progressive Web App (Beta)**: Added initial PWA support. Users can now install VCalendar on their devices. Please note that this feature is currently in **Beta** and offline functionality may be limited.

## 1.3.0 (2025-12-17)

### New Features

- **Real-time Updates**: Implemented WebSocket connections for instant dashboard updates. Changes to leaves are now reflected immediately across all connected clients without manual refresh.
- **WebSocket Heartbeat**: Added connection stability checks (ping-pong) to ensure reliability behind proxies like Cloudflare Tunnel.
- **Leave Permissions**: Implemented strict ownership checks. Users can only edit/delete their own leaves. Added "Read-Only" mode for viewing other users' requests.
- **UI Enhancements**:
  - Redesigned Leave Request Modal with wider layout and improved spacing.
  - Added "Category" column and filters (Personal vs Team) to the All Leaves dashboard.
  - Restored dashboard statistics counting.

### Bug Fixes

- **Avatar Loading**: Fixed `429 Too Many Requests` error for Google profile images by implementing `referrerPolicy="no-referrer"` across the application.
- **Type Safety**: Improved TypeScript definitions for the API entry point to resolve "excessively deep type instantiation" errors.

## 1.2.0 (2025-12-17)

### New Features

- **Modern UI**: Replaced native browser alerts with custom, theme-aware `AlertDialog` components for a consistent and premium user experience.
- **Security**: Configured CORS settings in the API to strictly allow requests from the frontend, enhancing security.

## 1.1.1 (2025-12-17)

### Improvements

- **Empty Team State**: Added a helpful empty state screen in the Teams view to guide users when no teams exist.

## 1.1.0 (2025-12-17)

### Key Features

- **Personal Leaves**: Users can now request leaves without being associated with a specific project/team ("Personal" leave type).
- **Personal Dashboard**: Added a new "Personal" tab in the sidebar to view and manage personal leave history.
- **Team Management**: Team Owners can now delete their teams. This action safely removes all team members and team-related leaves.

### Backend Improvements

- **Schema Update**: Updated `leaves` table to make `teamId` optional, enabling personal leave requests.
- **API Updates**: Enhanced leaves and teams controllers to support new functionality.

## 1.0.0 (2025-12-16)

### Key Features

- **Rebranding**: Changed application name from "Vibe Work Calendar" to "VCalendar".
- **Team Logo Upload**: Team Owners and Admins can now upload and update team logos.
- **Calendar Enhancements**: User avatars are now displayed in leave details for better visibility.

### Bug Fixes

- **Team List**: Fixed missing team logos in the team list view.
- **UI Polishing**: Fixed clipped dropdown menus in Team Detail view.
- **Data Persistence**: Resolved issue with user avatars not persisting correctly in some views.
- **Security Check**: Added role-verification (Owner/Admin) for adding new team members.
- **Code Cleanup**: Removed debugging logs and unused code.
