
import React, { useState } from 'react';
import { ChevronDown, Edit2, Trash2, CreditCard, Calendar, RotateCcw } from 'lucide-react';
import type { Payment } from '../types';

interface PaymentCardProps {
  payment: Payment;
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onEdit, onDelete, onPay }) => {
  const [isOpen, setIsOpen] = useState(false);

  const calculateTimeProgress = () => {
    const created = new Date(payment.createdAt).getTime();
    const due = new Date(payment.dueDate).getTime();
    const now = new Date().getTime();

    if (now >= due) return 100;
    const total = due - created;
    const elapsed = now - created;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const timeProgress = calculateTimeProgress();
  const paymentProgress = (payment.amountPaid / payment.totalAmount) * 100 || 0;
  const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case 'Urgent': return 'text-red-500 bg-red-500/10 ring-1 ring-red-500/20';
      case 'Critical': return 'text-orange-500 bg-orange-500/10 ring-1 ring-orange-500/20';
      case 'High': return 'text-violet-500 bg-violet-500/10 ring-1 ring-violet-500/20';
      case 'Medium': return 'text-sky-500 bg-sky-500/10 ring-1 ring-sky-500/20';
      case 'Low': return 'text-slate-500 bg-slate-500/10 ring-1 ring-slate-500/20';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className={`glass-card rounded-[1.5rem] overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-sky-500/30 shadow-2xl' : 'hover:bg-white/50 dark:hover:bg-white/5 shadow-sm'}`}>
      <div
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: payment.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-extrabold text-secondary truncate text-base tracking-tight leading-tight">{payment.title}</h3>
              {payment.type === 'Recurring' && (
                <RotateCcw size={12} className="text-sky-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${getPriorityStyles(payment.priority)}`}>
                {payment.priority}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : payment.status === 'paid' ? 'text-emerald-500' : 'text-slate-400 dark:text-gray-500'}`}>
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-20 sm:w-28 shrink-0 flex flex-col items-end">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${payment.status === 'paid' ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-sky-500'}`}
                style={{ width: `${timeProgress}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter mt-1">
              {payment.status === 'paid' ? 'Completed' : `${100 - Math.round(timeProgress)}% time`}
            </span>
          </div>

          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-500' : 'text-slate-400 dark:text-gray-500'}`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-white/10 dark:border-white/5 pt-5 mt-1">
          <div className="space-y-6">
            {payment.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {payment.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass bg-white/30 dark:bg-white/5 p-4 rounded-2xl">
                <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Calendar size={12} /> Due Date
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {new Date(payment.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="glass bg-white/30 dark:bg-white/5 p-4 rounded-2xl">
                <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <CreditCard size={12} /> Payment Plan
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ${payment.amountPaid.toFixed(2)} <span className="text-slate-400 dark:text-gray-600 font-medium">/ ${payment.totalAmount.toFixed(2)}</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-500">{Math.round(paymentProgress)}%</span>
                </div>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onPay(); }}
                disabled={payment.status === 'paid'}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-sky-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/30 hover:bg-sky-600 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98]"
              >
                <CreditCard size={16} />
                {payment.status === 'paid' ? 'Fully Paid' : 'Make Payment'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-4 glass rounded-2xl text-gray-500 dark:text-gray-400 hover:text-sky-500 hover:bg-white/50 transition-all active:scale-95"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-4 glass rounded-2xl text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-white/50 transition-all active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCard;
