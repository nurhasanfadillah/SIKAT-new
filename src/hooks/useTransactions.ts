import { useEffect, useState, useCallback } from 'react';
import { TransaksiKas, TransaksiTalang } from '../types';
import { safeFetch } from '../lib/auth-client';

export function useTransactions() {
  const [kas, setKas] = useState<TransaksiKas[]>([]);
  const [talang, setTalang] = useState<TransaksiTalang[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await safeFetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setKas(data.kas || []);
        setTalang(data.talang || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    
    // Set up a quiet background polling interval to keep screens updated in real-time
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  return { kas, talang, loading, refetch: fetchTransactions };
}
