
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LogOut, Search } from 'lucide-react';
import type { Payment, User, PaymentPriority } from './types';
import PaymentCard from './components/PaymentCard';
import PaymentModal from './components/PaymentModal';
import PayModal from './components/PayModal';
import Auth from './components/Auth';
import ThemeToggle from './components/ThemeToggle';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';

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
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email || 'User')}&background=0ea5e9&color=fff`,
        });
      } else {
        setUser(null);
        setPayments([]);
      }
    });
    return unsubscribe;
  }, []);

  // Payments Listener
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'payments'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      const synced = syncPaymentStatuses(paymentsData);
      setPayments(synced);
    });

    return unsubscribe;
  }, [user]);

  // Theme Sync
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);


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

  const handleLogout = async () => {
    await auth.signOut();
  };

  const addOrUpdatePayment = async (data: Partial<Payment>) => {
    if (!user) return;

    let nextOccurrence: Payment | null = null;

    if (editingPayment) {
      const updated = { ...editingPayment, ...data } as Payment;
      await updateDoc(doc(db, 'payments', editingPayment.id), { ...data, userId: user.id });
      if (updated.status === 'paid' && updated.type === 'Recurring' && editingPayment.status !== 'paid') {
        nextOccurrence = createRecurringOccurrence(updated);
      }
    } else {
      const newPayment: Omit<Payment, 'id'> = {
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
        userId: user.id,
      };
      const docRef = await addDoc(collection(db, 'payments'), newPayment);
      const addedPayment = { id: docRef.id, ...newPayment } as Payment;
      if (addedPayment.status === 'paid' && addedPayment.type === 'Recurring') {
        nextOccurrence = createRecurringOccurrence(addedPayment);
      }
    }

    if (nextOccurrence) {
      await addDoc(collection(db, 'payments'), { ...nextOccurrence, userId: user.id });
    }

    setIsPaymentModalOpen(false);
    setEditingPayment(undefined);
  };

  const deletePayment = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      await deleteDoc(doc(db, 'payments', id));
    }
  };

  const handlePay = async (amount: number) => {
    if (!activePayingPayment || !user) return;

    const newPaid = activePayingPayment.amountPaid + amount;
    const newStatus = newPaid >= activePayingPayment.totalAmount ? 'paid' : activePayingPayment.status;
    const updateData = { amountPaid: newPaid, status: newStatus };

    await updateDoc(doc(db, 'payments', activePayingPayment.id), updateData);

    if (newStatus === 'paid' && activePayingPayment.type === 'Recurring' && activePayingPayment.status !== 'paid') {
      const nextOccurrence = createRecurringOccurrence({ ...activePayingPayment, ...updateData });
      if (nextOccurrence) {
        await addDoc(collection(db, 'payments'), { ...nextOccurrence, userId: user.id });
      }
    }

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
    return <Auth />;
  }

  return (
    <div className="w-[90vw] md:w-[80vw] mx-auto min-h-screen flex flex-col pb-24 px-2 sm:px-4">
      <header className="flex items-center justify-between py-10">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-sky-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <img
              src={user.picture}
              alt={user.name}
              className="relative w-14 h-14 rounded-2xl border-2 border-white dark:border-white/10 shadow-2xl object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`; }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight leading-none mb-1">GlassPay</h1>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Financial Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />
          <button
            onClick={handleLogout}
            className="p-3 glass rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="mb-8 space-y-6">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={22} />
          <input
            type="text"
            placeholder="Search payments by name or details..."
            className="w-full pl-14 pr-6 py-5 glass-card bg-white/60 dark:bg-white/5 rounded-[2rem] focus:ring-4 focus:ring-sky-500/10 outline-none placeholder-slate-400 dark:placeholder-gray-500 transition-all text-base font-bold text-slate-900 dark:text-white shadow-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-2 shrink-0">Sort by</div>
          <div className="flex p-1 gap-1 glass rounded-2xl bg-white/40 dark:bg-black/20 w-fit">
            <button
              onClick={() => setSortBy('dueDate')}
              className={`px-6 py-2.5 rounded-[1.25rem] text-xs font-black transition-all ${sortBy === 'dueDate' ? 'bg-sky-500 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-white/10'}`}
            >
              Due Date
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={`px-6 py-2.5 rounded-[1.25rem] text-xs font-black transition-all ${sortBy === 'priority' ? 'bg-sky-500 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-white/10'}`}
            >
              Priority
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {processedPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 glass rounded-[2rem] flex items-center justify-center mb-8 shadow-inner rotate-3">
              <Search size={48} className="text-gray-300 dark:text-gray-700 opacity-50" />
            </div>
            <h3 className="text-lg font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] text-center px-4">
              {searchQuery ? 'No Results Found' : 'Your list is empty'}
            </h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-700 mt-2">
              {searchQuery ? 'Try adjusting your search query' : 'Tap the + button to add a payment'}
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
        className="fixed bottom-10 right-10 w-20 h-20 bg-sky-500 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 border-4 border-white/20 group"
      >
        <div className="absolute inset-0 bg-sky-500 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
        <Plus size={44} className="relative drop-shadow-lg" />
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
