
import React, { useState } from 'react';
import { Filter, Download, PieChart, IndianRupee, FileText } from 'lucide-react';
import { Employee, Payroll, NotificationType } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ReportsProps {
  employees: Employee[];
  payrolls: Payroll[];
  showNotification: (msg: string, type?: NotificationType) => void;
}

const Reports: React.FC<ReportsProps> = ({ employees, payrolls, showNotification }) => {
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterDept, setFilterDept] = useState('All');

  const filteredPayrolls = payrolls.filter(pay => {
    const emp = employees.find(e => e.id === pay.employeeId);
    const monthMatch = filterMonth === 'All' || pay.month === filterMonth;
    const deptMatch = filterDept === 'All' || emp?.department === filterDept;
    return monthMatch && deptMatch;
  });

  const totalPayout = filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalTax = filteredPayrolls.reduce((sum, p) => sum + p.tax, 0);
  const totalPF = filteredPayrolls.reduce((sum, p) => sum + p.pf, 0);

  const months = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department)))];

  const handleExportCSV = () => {
    if (filteredPayrolls.length === 0) {
      showNotification("No data available to export with current filters.", 'error');
      return;
    }

    const headers = ["Emp ID", "Employee Name", "Department", "Designation", "Period", "Gross Salary", "Total Deductions", "Net Salary"];
    const rows = filteredPayrolls.map(pay => {
      const emp = employees.find(e => e.id === pay.employeeId);
      return [
        pay.employeeId,
        `"${emp?.fullName || 'N/A'}"`,
        emp?.department || 'N/A',
        emp?.designation || 'N/A',
        `${pay.month} ${pay.year}`,
        pay.grossSalary.toFixed(2),
        pay.totalDeductions.toFixed(2),
        pay.netSalary.toFixed(2)
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ProPay_Payroll_Report_${filterMonth}_${filterDept}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('CSV Report exported successfully');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Reports</h2>
          <p className="text-slate-500">Analyze salary distributions and statutory compliance.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium pr-4 border-r border-slate-100">
          <Filter size={18} />
          Filters
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month</label>
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          label="Total Net Payout" 
          value={formatCurrency(totalPayout)} 
          color="teal" 
          icon={<IndianRupee />} 
        />
        <SummaryCard 
          label="Estimated Income Tax" 
          value={formatCurrency(totalTax)} 
          color="orange" 
          icon={<PieChart />} 
        />
        <SummaryCard 
          label="Employee PF (Statutory)" 
          value={formatCurrency(totalPF)} 
          color="blue" 
          icon={<FileText />} 
        />
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Payroll Disbursement Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Emp ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Employee Name</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Period</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Gross</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Deductions</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right font-bold">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayrolls.length > 0 ? (
                filteredPayrolls.map((pay) => {
                  const emp = employees.find(e => e.id === pay.employeeId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-teal-600">{pay.employeeId}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{emp?.fullName || 'N/A'}</span>
                          <span className="text-xs text-slate-500">{emp?.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{pay.month} {pay.year}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-slate-700">{formatCurrency(pay.grossSalary)}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-500 font-medium">{formatCurrency(pay.totalDeductions)}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-teal-700">{formatCurrency(pay.netSalary)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    No payroll records matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredPayrolls.length > 0 && (
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={5} className="px-6 py-4 font-bold text-slate-700 text-right">Grand Total:</td>
                  <td className="px-6 py-4 font-bold text-teal-600 text-right text-lg">{formatCurrency(totalPayout)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string, value: string, color: 'teal' | 'orange' | 'blue', icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-1 h-full ${
      color === 'teal' ? 'bg-teal-500' : color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
    }`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${
        color === 'teal' ? 'bg-teal-50 text-teal-600' : color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
      } group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Reports;
