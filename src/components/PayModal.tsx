
import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import type { Payment } from '../types';

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: Payment;
  onPay: (amount: number) => void;
}

const PayModal: React.FC<PayModalProps> = ({ isOpen, onClose, payment, onPay }) => {
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    if (payment) {
      setAmount((payment.totalAmount - payment.amountPaid).toFixed(2));
    }
  }, [payment, isOpen]);

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    onPay(val);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm glass-card bg-white/95 dark:bg-slate-900/95 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Make Payment</h2>
          <button onClick={onClose} className="p-2 glass rounded-xl text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 font-medium">
          Paying for <span className="font-bold text-gray-900 dark:text-white">{payment.title}</span>.
          Remaining balance: <span className="text-emerald-500 font-bold">${(payment.totalAmount - payment.amountPaid).toFixed(2)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
            <input
              autoFocus
              type="number"
              step="0.01"
              className="w-full pl-12 pr-4 py-5 glass-card bg-gray-50 dark:bg-white/5 text-3xl font-black text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none placeholder-gray-300 transition-all"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 glass rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[1.5] py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayModal;
