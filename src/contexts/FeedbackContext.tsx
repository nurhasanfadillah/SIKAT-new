import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X, HelpCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
}

interface FeedbackContextType {
  toast: {
    show: (message: string, type?: ToastType, title?: string, duration?: number) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    variant: 'primary' | 'danger' | 'warning' | 'success';
    resolve: (value: boolean) => void;
  } | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toastHelpers = {
    show: showToast,
    success: (message: string, title?: string) => showToast(message, 'success', title || 'Berhasil'),
    error: (message: string, title?: string) => showToast(message, 'error', title || 'Gagal'),
    info: (message: string, title?: string) => showToast(message, 'info', title || 'Informasi'),
    warning: (message: string, title?: string) => showToast(message, 'warning', title || 'Peringatan'),
  };

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel || 'Ya, Lanjutkan',
        cancelLabel: options.cancelLabel || 'Batal',
        variant: options.variant || 'primary',
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <FeedbackContext.Provider value={{ toast: toastHelpers, confirm }}>
      {children}

      {/* Global Toast Container - Bound inside device if md screen is active */}
      <div className="fixed md:absolute top-5 inset-x-5 z-[100] pointer-events-none flex flex-col gap-2 max-w-sm mx-auto">
        <AnimatePresence>
          {toasts.map((t) => {
            let iconColor = 'text-blue-400';
            let borderColor = 'border-blue-500/20';
            let bgColor = 'bg-[#0f172a]/95';
            let IconComp = Info;

            if (t.type === 'success') {
              iconColor = 'text-[#00e5a3]';
              borderColor = 'border-[#00e5a3]/20';
              bgColor = 'bg-[#0b1c24]/95';
              IconComp = CheckCircle;
            } else if (t.type === 'error') {
              iconColor = 'text-rose-400';
              borderColor = 'border-rose-500/20';
              bgColor = 'bg-[#1b1221]/95';
              IconComp = AlertCircle;
            } else if (t.type === 'warning') {
              iconColor = 'text-amber-400';
              borderColor = 'border-amber-500/20';
              bgColor = 'bg-[#1c1612]/95';
              IconComp = AlertTriangle;
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border backdrop-blur-md shadow-2xl p-3 flex gap-3 relative"
                style={{
                  backgroundColor: 'rgba(12, 18, 33, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Decorative status strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  t.type === 'success' ? 'bg-[#00e5a3]' : t.type === 'error' ? 'bg-rose-500' : t.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

                <div className={`p-1 rounded-xl shrink-0 ${iconColor} mt-0.5`}>
                  <IconComp className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  {t.title && (
                    <h5 className="text-[12px] font-bold text-slate-100 leading-tight mb-0.5">
                      {t.title}
                    </h5>
                  )}
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    {t.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white p-0.5 rounded-lg transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Global Confirmation Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-xs bg-[#0c1221] border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden ring-1 ring-white/5"
            >
              {/* Outer visual accent or pattern */}
              <div className={`absolute top-0 inset-x-0 h-1.5 ${
                confirmState.variant === 'danger' ? 'bg-rose-500' :
                confirmState.variant === 'warning' ? 'bg-amber-500' :
                confirmState.variant === 'success' ? 'bg-emerald-500' :
                'bg-blue-500'
              }`} />

              <div className="flex gap-3 mb-4 mt-1">
                <div className={`p-2.5 rounded-2xl shrink-0 border mt-0.5 ${
                  confirmState.variant === 'danger' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  confirmState.variant === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  confirmState.variant === 'success' ? 'bg-emerald-500/10 text-[#00e5a3] border-[#00e5a3]/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {confirmState.variant === 'danger' ? <AlertCircle className="h-5 w-5" /> :
                   confirmState.variant === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                   confirmState.variant === 'success' ? <CheckCircle className="h-5 w-5" /> :
                   <HelpCircle className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-extrabold text-slate-100 mb-1 leading-snug">
                    {confirmState.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    {confirmState.message}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => handleConfirmClose(false)}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl border border-white/5 transition-colors cursor-pointer"
                >
                  {confirmState.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmClose(true)}
                  className={`py-2.5 px-3 font-bold text-xs rounded-xl transition-colors text-white cursor-pointer shadow-md ${
                    confirmState.variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600' :
                    confirmState.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' :
                    confirmState.variant === 'success' ? 'bg-[#00e5a3] hover:bg-[#00cfa2] text-slate-950 font-extrabold' :
                    'bg-[#00d2ff] hover:bg-[#00b9e6] text-slate-950 font-extrabold'
                  }`}
                >
                  {confirmState.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}
