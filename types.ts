
export interface Employee {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  basicSalary: number;
  hraPercent: number;
  daPercent: number;
  otherAllowances: number;
  pfPercent: number;
  taxPercent: number;
  bankAccount: string;
  ifscCode: string;
  createdAt: string;
}

export interface Payroll {
  id: string;
  uid: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  da: number;
  allowances: number;
  grossSalary: number;
  pf: number;
  tax: number;
  totalDeductions: number;
  netSalary: number;
  generatedDate: string;
}

export interface AppState {
  isLoggedIn: boolean;
  employees: Employee[];
  payrolls: Payroll[];
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
}
