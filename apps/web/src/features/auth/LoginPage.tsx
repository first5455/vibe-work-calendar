import { Github } from "lucide-react";

import { api } from "../../api/client";

export default function LoginPage() {
  const handleLogin = (provider: "google" | "github") => {
    // OAuth requires top-level navigation, not fetch/AJAX
    window.location.href = `http://localhost:3000/auth/login/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to Vibe Work Calendar</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <button
            onClick={() => handleLogin('github')}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Github className="h-5 w-5 mr-2" />
            <span className="font-medium">Continue with GitHub</span>
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
           By continuing, you verify that you are part of the vibe.
        </div>
      </div>
    </div>
  );
}
