
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LogOut, Search } from 'lucide-react';
import type { Payment, User, PaymentPriority } from './types';
import { STORAGE_KEY_PAYMENTS, STORAGE_KEY_USER } from './constants';
import PaymentCard from './components/PaymentCard';
import PaymentModal from './components/PaymentModal';
import PayModal from './components/PayModal';
import Auth from './components/Auth';

type SortOption = 'dueDate' | 'priority';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);
  const [activePayingPayment, setActivePayingPayment] = useState<Payment | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');

  // Initial Load
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedPayments = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    if (savedPayments) {
      const parsed = JSON.parse(savedPayments) as Payment[];
      const synced = syncPaymentStatuses(parsed);
      setPayments(synced);
    }
  }, []);

  // Save on Change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  const syncPaymentStatuses = (list: Payment[]): Payment[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return list.map(p => {
      if (p.status === 'paid') return p;
      const due = new Date(p.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due < today) {
        return { ...p, status: 'overdue', color: '#ef4444' };
      }
      return p;
    });
  };

  const getNextOccurrenceDate = (currentDate: string) => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  const createRecurringOccurrence = (p: Payment) => {
    const nextDate = getNextOccurrenceDate(p.dueDate);
    const alreadyExists = payments.some(item => item.title === p.title && item.dueDate === nextDate);
    if (alreadyExists) return null;

    return {
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      dueDate: nextDate,
      status: 'pending' as const,
      amountPaid: 0,
      createdAt: new Date().toISOString(),
    };
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const addOrUpdatePayment = (data: Partial<Payment>) => {
    let nextOccurrence: Payment | null = null;
    
    setPayments(prev => {
      let newList: Payment[];
      if (editingPayment) {
        newList = prev.map(p => {
          if (p.id === editingPayment.id) {
            const updated = { ...p, ...data } as Payment;
            if (updated.status === 'paid' && updated.type === 'Recurring' && p.status !== 'paid') {
              nextOccurrence = createRecurringOccurrence(updated);
            }
            return updated;
          }
          return p;
        });
      } else {
        const newPayment: Payment = {
          id: Math.random().toString(36).substr(2, 9),
          title: data.title || 'Untitled',
          description: data.description || '',
          type: data.type || 'Onetime',
          priority: data.priority || 'Medium',
          dueDate: data.dueDate || new Date().toISOString().split('T')[0],
          color: data.color || '#0ea5e9',
          status: data.status || 'pending',
          totalAmount: data.totalAmount || 0,
          amountPaid: 0,
          createdAt: new Date().toISOString(),
        };
        newList = [newPayment, ...prev];
        if (newPayment.status === 'paid' && newPayment.type === 'Recurring') {
          nextOccurrence = createRecurringOccurrence(newPayment);
        }
      }
      
      if (nextOccurrence) {
        return [nextOccurrence, ...newList];
      }
      return newList;
    });

    setIsPaymentModalOpen(false);
    setEditingPayment(undefined);
  };

  const deletePayment = (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const handlePay = (amount: number) => {
    if (!activePayingPayment) return;
    
    setPayments(prev => {
      let nextOccurrence: Payment | null = null;
      const newList = prev.map(p => {
        if (p.id === activePayingPayment.id) {
          const newPaid = p.amountPaid + amount;
          const newStatus = newPaid >= p.totalAmount ? 'paid' : p.status;
          const updated = { ...p, amountPaid: newPaid, status: newStatus as any };
          
          if (updated.status === 'paid' && updated.type === 'Recurring' && p.status !== 'paid') {
            nextOccurrence = createRecurringOccurrence(updated);
          }
          return updated;
        }
        return p;
      });

      if (nextOccurrence) {
        return [nextOccurrence, ...newList];
      }
      return newList;
    });

    setIsPayModalOpen(false);
    setActivePayingPayment(undefined);
  };

  const priorityWeight: Record<PaymentPriority, number> = { 
    'Urgent': 5, 
    'Critical': 4, 
    'High': 3, 
    'Medium': 2, 
    'Low': 1 
  };

  const processedPayments = useMemo(() => {
    let filtered = payments.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      } else {
        const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diff === 0) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return diff;
      }
    });
  }, [payments, searchQuery, sortBy]);

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="w-[90vw] md:w-[80vw] mx-auto min-h-screen flex flex-col pb-24 px-2 sm:px-4">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white/50" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">GlassPay</h1>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Dashboard</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2.5 glass rounded-xl text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      <div className="mb-6 space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search titles or descriptions..." 
            className="w-full pl-12 pr-4 py-3.5 glass-card bg-white/50 rounded-2xl focus:ring-2 focus:ring-sky-200 outline-none placeholder-gray-500 transition-all text-sm font-bold text-gray-900 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-2 shrink-0">Sort by:</div>
          <button 
            onClick={() => setSortBy('dueDate')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sortBy === 'dueDate' ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'glass text-gray-600 hover:bg-white/50'}`}
          >
            Due Date
          </button>
          <button 
            onClick={() => setSortBy('priority')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sortBy === 'priority' ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'glass text-gray-600 hover:bg-white/50'}`}
          >
            Priority
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {processedPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mb-6">
              <Search size={40} className="opacity-10" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60">
              {searchQuery ? 'No matching records' : 'No records found'}
            </p>
          </div>
        ) : (
          processedPayments.map(p => (
            <PaymentCard 
              key={p.id} 
              payment={p} 
              onEdit={() => { setEditingPayment(p); setIsPaymentModalOpen(true); }}
              onDelete={() => deletePayment(p.id)}
              onPay={() => { setActivePayingPayment(p); setIsPayModalOpen(true); }}
            />
          ))
        )}
      </div>

      <button 
        onClick={() => { setEditingPayment(undefined); setIsPaymentModalOpen(true); }}
        className="fixed bottom-8 right-[10%] w-16 h-16 bg-sky-500 text-white rounded-2xl shadow-2xl shadow-sky-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40 border-4 border-white/20"
      >
        <Plus size={36} />
      </button>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => { setIsPaymentModalOpen(false); setEditingPayment(undefined); }}
        onSubmit={addOrUpdatePayment}
        initialData={editingPayment}
      />

      <PayModal 
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        payment={activePayingPayment}
        onPay={handlePay}
      />
    </div>
  );
};

export default App;
