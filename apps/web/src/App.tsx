import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import TeamView from './features/team/TeamView';
import TeamDetailPage from './features/team/TeamDetailPage';
import PersonalPage from './features/personal/PersonalPage';
import { ThemeProvider } from "./context/ThemeContext";
import SettingsPage from "./features/settings/SettingsPage";
import RequireAuth from './components/layout/RequireAuth';
import { WebSocketProvider } from './context/WebSocketContext';

function App() {
  return (
    <ThemeProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="team" element={<TeamView />} />
              <Route path="team/:teamId" element={<TeamDetailPage />} />
              <Route path="personal" element={<PersonalPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App
