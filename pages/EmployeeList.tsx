
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Briefcase, 
  IndianRupee,
  Users
} from 'lucide-react';
import { Employee, NotificationType } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  showNotification: (msg: string, type?: NotificationType) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, setEmployees, showNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    // Instead of raw confirm, we can use a custom UI later, but for now we'll keep it and use snackbar for result
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      showNotification('Employee deleted successfully', 'error');
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const employeeData: Employee = {
      id: editingEmployee?.id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      department: formData.get('department') as string,
      designation: formData.get('designation') as string,
      basicSalary: Number(formData.get('basicSalary')),
      hraPercent: Number(formData.get('hraPercent')),
      daPercent: Number(formData.get('daPercent')),
      otherAllowances: Number(formData.get('otherAllowances')),
      pfPercent: Number(formData.get('pfPercent')),
      taxPercent: Number(formData.get('taxPercent')),
      bankAccount: formData.get('bankAccount') as string,
      ifscCode: formData.get('ifscCode') as string,
      createdAt: editingEmployee?.createdAt || new Date().toISOString(),
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? employeeData : emp));
      showNotification(`${employeeData.fullName}'s profile updated successfully`);
    } else {
      setEmployees(prev => [...prev, employeeData]);
      showNotification(`${employeeData.fullName} registered successfully`);
    }
    
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Employee Directory</h2>
          <p className="text-slate-500">Manage your workforce profiles and salary structures.</p>
        </div>
        <button 
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Employee</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Contact Info</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Role & Salary</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{emp.fullName}</p>
                          <p className="text-xs text-teal-600 font-medium">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={12} /> {emp.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={12} /> {emp.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Briefcase size={14} className="text-slate-400" /> {emp.department} • {emp.designation}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal-600">
                          <IndianRupee size={12} /> {emp.basicSalary.toLocaleString()} Basic
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}
                          className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Users size={32} />
                      </div>
                      <p className="text-slate-500 text-sm">No employees found. Start by adding your first team member.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingEmployee ? 'Update Employee Profile' : 'Register New Employee'}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingEmployee(null); }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8">
              {/* Personal Section */}
              <div>
                <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4">Personal & Professional Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Full Name" name="fullName" defaultValue={editingEmployee?.fullName} required />
                  <InputField label="Email Address" name="email" type="email" defaultValue={editingEmployee?.email} required />
                  <InputField label="Phone Number" name="phone" defaultValue={editingEmployee?.phone} required />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Department</label>
                    <select name="department" defaultValue={editingEmployee?.department} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm">
                      <option>Engineering</option>
                      <option>Sales & Marketing</option>
                      <option>Human Resources</option>
                      <option>Product Management</option>
                      <option>Finance</option>
                      <option>Customer Success</option>
                    </select>
                  </div>
                  <InputField label="Designation" name="designation" defaultValue={editingEmployee?.designation} required />
                </div>
              </div>

              {/* Salary Section */}
              <div>
                <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4">Salary Structure</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Basic Salary" name="basicSalary" type="number" defaultValue={editingEmployee?.basicSalary.toString()} required />
                  <InputField label="HRA (%)" name="hraPercent" type="number" defaultValue={editingEmployee?.hraPercent.toString() || '10'} required />
                  <InputField label="DA (%)" name="daPercent" type="number" defaultValue={editingEmployee?.daPercent.toString() || '5'} required />
                  <InputField label="Other Allowances" name="otherAllowances" type="number" defaultValue={editingEmployee?.otherAllowances.toString() || '2000'} required />
                  <InputField label="PF Contribution (%)" name="pfPercent" type="number" defaultValue={editingEmployee?.pfPercent.toString() || '12'} required />
                  <InputField label="Income Tax (%)" name="taxPercent" type="number" defaultValue={editingEmployee?.taxPercent.toString() || '5'} required />
                </div>
              </div>

              {/* Banking Section */}
              <div>
                <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4">Banking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Bank Account Number" name="bankAccount" defaultValue={editingEmployee?.bankAccount} required />
                  <InputField label="IFSC Code" name="ifscCode" defaultValue={editingEmployee?.ifscCode} required />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all"
                >
                  {editingEmployee ? 'Update Profile' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField: React.FC<{ label: string, name: string, type?: string, defaultValue?: string, required?: boolean }> = ({ label, name, type = 'text', defaultValue, required }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <input 
      type={type} 
      name={name}
      defaultValue={defaultValue}
      required={required}
      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm transition-all placeholder:text-slate-400"
    />
  </div>
);

export default EmployeeList;
