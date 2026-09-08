import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { RobotBackground } from './components/RobotBackground';
import { LoginCard } from './components/LoginCard';
import { PortalHome } from './components/PortalHome';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { KeyRound } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAdminAuthenticated = () => {
    setIsAdminMode(true);
    setIsAdminModalOpen(false);
  };

  const handleExitAdmin = () => {
    setIsAdminMode(false);
  };

  const handleLoginAsStudent = (studentUsername: string) => {
    setIsAdminMode(false);
    setCurrentUser(studentUsername);
  };

  return (
    <div className="min-h-screen bg-[#07060c] text-slate-100 flex flex-col font-['IBM_Plex_Sans_Arabic',_'Cairo',_sans-serif] relative overflow-x-hidden selection:bg-[#d4af37]/30 selection:text-amber-200">
      {/* Permanent Fixed Header with Cp Logo on Every Page */}
      <Navbar
        isLoggedIn={!!currentUser}
        username={currentUser || ''}
        isAdmin={isAdminMode}
        onLogout={handleLogout}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onExitAdmin={handleExitAdmin}
      />

      {/* Cybernetic Robot Background Visual (Soft Light Gray, Zero Letters) */}
      <RobotBackground />

      {/* Main Page Area */}
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 relative z-10 max-w-7xl mx-auto w-full">
        {isAdminMode ? (
          /* Admin Management Panel */
          <AdminPanel onExitAdmin={handleExitAdmin} onLoginAsStudent={handleLoginAsStudent} />
        ) : currentUser ? (

          /* 2. All Site Modules Display Immediately After Login: 
             - لوحة الشرف
             - الأربع جروبات (التفاعلي، الفوري، المرجئ)
             - المستويات التعليمية (الوحدات الـ 10)
          */
          <PortalHome username={currentUser} onLogout={handleLogout} />
        ) : (
          /* 1. Strictly the First Page is Login */
          <div className="flex flex-col items-center justify-center min-h-[78vh] py-6">
            <LoginCard
              onLoginSuccess={handleLoginSuccess}
              onOpenAdminLogin={() => setIsAdminModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Admin Authentication Modal (Separate Dedicated Password) */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAdminAuthenticated={handleAdminAuthenticated}
      />

      {/* Footer Note with Admin Link */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-500 border-t border-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>منظومة Cp التعليمية &copy; {new Date().getFullYear()} - جميع الحقوق محفوظة</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              id="footer-admin-link"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>دخول الإدارة (باسوورد الأدمن)</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-[#d4af37]/70">Adobe Captivate 2019 (64-Bit)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
