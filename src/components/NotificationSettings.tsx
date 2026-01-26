import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff } from 'lucide-react';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { enabled: boolean; defaultReminderDays: number[] }) => void;
  initialSettings?: { enabled: boolean; defaultReminderDays: number[] };
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings = { enabled: true, defaultReminderDays: [1, 3] }
}) => {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [reminderDays, setReminderDays] = useState<number[]>(initialSettings.defaultReminderDays);

  useEffect(() => {
    setEnabled(initialSettings.enabled);
    setReminderDays(initialSettings.defaultReminderDays);
  }, [initialSettings]);

  const handleSave = () => {
    onSave({ enabled, defaultReminderDays: reminderDays });
    onClose();
  };

  const toggleDay = (day: number) => {
    setReminderDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {enabled ? <Bell className="text-teal-500" size={20} /> : <BellOff className="text-gray-400" size={20} />}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Enable Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive reminders for upcoming payments</p>
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {enabled && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Default Reminder Days</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get notified these many days before payment is due
              </p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 5, 7, 14].map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reminderDays.includes(day)
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day} day{day !== 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Notifications will appear in your browser. Make sure to allow notifications when prompted.
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;