import { useState, useEffect } from 'react';
import { Camera, BarChart3 } from 'lucide-react';
import Landing from './pages/Landing';
import CameraPage from './pages/CameraPage';
import Dashboard from './pages/Dashboard';
import { Toaster } from "react-hot-toast";

type Page = 'landing' | 'camera' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    const savedPage = sessionStorage.getItem('currentPage');
    if (savedPage === 'camera' || savedPage === 'dashboard') {
      setCurrentPage(savedPage as Page);
    }
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    sessionStorage.setItem('currentPage', page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="sticky top-0 z-50 border-b border-blue-100/50 backdrop-blur-md bg-white/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Face Attendance
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleNavigate('landing')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'landing'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavigate('camera')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'camera'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Check In
            </button>

            <button
              onClick={() => handleNavigate('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                currentPage === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-80px)]">
        {currentPage === 'landing' && <Landing onNavigate={() => handleNavigate('camera')} />}
        {currentPage === 'camera' && <CameraPage onNavigate={handleNavigate} />}
        {currentPage === 'dashboard' && <Dashboard />}
      </main>


      {/* ✅ GLOBAL TOASTER HERE */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
