import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  info: 'text-sky-600 bg-sky-50 border-sky-200',
};

const Toast = ({ toast, onRemove }) => {
  const Icon = ICONS[toast.type] || Info;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-72 max-w-sm animate-toast ${COLORS[toast.type]}`}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback(({ type = 'info', message, title, duration = 4000 }) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title, duration: 5000 }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
