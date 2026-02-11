
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, Payroll } from '../types';
import { formatCurrency } from './calculations';

export const generatePayslipPDF = (employee: Employee, payroll: Payroll) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 118, 110); // Teal
  doc.text('ProPay Solutions Private Limited', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('123 Tech Park, Financial District, Hyderabad - 500032', 105, 28, { align: 'center' });
  doc.line(20, 35, 190, 35);
  
  // Salary Slip Title
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`Salary Slip for ${payroll.month} ${payroll.year}`, 105, 45, { align: 'center' });
  
  // Employee Details Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details', 20, 60);
  doc.setFont('helvetica', 'normal');
  
  const employeeDetails = [
    ['Employee Name', employee.fullName, 'Employee ID', employee.id],
    ['Department', employee.department, 'Designation', employee.designation],
    ['Bank Name', 'HDFC Bank', 'Account No', employee.bankAccount],
    ['IFSC Code', employee.ifscCode, 'Email', employee.email]
  ];
  
  autoTable(doc, {
    startY: 65,
    body: employeeDetails,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 35 }, 2: { fontStyle: 'bold', width: 35 } }
  });
  
  // Earnings & Deductions Table
  const tableData = [
    ['Earnings', 'Amount', 'Deductions', 'Amount'],
    ['Basic Salary', formatCurrency(payroll.basicSalary), 'Provident Fund (PF)', formatCurrency(payroll.pf)],
    ['HRA', formatCurrency(payroll.hra), 'Income Tax', formatCurrency(payroll.tax)],
    ['DA', formatCurrency(payroll.da), '', ''],
    ['Other Allowances', formatCurrency(payroll.allowances), '', ''],
    ['Gross Earnings', formatCurrency(payroll.grossSalary), 'Total Deductions', formatCurrency(payroll.totalDeductions)]
  ];
  
  const lastY = (doc as any).lastAutoTable?.finalY || 100;

  autoTable(doc, {
    startY: lastY + 10,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
    styles: { fontSize: 10 }
  });
  
  // Net Salary
  const finalY = (doc as any).lastAutoTable?.finalY + 15 || 200;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(20, finalY - 8, 170, 12, 'F');
  doc.text(`NET SALARY PAYABLE: ${formatCurrency(payroll.netSalary)}`, 105, finalY, { align: 'center' });
  
  // Footer / Signature
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated document and does not require a physical signature.', 105, 260, { align: 'center' });
  doc.text('Generated on: ' + new Date(payroll.generatedDate).toLocaleDateString(), 20, 280);
  doc.text('Authorised Signatory', 160, 280);
  doc.line(150, 275, 190, 275);
  
  doc.save(`Payslip_${employee.fullName.replace(/\s+/g, '_')}_${payroll.month}_${payroll.year}.pdf`);
};
