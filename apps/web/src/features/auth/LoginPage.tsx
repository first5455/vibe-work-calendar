import { Github, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";


export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (provider: "google" | "github") => {
    // OAuth requires top-level navigation, not fetch/AJAX
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.location.href = `${API_URL}/auth/login/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md transition-all"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md space-y-8 border border-transparent dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to OffDays</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-200">Continue with Google</span>
          </button>

          <button
            onClick={() => handleLogin('github')}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 dark:bg-black text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-900 transition-colors"
          >
            <Github className="h-5 w-5 mr-2" />
            <span className="font-medium">Continue with GitHub</span>
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
           By continuing, you verify that you are part of the vibe.
        </div>
      </div>
    </div>
  );
}
