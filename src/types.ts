
export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentType = 'Onetime' | 'Recurring';
export type PaymentPriority = 'Urgent' | 'Critical' | 'High' | 'Medium' | 'Low';

export interface Payment {
  id: string;
  title: string;
  description: string;
  type: PaymentType;
  priority: PaymentPriority;
  dueDate: string;
  color: string;
  status: PaymentStatus;
  totalAmount: number;
  amountPaid: number;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}
