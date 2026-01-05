
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import type { Payment, PaymentType, PaymentStatus, PaymentPriority } from '../types';
import { COLORS } from '../constants';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Payment>) => void;
  initialData?: Payment;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Payment>>({
    title: '',
    description: '',
    type: 'Onetime',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    color: COLORS[0].value,
    status: 'pending',
    totalAmount: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'Onetime',
        priority: 'Medium',
        dueDate: new Date().toISOString().split('T')[0],
        color: COLORS[0].value,
        status: 'pending',
        totalAmount: 0,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl glass-card bg-white/95 dark:bg-slate-900/95 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[95vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {initialData ? 'Update Record' : 'Add Payment'}
          </h2>
          <button onClick={onClose} className="p-3 glass rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Payment Title</label>
            <input
              required
              type="text"
              className="w-full px-6 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500/40 outline-none text-base font-bold text-gray-900 dark:text-white transition-all placeholder-gray-400"
              placeholder="e.g. Monthly Rent"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Total Amount ($)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                required
                type="number"
                step="0.01"
                className="w-full pl-10 pr-6 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500/40 outline-none text-base font-bold text-gray-900 dark:text-white transition-all"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Type</label>
              <select
                className="w-full px-6 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 outline-none text-base font-bold text-gray-900 dark:text-white cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as PaymentType })}
              >
                <option value="Onetime">One-time</option>
                <option value="Recurring">Recurring</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Priority</label>
              <select
                className="w-full px-6 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 outline-none text-base font-bold text-gray-900 dark:text-white cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as PaymentPriority })}
              >
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Due Date</label>
              <div className="relative">
                <DatePicker
                  selected={formData.dueDate ? new Date(formData.dueDate) : new Date()}
                  onChange={(date: Date | null) => {
                    if (date) setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
                  }}
                  dateFormat="MMM d, yyyy"
                  className="w-full px-6 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 outline-none text-base font-bold text-gray-900 dark:text-white cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                />
                <CalendarIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Status</label>
              <select
                className="w-full px-6 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 outline-none text-base font-bold text-gray-900 dark:text-white cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Notes</label>
            <textarea
              className="w-full px-6 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500/40 outline-none text-base font-bold text-gray-900 dark:text-white resize-none h-32 transition-all placeholder-gray-400"
              placeholder="Add some details..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Label Color</label>
            <div className="flex items-center justify-between gap-3 py-2 px-1">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`Select color ${color.name}`}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-10 h-10 rounded-2xl border-2 transition-all ${formData.color === color.value ? 'scale-110 border-sky-500 shadow-xl rotate-12 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div className="pt-8 pb-4">
            <button
              type="submit"
              className="w-full py-5 bg-sky-500 text-white rounded-3xl font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(14,165,233,0.5)] active:scale-[0.97] transition-all hover:bg-sky-600 hover:translate-y-[-2px]"
            >
              {initialData ? 'Update Record' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
