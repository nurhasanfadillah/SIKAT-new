import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [installable, setInstallable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  const handleBeforeInstall = useCallback((e: Event) => {
    e.preventDefault();
    deferredPrompt.current = e as BeforeInstallPromptEvent;
    setInstallable(true);
  }, []);

  const handleInstalled = useCallback(() => {
    setInstallable(false);
    setDismissed(false);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [handleBeforeInstall, handleInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      setInstallable(false);
    } else {
      setDismissed(true);
    }
  };

  if (!installable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={handleInstall}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-body font-bold text-white shadow-lg hover:bg-brand-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Install SIKAT
      </motion.button>
    </AnimatePresence>
  );
}
