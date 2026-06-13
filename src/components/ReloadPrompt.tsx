import { motion, AnimatePresence } from 'motion/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const visible = offlineReady || needRefresh;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-white/10 bg-surface-card/95 px-4 py-3 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <p className="text-white text-body flex-1">
              {offlineReady
                ? 'App siap digunakan offline'
                : 'Versi baru tersedia'}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {needRefresh && (
                <button
                  onClick={() => updateServiceWorker(true)}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-label font-bold text-white hover:bg-brand-700 transition-colors"
                >
                  Refresh
                </button>
              )}
              <button
                onClick={close}
                className="rounded-lg px-2 py-1.5 text-label text-text-secondary hover:text-white transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
