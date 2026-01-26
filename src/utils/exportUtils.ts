import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import type { Payment, PaymentHistoryEntry } from '../types';

export const exportToCSV = (payments: Payment[], history?: PaymentHistoryEntry[]) => {
  const data = payments.map(payment => ({
    Title: payment.title,
    Description: payment.description || '',
    Type: payment.type,
    Period: payment.period || '',
    Priority: payment.priority,
    Due_Date: payment.dueDate,
    Status: payment.status,
    Total_Amount: payment.totalAmount,
    Amount_Paid: payment.amountPaid,
    Remaining: payment.totalAmount - payment.amountPaid,
    Payment_Date: payment.paymentDate || '',
    Notes: payment.notes || '',
    Reminder_Days: payment.reminderDays?.join(', ') || '',
    Created_At: payment.createdAt
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payments');

  if (history && history.length > 0) {
    const historyData = history.map(entry => ({
      Payment_ID: entry.paymentId,
      Action: entry.action,
      Timestamp: entry.timestamp,
      Changes: JSON.stringify(entry.changes),
      Previous_Values: entry.previousValues ? JSON.stringify(entry.previousValues) : ''
    }));
    const historyWs = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, historyWs, 'History');
  }

  XLSX.writeFile(wb, `glasspay_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (payments: Payment[], history?: PaymentHistoryEntry[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.text('GlassPay Payment Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Summary
  doc.setFontSize(14);
  doc.text('Summary', 20, yPosition);
  yPosition += 10;

  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const totalAmount = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  doc.setFontSize(10);
  doc.text(`Total Payments: ${totalPayments}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Paid Payments: ${paidPayments}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Total Paid: $${totalPaid.toFixed(2)}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Remaining: $${(totalAmount - totalPaid).toFixed(2)}`, 20, yPosition);
  yPosition += 20;

  // Payments table
  doc.setFontSize(14);
  doc.text('Payments', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(8);
  const headers = ['Title', 'Type', 'Due Date', 'Status', 'Total', 'Paid', 'Remaining'];
  const colWidths = [40, 20, 25, 20, 20, 20, 25];
  let xPosition = 20;

  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += colWidths[index];
  });

  yPosition += 5;
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;

  payments.forEach(payment => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    xPosition = 20;
    const data = [
      payment.title.substring(0, 15) + (payment.title.length > 15 ? '...' : ''),
      payment.type,
      new Date(payment.dueDate).toLocaleDateString(),
      payment.status,
      `$${payment.totalAmount.toFixed(2)}`,
      `$${payment.amountPaid.toFixed(2)}`,
      `$${(payment.totalAmount - payment.amountPaid).toFixed(2)}`
    ];

    data.forEach((value, index) => {
      doc.text(value, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    yPosition += 8;
  });

  // History section if included
  if (history && history.length > 0) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 20;
    doc.setFontSize(14);
    doc.text('Payment History', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    history.slice(0, 20).forEach(entry => { // Limit to 20 entries for PDF
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(`${entry.action} - ${new Date(entry.timestamp).toLocaleDateString()}`, 20, yPosition);
      yPosition += 6;
    });
  }

  doc.save(`glasspay_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const filterPaymentsByDateRange = (payments: Payment[], dateRange?: { start: string; end: string }) => {
  if (!dateRange?.start || !dateRange?.end) return payments;

  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  return payments.filter(payment => {
    const dueDate = new Date(payment.dueDate);
    return dueDate >= start && dueDate <= end;
  });
};