
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  LogOut, 
  PlusCircle, 
  Menu, 
  X, 
  ChevronRight,
  User
} from 'lucide-react';
import { Employee, Payroll, Notification, NotificationType } from './types';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import PayrollPage from './pages/PayrollPage';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Snackbar from './components/Snackbar';
import LoadingScreen from './components/LoadingScreen';
import { DashboardSkeleton, TableSkeleton } from './components/Skeleton';

const STORAGE_KEY = 'propay_app_data';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEmployees(parsed.employees || []);
          setPayrolls(parsed.payrolls || []);
          setIsLoggedIn(parsed.isLoggedIn || false);
        } catch (e) {
          console.error("Session restoration failed");
        }
      }
      setIsInitializing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ employees, payrolls, isLoggedIn }));
    }
  }, [employees, payrolls, isLoggedIn, isInitializing]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    showNotification('Logged out successfully', 'info');
  };

  const handleRestoreData = (data: { employees: Employee[], payrolls: Payroll[] }) => {
    setEmployees(data.employees || []);
    setPayrolls(data.payrolls || []);
    showNotification('Database restored successfully!', 'success');
  };

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={() => { setIsLoggedIn(true); showNotification('Authenticated successfully'); }} />
        {notification && (
          <Snackbar 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </>
    );
  }

  return (
    <Router>
      <AppLayout 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        employees={employees}
        setEmployees={setEmployees}
        payrolls={payrolls}
        setPayrolls={setPayrolls}
        handleLogout={handleLogout}
        showNotification={showNotification}
        handleRestoreData={handleRestoreData}
      />
      {notification && (
        <Snackbar 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </Router>
  );
};

const AppLayout: React.FC<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  payrolls: Payroll[];
  setPayrolls: React.Dispatch<React.SetStateAction<Payroll[]>>;
  handleLogout: () => void;
  showNotification: (msg: string, type?: NotificationType) => void;
  handleRestoreData: (data: any) => void;
}> = ({ isSidebarOpen, setIsSidebarOpen, employees, setEmployees, payrolls, setPayrolls, handleLogout, showNotification, handleRestoreData }) => {
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  // Simulate page hydration on navigation
  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 500);
    
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    return () => clearTimeout(timer);
  }, [location.pathname, setIsSidebarOpen]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500 p-2 rounded-lg shadow-lg shadow-teal-500/20">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">ProPay</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarLink to="/employees" icon={<Users size={20} />} label="Employees" />
            <SidebarLink to="/payroll" icon={<PlusCircle size={20} />} label="Generate Payroll" />
            <SidebarLink to="/reports" icon={<FileText size={20} />} label="Reports" />
          </nav>
          <div className="p-4 mt-auto border-t border-slate-800">
            <div className="mb-4 px-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Admin User</span>
                <span className="text-[10px] text-slate-500">Super Administrator</span>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors group">
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors lg:hidden">
              <Menu size={24} />
            </button>
            <div className="font-bold text-slate-800 text-xl tracking-tight uppercase tracking-widest text-xs opacity-60">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname === '/employees' ? 'Staff Directory' :
               location.pathname === '/payroll' ? 'Payroll Engine' : 'Analytics & Reports'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm">
            <img src="https://picsum.photos/seed/admin/100" alt="avatar" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 pb-24 lg:pb-10">
          {isPageLoading ? (
            location.pathname === '/' ? <DashboardSkeleton /> : <TableSkeleton />
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard employees={employees} payrolls={payrolls} onRestore={handleRestoreData} showNotification={showNotification} />} />
              <Route path="/employees" element={<EmployeeList employees={employees} setEmployees={setEmployees} showNotification={showNotification} />} />
              <Route path="/payroll" element={<PayrollPage employees={employees} payrolls={payrolls} setPayrolls={setPayrolls} showNotification={showNotification} />} />
              <Route path="/reports" element={<Reports employees={employees} payrolls={payrolls} showNotification={showNotification} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 h-18 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-2 z-40 lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <BottomNavLink to="/" icon={<LayoutDashboard size={20} />} label="Home" />
          <BottomNavLink to="/employees" icon={<Users size={20} />} label="Staff" />
          <div className="relative -top-5">
            <Link to="/payroll" className="flex items-center justify-center w-14 h-14 bg-teal-500 rounded-2xl text-white shadow-lg shadow-teal-500/40 active:scale-95 transition-transform">
              <PlusCircle size={28} />
            </Link>
          </div>
          <BottomNavLink to="/payroll" icon={<PlusCircle size={20} className="opacity-0" />} label="Pay" />
          <BottomNavLink to="/reports" icon={<FileText size={20} />} label="Stats" />
        </nav>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-teal-500/10 text-teal-400 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
      <span className={`${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{icon}</span>
      <span className="text-sm">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shadow-glow" />}
    </Link>
  );
};

const BottomNavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  if (label === "Pay") return <div className="flex flex-col items-center justify-center w-16 h-full text-[10px] font-bold text-slate-400 mt-5">{label}</div>;
  return (
    <Link to={to} className={`flex flex-col items-center justify-center w-16 h-full transition-all ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>{icon}</div>
      <span className={`text-[10px] mt-1 font-bold tracking-wide uppercase ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      {isActive && <div className="w-1 h-1 rounded-full bg-teal-500 mt-1" />}
    </Link>
  );
};

export default App;
