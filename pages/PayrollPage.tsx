
import React, { useState } from 'react';
import { FilePlus, Calculator, Calendar, Download, AlertCircle } from 'lucide-react';
import { Employee, Payroll, NotificationType } from '../types';
import { calculateSalary, formatCurrency } from '../utils/calculations';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import { db, auth } from '../firebase';
import { addDoc, collection, setDoc, doc } from 'firebase/firestore';

interface PayrollPageProps {
  employees: Employee[];
  payrolls: Payroll[];
  showNotification: (msg: string, type?: NotificationType) => void;
}

const PayrollPage: React.FC<PayrollPageProps> = ({ employees, payrolls, showNotification }) => {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState(new Date().getFullYear());
  const [isProcessing, setIsProcessing] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025];

  const handleGenerate = async () => {
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) {
      showNotification('Please select an employee first.', 'error');
      return;
    }

    const exists = payrolls.find(p => p.employeeId === selectedEmpId && p.month === month && p.year === year);
    if (exists) {
      showNotification(`Payroll for ${emp.fullName} for ${month} ${year} already exists!`, 'error');
      return;
    }

    setIsProcessing(true);
    const newPayroll = calculateSalary(emp, month, year);
    
    if (auth?.currentUser) {
      newPayroll.uid = auth.currentUser.uid;
    } else {
      showNotification('You must be logged in to generate payroll', 'error');
      setIsProcessing(false);
      return;
    }

    try {
      // Use setDoc to ensure ID consistency or let addDoc generate one. 
      // Using setDoc with newPayroll.id ensures we control the ID format if defined in util, 
      // but standard practice is let Firestore generate or use a composite key.
      // Here newPayroll.id is `PAY-${Date.now()}` which is unique enough.
      await setDoc(doc(db, 'payrolls', newPayroll.id), newPayroll);
      showNotification(`Payroll generated for ${emp.fullName} (${month} ${year})`);
    } catch (error) {
      console.error(error);
      showNotification('Failed to save payroll record.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRecentPayrolls = () => {
    return [...payrolls].sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()).slice(0, 10);
  };

  const handleDownload = (emp: Employee, pay: Payroll) => {
    generatePayslipPDF(emp, pay);
    showNotification('Downloading payslip PDF...');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Process Monthly Payroll</h2>
          <p className="text-slate-500">Generate automated salary slips based on employee configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-teal-600">
              <Calculator size={24} />
              <h3 className="text-lg font-bold text-slate-800">New Entry</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Select Employee</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                >
                  <option value="">Choose an employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Month</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Year</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {selectedEmpId && (
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Base Salary</span>
                    <span>{formatCurrency(employees.find(e => e.id === selectedEmpId)?.basicSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Est. Deductions</span>
                    <span>~{formatCurrency((employees.find(e => e.id === selectedEmpId)?.basicSalary || 0) * 0.15)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-800">
                    <span>Estimated Net</span>
                    <span className="text-teal-600">~{formatCurrency((employees.find(e => e.id === selectedEmpId)?.basicSalary || 0) * 0.85)}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={!selectedEmpId || isProcessing}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <FilePlus size={20} />
                    Generate Payroll
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Policy Notice</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Payroll calculations are finalized at midnight on the 25th of each month. Manual adjustments can be made until the 30th.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Generations List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Recently Generated Slips</h3>
              <Calendar size={20} className="text-slate-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Employee</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Period</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Net Pay</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getRecentPayrolls().length > 0 ? (
                    getRecentPayrolls().map((pay) => {
                      const emp = employees.find(e => e.id === pay.employeeId);
                      return (
                        <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-xs font-bold text-teal-600">
                                {emp?.fullName.charAt(0) || '?'}
                              </div>
                              <span className="font-medium text-slate-800">{emp?.fullName || 'Removed Emp'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                            {pay.month} {pay.year}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {formatCurrency(pay.netSalary)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => emp && handleDownload(emp, pay)}
                              className="text-teal-600 hover:text-teal-700 flex items-center justify-end gap-1 text-sm font-bold group"
                            >
                              <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                              PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="max-w-xs mx-auto space-y-2">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <FilePlus size={24} />
                          </div>
                          <p className="text-slate-500 text-sm">No payrolls generated recently.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
