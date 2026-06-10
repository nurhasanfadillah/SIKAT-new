import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Wallet, CreditCard, BarChart2, LogOut } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { profile } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Kas Rekap', href: '/kas', icon: Wallet },
    { name: 'Dana Talang', href: '/talang', icon: CreditCard },
    { name: 'Laporan', href: '/laporan', icon: BarChart2 },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Utama';
      case '/kas': return 'Kas Sekolah';
      case '/talang': return 'Dana Talang';
      case '/laporan': return 'Sensus Keuangan';
      default: return 'Keuangan';
    }
  };

  return (
    <div className="min-h-screen bg-[#060a13] font-sans flex items-center justify-center p-0 md:p-6 text-slate-100 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#00e5a3]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#a855f7]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Responsive Smartphone Device Container */}
      <div className="w-full max-w-md md:h-[860px] h-screen md:rounded-[44px] bg-[#0c1221] flex flex-col md:border-8 md:border-[#1e293b] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden ring-1 ring-white/5">
        
        {/* Device Camera Punch Hole / Speaker simulated (only visible on desktop wrapper) */}
        <div className="hidden md:flex absolute top-1.5 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-full z-50 items-center justify-center">
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full mr-2 border border-slate-800" />
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Custom Mobile Header Bar */}
        <header className="sticky top-0 z-40 bg-[#0c1221]/95 backdrop-blur-md border-b border-white/5 pt-5 md:pt-9 pb-3 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Quick Avatar Initials */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#00f5a0] flex items-center justify-center font-bold text-[#0c1221] text-sm shadow-[0_0_15px_rgba(0,245,160,0.3)]">
              {profile?.nama?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Selamat Datang,</span>
              <span className="text-[13px] font-bold text-slate-100 leading-tight truncate max-w-[120px]">
                {profile?.nama || 'Pengguna'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Centered Compact Badge */}
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm leading-tight">
              {profile?.role || 'Viewer'}
            </span>
            <button 
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-rose-400 active:scale-95 transition-all"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Nav Title Header to resemble native fintech hubs */}
        <div className="bg-[#0c1221] px-5 pt-3 pb-1 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          </div>
          <span className="text-[15px] font-bold tracking-wider text-emerald-400 font-mono">
            &lt;SIKAT&gt;
          </span>
        </div>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-2 no-scrollbar scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pb-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Modern Floating Bottom Tab Bar Navigation */}
        <nav className="absolute bottom-4 inset-x-4 z-40 bg-[#121a2e]/90 backdrop-blur-lg border border-white/5 rounded-3xl py-2 px-3 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex justify-between items-center">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex flex-col items-center justify-center flex-1 py-1.5 relative group"
              >
                <div 
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 scale-110 shadow-[0_0_12px_rgba(0,229,163,0.15)]' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="h-5.5 w-5.5" />
                </div>
                <span className={`text-[9px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.name}
                </span>

                {/* Animated active underline dot */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-emerald-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

