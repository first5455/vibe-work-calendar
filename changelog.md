# Changelog

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
