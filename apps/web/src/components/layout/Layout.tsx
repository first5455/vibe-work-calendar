import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Calendar, Users, LogOut, Settings, Moon, Sun, User, Menu, X } from "lucide-react";
import { api } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";

export default function Layout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
        await api.auth.logout.post();
    } catch (e) {
        console.error("Logout failed", e);
    }
    navigate("/auth/login");
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 justify-between">
            <div className="flex items-center">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">VCalendar</span>
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 font-mono">v{__APP_VERSION__}</span>
            </div>
            {/* Mobile close button */}
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        <nav className="p-4 space-y-1">
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink to="/dashboard" icon={<Calendar className="w-5 h-5" />} label="Calendar" />
          </div>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink to="/team" icon={<Users className="w-5 h-5" />} label="Team" />
          </div>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink to="/personal" icon={<User className="w-5 h-5" />} label="Personal" />
          </div>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button 
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden flex items-center px-4 transition-colors duration-200 justify-between">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">VCalendar</span>
          <div className="w-8" /> {/* Spacer for centering if needed, or user avatar later */}
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
}
