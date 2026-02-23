
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
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { User as FirebaseUser } from 'firebase/auth';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    setNotification({ message, type });
  }, []);

  // Auth Listener
  useEffect(() => {
    if (!auth) {
      setIsInitializing(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setEmployees([]);
        setPayrolls([]);
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!isLoggedIn || !db || !currentUser) return;

    const userId = currentUser.uid;

    // Listen to Employees
    const empQuery = query(collection(db, 'employees'), where('uid', '==', userId));
    const empUnsub = onSnapshot(empQuery, (snapshot) => {
      const emps = snapshot.docs.map(doc => doc.data() as Employee);
      setEmployees(emps);
    }, (error) => {
      console.error("Employee fetch error:", error);
      if (error.code === 'permission-denied') {
        showNotification("Permission denied. Please check your account access.", 'error');
      }
    });

    // Listen to Payrolls
    const payrollQuery = query(collection(db, 'payrolls'), where('uid', '==', userId));
    const payrollUnsub = onSnapshot(payrollQuery, (snapshot) => {
      const pays = snapshot.docs.map(doc => doc.data() as Payroll);
      setPayrolls(pays);
    }, (error) => {
       console.error("Payroll fetch error:", error);
    });

    return () => {
      empUnsub();
      payrollUnsub();
    };
  }, [isLoggedIn, currentUser]);

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
      showNotification('Logged out successfully', 'info');
    }
  };

  const handleRestoreData = () => {
    // Legacy placeholder, now handled in Dashboard.tsx via direct DB write
    showNotification('Use the Restore button in Dashboard to import data.', 'info');
  };

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!auth || !db) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Wallet size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Configuration Required</h1>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Please set up your Firebase configuration in the <code>.env</code> file to continue. 
            You need to provide your API Key, Project ID, and other details.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs font-mono text-slate-500 overflow-x-auto mb-6">
            VITE_FIREBASE_API_KEY=...<br/>
            VITE_FIREBASE_AUTH_DOMAIN=...<br/>
            VITE_FIREBASE_PROJECT_ID=...
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={() => { /* Handled by auth state listener */ }} />
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
        payrolls={payrolls}
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
  payrolls: Payroll[];
  handleLogout: () => void;
  showNotification: (msg: string, type?: NotificationType) => void;
  handleRestoreData: (data: any) => void;
}> = ({ isSidebarOpen, setIsSidebarOpen, employees, payrolls, handleLogout, showNotification, handleRestoreData }) => {
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
              <Route path="/employees" element={<EmployeeList employees={employees} showNotification={showNotification} />} />
              <Route path="/payroll" element={<PayrollPage employees={employees} payrolls={payrolls} showNotification={showNotification} />} />
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
