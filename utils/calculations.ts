
import { Employee, Payroll } from '../types';

export const calculateSalary = (employee: Employee, month: string, year: number): Payroll => {
  const basic = employee.basicSalary;
  const hra = (basic * employee.hraPercent) / 100;
  const da = (basic * employee.daPercent) / 100;
  const allowances = employee.otherAllowances;
  
  const grossSalary = basic + hra + da + allowances;
  
  const pf = (basic * employee.pfPercent) / 100;
  const tax = (grossSalary * employee.taxPercent) / 100;
  const totalDeductions = pf + tax;
  
  const netSalary = grossSalary - totalDeductions;

  return {
    id: `PAY-${Date.now()}`,
    employeeId: employee.id,
    month,
    year,
    basicSalary: basic,
    hra,
    da,
    allowances,
    grossSalary,
    pf,
    tax,
    totalDeductions,
    netSalary,
    generatedDate: new Date().toISOString()
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};
