
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, CreditCard, Calendar, RotateCcw } from 'lucide-react';
import type { Payment } from '../types';

interface PaymentCardProps {
  payment: Payment;
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onEdit, onDelete, onPay }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Progress Calculation (Time)
  const calculateProgress = () => {
    const created = new Date(payment.createdAt).getTime();
    const due = new Date(payment.dueDate).getTime();
    const now = new Date().getTime();
    
    if (now >= due) return 100;
    if (now <= created) return 0;
    
    const total = due - created;
    const elapsed = now - created;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const progress = calculateProgress();
  const paymentProgress = (payment.amountPaid / payment.totalAmount) * 100 || 0;

  const getPriorityStyles = (p: string) => {
    switch(p) {
      case 'Urgent': return 'text-red-600 bg-red-100/50 ring-1 ring-red-200';
      case 'Critical': return 'text-orange-600 bg-orange-100/50 ring-1 ring-orange-200';
      case 'High': return 'text-violet-600 bg-violet-100/50 ring-1 ring-violet-200';
      case 'Medium': return 'text-sky-600 bg-sky-100/50 ring-1 ring-sky-200';
      case 'Low': return 'text-slate-600 bg-slate-100/50 ring-1 ring-slate-200';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-lg ring-1 ring-white/60 bg-white/40' : 'shadow-sm'}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer active:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: payment.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-bold text-gray-800 truncate text-sm leading-tight">{payment.title}</h3>
              {payment.type === 'Recurring' && (
                <RotateCcw size={12} className="text-sky-400 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityStyles(payment.priority)}`}>
                {payment.priority}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${payment.status === 'overdue' ? 'text-red-500' : payment.status === 'paid' ? 'text-emerald-500' : 'text-gray-400'}`}>
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        <div className="w-20 ml-3 shrink-0 flex flex-col items-center">
          <div className="h-1.5 w-full bg-gray-200/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${progress > 80 && payment.status !== 'paid' ? 'bg-rose-400' : 'bg-sky-400'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
            {payment.status === 'paid' ? 'Completed' : `${100 - Math.round(progress)}% Time Left`}
          </div>
        </div>

        <div className="ml-4 text-gray-300">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-white/40 mb-4" />
          
          <div className="space-y-4">
            {payment.description && (
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {payment.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="glass bg-white/20 p-3 rounded-xl">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Calendar size={10} /> Due Date
                </div>
                <div className="text-xs font-bold text-gray-700">
                  {new Date(payment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="glass bg-white/20 p-3 rounded-xl">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <CreditCard size={10} /> Progress
                </div>
                <div className="text-xs font-bold text-gray-700">
                  ${payment.amountPaid.toFixed(2)} / <span className="text-gray-400">${payment.totalAmount.toFixed(2)}</span>
                </div>
                <div className="h-1 w-full bg-gray-200/40 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-700" 
                    style={{ width: `${paymentProgress}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onPay(); }}
                disabled={payment.status === 'paid'}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-50 hover:bg-sky-600 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
              >
                <CreditCard size={14} />
                {payment.status === 'paid' ? 'Fully Paid' : 'Pay Now'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-3 glass text-gray-500 rounded-xl hover:text-sky-500 transition-colors active:scale-95"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-3 glass text-gray-500 rounded-xl hover:text-red-500 transition-colors active:scale-95"
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
