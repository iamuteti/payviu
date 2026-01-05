
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm glass bg-white/95 p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Make Payment</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={18} />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Paying for <span className="font-semibold text-gray-700">{payment.title}</span>. 
          Total remaining: ${(payment.totalAmount - payment.amountPaid).toFixed(2)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input 
              autoFocus
              type="number" 
              step="0.01"
              className="w-full pl-12 pr-4 py-4 glass-card bg-gray-50 text-2xl font-bold text-gray-800 rounded-xl focus:ring-2 focus:ring-sky-200 outline-none placeholder-gray-300"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 glass rounded-xl font-semibold text-gray-600 active:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all"
            >
              Pay Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayModal;
