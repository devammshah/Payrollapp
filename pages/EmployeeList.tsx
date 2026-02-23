
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
import { auth, db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface EmployeeListProps {
  employees: Employee[];
  showNotification: (msg: string, type?: NotificationType) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, showNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        showNotification('Employee deleted successfully', 'success');
      } catch (e) {
        console.error(e);
        showNotification('Failed to delete employee', 'error');
      }
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIdError(null);
    const formData = new FormData(e.currentTarget);
    
    const empId = formData.get('id') as string;

    // Validation: Format EMP-XXXX
    const idRegex = /^EMP-\d{4}$/;
    if (!idRegex.test(empId)) {
      setIdError('Format must be EMP-XXXX (e.g., EMP-1234)');
      return;
    }

    // Validation: Uniqueness
    const isDuplicate = employees.some(emp => emp.id === empId && emp.id !== editingEmployee?.id);
    if (isDuplicate) {
      setIdError('This Employee ID is already in use');
      return;
    }

    if (!auth?.currentUser) {
      showNotification('You must be logged in to save data', 'error');
      return;
    }

    setIsSaving(true);

    const employeeData: Employee = {
      id: empId,
      uid: auth.currentUser.uid,
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

    try {
      if (editingEmployee) {
        const ref = doc(db, 'employees', editingEmployee.id);
        // We can't update 'id' field of the doc easily if it's the key, but we store id inside doc too
        await updateDoc(ref, { ...employeeData });
        showNotification(`${employeeData.fullName}'s profile updated successfully`);
      } else {
        // Use setDoc to define the ID of the document to match our custom ID format
        await setDoc(doc(db, 'employees', empId), employeeData);
        showNotification(`${employeeData.fullName} registered successfully`);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (e) {
      console.error(e);
      showNotification('Error saving employee data', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Employee Directory</h2>
          <p className="text-slate-500">Manage your workforce profiles and salary structures.</p>
        </div>
        <button 
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); setIdError(null); }}
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
                          onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); setIdError(null); }}
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
                onClick={() => { setIsModalOpen(false); setEditingEmployee(null); setIdError(null); }}
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
                  <InputField 
                    label="Employee ID" 
                    name="id" 
                    defaultValue={editingEmployee?.id} 
                    required 
                    placeholder="EMP-1234"
                    error={idError || undefined}
                    readOnly={!!editingEmployee}
                  />
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
                  onClick={() => { setIsModalOpen(false); setIdError(null); }}
                  disabled={isSaving}
                  className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : (editingEmployee ? 'Update Profile' : 'Save Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField: React.FC<{ 
  label: string, 
  name: string, 
  type?: string, 
  defaultValue?: string, 
  required?: boolean,
  placeholder?: string,
  error?: string,
  readOnly?: boolean
}> = ({ label, name, type = 'text', defaultValue, required, placeholder, error, readOnly }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <input 
      type={type} 
      name={name}
      defaultValue={defaultValue}
      required={required}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-4 py-2.5 border ${error ? 'border-red-500' : 'border-slate-300'} rounded-xl focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-teal-500'} outline-none text-sm transition-all placeholder:text-slate-400 ${readOnly ? 'bg-slate-50 cursor-not-allowed' : ''}`}
    />
    {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

export default EmployeeList;
