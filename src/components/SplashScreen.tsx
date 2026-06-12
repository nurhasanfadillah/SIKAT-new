import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  visible: boolean;
}

export function SplashScreen({ visible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-base"
        >
          <img
            src="/logo.svg"
            alt="SIKAT"
            className="w-28 h-28 mb-6 drop-shadow-2xl"
          />
          <p className="text-white text-2xl font-bold tracking-widest">SIKAT</p>
          <p className="text-brand-300 text-sm mt-2 tracking-wide">
            Sistem Kas Sekolah dan Talang
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
