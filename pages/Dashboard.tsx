
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Database,
  Download,
  Upload
} from 'lucide-react';
import { Employee, Payroll, NotificationType } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DashboardProps {
  employees: Employee[];
  payrolls: Payroll[];
  onRestore: (data: any) => void;
  showNotification: (msg: string, type?: NotificationType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, payrolls, onRestore, showNotification }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalEmployees = employees.length;
  const totalPayout = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalTax = payrolls.reduce((sum, p) => sum + p.tax, 0);
  const avgSalary = totalEmployees > 0 ? (totalPayout / (payrolls.length || 1)) : 0;

  const recentPayrolls = [...payrolls].sort((a, b) => 
    new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
  ).slice(0, 5);

  const handleExportData = () => {
    const data = { employees, payrolls, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `propay_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Backup generated successfully');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.employees && json.payrolls) {
          onRestore(json);
        } else {
          showNotification('Invalid backup file format', 'error');
        }
      } catch (err) {
        showNotification('Error parsing backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview Dashboard</h2>
          <p className="text-slate-500">Welcome back, here's what's happening with payroll today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard label="Total Staff" value={totalEmployees.toString()} icon={<Users className="text-blue-600" />} trend="+4.5%" color="blue" />
        <StatsCard label="Net Payout" value={formatCurrency(totalPayout)} icon={<DollarSign className="text-teal-600" />} trend="+12%" color="teal" />
        <StatsCard label="Tax Total" value={formatCurrency(totalTax)} icon={<CreditCard className="text-orange-600" />} trend="+2.1%" color="orange" />
        <StatsCard label="Avg. Salary" value={formatCurrency(avgSalary)} icon={<TrendingUp className="text-purple-600" />} trend="-0.8%" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Payrolls</h3>
            <button onClick={() => navigate('/reports')} className="text-teal-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayrolls.length > 0 ? (
                  recentPayrolls.map((payroll) => {
                    const emp = employees.find(e => e.id === payroll.employeeId);
                    return (
                      <tr key={payroll.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                              {emp?.fullName.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{emp?.fullName || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-400 uppercase">{emp?.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-medium text-slate-500">{payroll.month} {payroll.year}</td>
                        <td className="py-4 text-sm font-bold text-slate-800">{formatCurrency(payroll.netSalary)}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                            Sent
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={4} className="py-10 text-center text-slate-400 text-sm">No payroll records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <QuickAction icon={<Users className="text-blue-600" />} title="Add Employee" desc="Onboard team member" color="bg-blue-50" onClick={() => navigate('/employees')} />
              <QuickAction icon={<CreditCard className="text-teal-600" />} title="Process Pay" desc="Run monthly payroll" color="bg-teal-50" onClick={() => navigate('/payroll')} />
              <QuickAction icon={<FileText className="text-orange-600" />} title="Reports" desc="Export CSV data" color="bg-orange-50" onClick={() => navigate('/reports')} />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 text-white relative overflow-hidden group">
            <Database className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-800/50 group-hover:rotate-12 transition-transform duration-500" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Database size={20} className="text-teal-400" />
                System Storage
              </h3>
              <p className="text-xs text-slate-400 mb-6">Manage your local database backup to prevent data loss.</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleExportData}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  <Download size={14} /> Backup
                </button>
                <button 
                  onClick={handleImportClick}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-xl text-xs font-bold transition-all"
                >
                  <Upload size={14} /> Restore
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon, trend, color }: any) => {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-teal-100 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl transition-colors ${
          color === 'blue' ? 'bg-blue-50 group-hover:bg-blue-100' : 
          color === 'teal' ? 'bg-teal-50 group-hover:bg-teal-100' : 
          color === 'orange' ? 'bg-orange-50 group-hover:bg-orange-100' : 
          'bg-purple-50 group-hover:bg-purple-100'
        }`}>{icon}</div>
        <div className={`text-xs font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  );
};

const QuickAction = ({ icon, title, desc, color, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-slate-50 transition-all text-left group">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>{icon}</div>
    <div className="min-w-0">
      <p className="font-bold text-slate-800 text-sm truncate">{title}</p>
      <p className="text-[10px] text-slate-400 truncate uppercase font-medium">{desc}</p>
    </div>
    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

const ChevronRight = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Dashboard;
