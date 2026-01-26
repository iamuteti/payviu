
export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentType = 'Onetime' | 'Recurring';
export type PaymentPeriod = 'weekly' | 'biweekly' | 'monthly' | 'semi-annually' | 'annually';
export type PaymentPriority = 'Urgent' | 'Critical' | 'High' | 'Medium' | 'Low';

export interface Payment {
  id: string;
  title: string;
  description: string;
  type: PaymentType;
  period?: PaymentPeriod;
  priority: PaymentPriority;
  dueDate: string;
  color: string;
  status: PaymentStatus;
  totalAmount: number;
  amountPaid: number;
  createdAt: string;
  paymentDate?: string;
  userId: string;
  notes?: string;
  reminderDays?: number[];
}

export interface PaymentHistoryEntry {
  id: string;
  paymentId: string;
  userId: string;
  action: 'created' | 'updated' | 'paid' | 'deleted';
  timestamp: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includeHistory?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}
