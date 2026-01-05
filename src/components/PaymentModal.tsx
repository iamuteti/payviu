
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md glass bg-white/95 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-transparent py-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {initialData ? 'Update Bill' : 'New Payment'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Title</label>
            <input 
              required
              type="text" 
              className="w-full px-5 py-3.5 glass-card bg-white/50 rounded-2xl focus:ring-2 focus:ring-sky-200 outline-none text-sm font-bold text-gray-900 transition-all placeholder-gray-400"
              placeholder="Rent, Utilities, Internet..."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Amount ($)</label>
            <input 
              required
              type="number" 
              step="0.01"
              className="w-full px-5 py-3.5 glass-card bg-white/50 rounded-2xl focus:ring-2 focus:ring-sky-200 outline-none text-sm font-bold text-gray-900 transition-all placeholder-gray-400"
              placeholder="0.00"
              value={formData.totalAmount}
              onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</label>
              <select 
                className="w-full px-5 py-3.5 glass-card bg-white/50 rounded-2xl outline-none text-sm font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1.25rem_center] cursor-pointer"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as PaymentType })}
              >
                <option value="Onetime">One-time</option>
                <option value="Recurring">Recurring</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Priority</label>
              <select 
                className="w-full px-5 py-3.5 glass-card bg-white/50 rounded-2xl outline-none text-sm font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1.25rem_center] cursor-pointer"
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Due Date</label>
              <div className="relative">
                <DatePicker
                  selected={formData.dueDate ? new Date(formData.dueDate) : new Date()}
                  onChange={(date: Date | null) => {
                    if (date) setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
                  }}
                  dateFormat="MMM d, yyyy"
                  className="w-full px-5 py-3.5 glass-card bg-white/50 rounded-2xl focus:ring-2 focus:ring-sky-200 outline-none text-sm font-bold text-gray-900 cursor-pointer"
                />
                <CalendarIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
              <select 
                className="w-full px-5 py-3.5 glass-card bg-white/50 rounded-2xl outline-none text-sm font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1.25rem_center] cursor-pointer"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Notes</label>
            <textarea 
              className="w-full px-5 py-3.5 glass-card bg-white/50 rounded-2xl focus:ring-2 focus:ring-sky-200 outline-none text-sm font-bold text-gray-900 resize-none h-20 transition-all placeholder-gray-400"
              placeholder="Optional description..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Label Color</label>
            <div className="flex items-center justify-between gap-3 py-2 px-1">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`Select color ${color.name}`}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-9 h-9 rounded-2xl border-2 transition-all ${formData.color === color.value ? 'scale-110 border-sky-500 shadow-xl rotate-12 opacity-100' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button 
              type="submit"
              className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black text-base shadow-xl shadow-sky-100 active:scale-[0.97] transition-all hover:bg-sky-600"
            >
              {initialData ? 'Save Changes' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
