import React, { useState, useEffect } from 'react';
import { X, Clock, Edit, DollarSign, Trash2, Plus } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { PaymentHistoryEntry } from '../types';

interface PaymentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  paymentTitle: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ isOpen, onClose, paymentId, paymentTitle }) => {
  const [history, setHistory] = useState<PaymentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !paymentId) return;

    setLoading(true);
    const q = query(
      collection(db, 'paymentHistory'),
      where('paymentId', '==', paymentId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentHistoryEntry[];
      setHistory(historyData);
      setLoading(false);
    });

    return unsubscribe;
  }, [isOpen, paymentId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="text-green-500" size={16} />;
      case 'updated':
        return <Edit className="text-blue-500" size={16} />;
      case 'paid':
        return <DollarSign className="text-teal-500" size={16} />;
      case 'deleted':
        return <Trash2 className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const formatChanges = (changes: Record<string, any>) => {
    return Object.entries(changes).map(([key, value]) => {
      if (key === 'amountPaid') {
        return `Paid: $${value}`;
      }
      if (key === 'newTotalPaid') {
        return `Total Paid: $${value}`;
      }
      if (key === 'status') {
        return `Status: ${value}`;
      }
      if (key === 'paymentDate') {
        return `Payment Date: ${new Date(value).toLocaleDateString()}`;
      }
      if (key === 'notes') {
        return `Notes: ${value || 'cleared'}`;
      }
      if (key === 'reminderDays') {
        return `Reminders: ${Array.isArray(value) ? value.join(', ') + ' days' : value}`;
      }
      return `${key}: ${value}`;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{paymentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">No history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {entry.action}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.changes && Object.keys(entry.changes).length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {formatChanges(entry.changes).map((change, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-teal-500">•</span>
                            <span>{change}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;