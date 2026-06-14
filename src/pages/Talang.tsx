import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { safeFetch } from '../lib/auth-client';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { format, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { parseDateIgnoreTimezone, formatIgnoreTimezone } from '../lib/utils';
import {
  Plus,
  X,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  Edit2,
  Trash2,
  Coins,
  TrendingUp,
  Info,
  Percent,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronDown
} from 'lucide-react';
import { AkunTalang, JenisTalang } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Indonesian Language "Terbilang" Number spelling engine
function getTerbilang(num: number): string {
  if (num <= 0) return '';
  if (num > 1000000000000) return 'Nominal terlalu besar (di atas 1 Triliun)';

  const words = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];

  function konversi(n: number): string {
    let temp = "";
    if (n < 12) {
      temp = words[n];
    } else if (n < 20) {
      temp = konversi(n - 10) + " belas";
    } else if (n < 100) {
      temp = konversi(Math.floor(n / 10)) + " puluh " + konversi(n % 10);
    } else if (n < 200) {
      temp = "seratus " + konversi(n - 100);
    } else if (n < 1000) {
      temp = konversi(Math.floor(n / 100)) + " ratus " + konversi(n % 100);
    } else if (n < 2000) {
      temp = "seribu " + konversi(n - 1000);
    } else if (n < 1000000) {
      temp = konversi(Math.floor(n / 1000)) + " ribu " + konversi(n % 1000);
    } else if (n < 1000000000) {
      temp = konversi(Math.floor(n / 1000000)) + " juta " + konversi(n % 1000000);
    } else if (n < 1000000000000) {
      temp = konversi(Math.floor(n / 1000000000)) + " milyar " + konversi(n % 1000000000);
    } else if (n < 1000000000000000) {
      temp = konversi(Math.floor(n / 1000000000000)) + " triliun " + konversi(n % 1000000000000);
    }
    return temp;
  }

  const hasil = konversi(num).trim().replace(/\s+/g, " ");
  if (!hasil) return '';
  return hasil.charAt(0).toUpperCase() + hasil.slice(1) + " rupiah";
}

const getLocalDateString = (dateInput: any) => {
  const d = parseDateIgnoreTimezone(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Talang() {
  const { kas, talang, loading, refetch } = useTransactions();
  const { user, isBendahara } = useAuth();
  const { toast, confirm } = useFeedback();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const kasBalance = useMemo(() => {
    return (kas || []).reduce((acc, curr) => {
      return curr.jenis === 'Pemasukan' ? acc + curr.nominal : acc - curr.nominal;
    }, 0);
  }, [kas]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [jenisFilter, setJenisFilter] = useState<'Semua' | 'Baru' | 'Pelunasan' | 'Transfer'>('Semua');
  const [akunFilter, setAkunFilter] = useState<string>('Semua');
  const [unitFilter, setUnitFilter] = useState<string>('Semua');
  const [quickDate, setQuickDate] = useState<string>('Semua');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'tanggal_desc' | 'tanggal_asc' | 'nominal_desc' | 'nominal_asc'>('tanggal_desc');

  // Form State
  const [jenis, setJenis] = useState<JenisTalang>('Baru');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [akunTalang, setAkunTalang] = useState<AkunTalang>('Jisoi');
  const [akunTujuan, setAkunTujuan] = useState<AkunTalang>('Rakka');
  const [unit, setUnit] = useState('SD');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Formatted numeric preview while typing
  const numericNominal = useMemo(() => {
    const val = Number(nominal);
    return isNaN(val) ? 0 : val;
  }, [nominal]);

  const handleStartEdit = (t: any) => {
    setExpandedId(null);
    setEditingId(t.id || null);
    setJenis(t.jenis);
    setTanggal(getLocalDateString(t.tanggal));
    setAkunTalang(t.akun_talang);
    if (t.jenis === 'Transfer') {
      setAkunTujuan(t.akun_tujuan || 'Rakka');
    } else if (t.jenis === 'Baru') {
      setUnit(t.unit || 'SD');
    }
    setKeterangan(t.keterangan);
    setNominal(String(t.nominal));
    setShowForm(true);
  };

  const handleCancelEdit = async () => {
    if (!editingId && (keterangan.trim() || nominal)) {
      const isConfirmed = await confirm({
        title: 'Batalkan Catatan',
        message: 'Apakah Anda yakin ingin membatalkan penginputan kewajiban dana talangan ini? Semua data yang sudah Anda ketik akan dibuang.',
        confirmLabel: 'Ya, Batalkan',
        cancelLabel: 'Lanjut Mengisi',
        variant: 'warning'
      });
      if (!isConfirmed) return;
    }

    setEditingId(null);
    setKeterangan('');
    setNominal('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setAkunTalang('Jisoi');
    setAkunTujuan('Rakka');
    setUnit('SD');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await safeFetch(`/api/talang/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus transaksi');
      }
      await refetch();
      toast.success('Buku Kas & Catatan Dana Talangan berhasil diperbarui.');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Gagal menghapus catatan kewajiban talangan pada server.');
    }
  };

  // Extract unique accounts and units dynamically for filter dropdowns
  const uniqueAkun = useMemo(() => {
    const akuns = talang
      .map(t => t.akun_talang)
      .filter((a): a is string => !!a);
    return ['Semua', ...Array.from(new Set(akuns))];
  }, [talang]);

  const uniqueUnit = useMemo(() => {
    const units = talang
      .map(t => t.unit)
      .filter((u): u is string => !!u);
    return ['Semua', ...Array.from(new Set(units))];
  }, [talang]);

  const handleQuickDateChange = (preset: string) => {
    setQuickDate(preset);
    const today = new Date();

    if (preset === 'Semua') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'Hari Ini') {
      const todayStr = format(today, 'yyyy-MM-dd');
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === 'Bulan Ini') {
      const startOfMonth = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
      const todayStr = format(today, 'yyyy-MM-dd');
      setDateFrom(startOfMonth);
      setDateTo(todayStr);
    } else if (preset === '30_hari') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAgoStr = format(thirtyDaysAgo, 'yyyy-MM-dd');
      const todayStr = format(today, 'yyyy-MM-dd');
      setDateFrom(thirtyDaysAgoStr);
      setDateTo(todayStr);
    }
  };

  const isAnyFilterActive = useMemo(() => {
    return searchTerm !== '' ||
           dateFrom !== '' ||
           dateTo !== '' ||
           jenisFilter !== 'Semua' ||
           akunFilter !== 'Semua' ||
           unitFilter !== 'Semua' ||
           quickDate !== 'Semua';
  }, [searchTerm, dateFrom, dateTo, jenisFilter, akunFilter, unitFilter, quickDate]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setJenisFilter('Semua');
    setAkunFilter('Semua');
    setUnitFilter('Semua');
    setQuickDate('Semua');
    setSortBy('tanggal_desc');
  };

  const filteredTalang = useMemo(() => {
    const matched = talang.filter(t => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = t.keterangan.toLowerCase().includes(s) ||
                            t.akun_talang.toLowerCase().includes(s) ||
                            (t.akun_tujuan && t.akun_tujuan.toLowerCase().includes(s)) ||
                            (t.unit && t.unit.toLowerCase().includes(s));

      let matchesDate = true;
      if (dateFrom) {
         matchesDate = matchesDate && parseDateIgnoreTimezone(t.tanggal) >= parseDateIgnoreTimezone(dateFrom);
      }
      if (dateTo) {
         matchesDate = matchesDate && parseDateIgnoreTimezone(t.tanggal) <= endOfDay(parseDateIgnoreTimezone(dateTo));
      }

      let matchesJenis = true;
      if (jenisFilter !== 'Semua') {
        matchesJenis = t.jenis === jenisFilter;
      }

      let matchesAkun = true;
      if (akunFilter !== 'Semua') {
        matchesAkun = t.akun_talang === akunFilter || t.akun_tujuan === akunFilter;
      }

      let matchesUnit = true;
      if (unitFilter !== 'Semua') {
        matchesUnit = t.unit === unitFilter;
      }

      return matchesSearch && matchesDate && matchesJenis && matchesAkun && matchesUnit;
    });

    // Apply advanced sorting
    return [...matched].sort((a, b) => {
      if (sortBy === 'tanggal_desc') {
        return parseDateIgnoreTimezone(b.tanggal).getTime() - parseDateIgnoreTimezone(a.tanggal).getTime();
      }
      if (sortBy === 'tanggal_asc') {
        return parseDateIgnoreTimezone(a.tanggal).getTime() - parseDateIgnoreTimezone(b.tanggal).getTime();
      }
      if (sortBy === 'nominal_desc') {
        return b.nominal - a.nominal;
      }
      if (sortBy === 'nominal_asc') {
        return a.nominal - b.nominal;
      }
      return 0;
    });
  }, [talang, searchTerm, dateFrom, dateTo, jenisFilter, akunFilter, unitFilter, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  // Compile individual lender outstanding balances
  const talangBalances = useMemo(() => {
    const balances: Record<AkunTalang, number> = { Jisoi: 0, Rakka: 0, Shae: 0 };
    talang.forEach((t) => {
      if (t.jenis === 'Baru') {
        balances[t.akun_talang] += t.nominal;
      } else if (t.jenis === 'Pelunasan') {
        balances[t.akun_talang] -= t.nominal;
      } else if (t.jenis === 'Transfer') {
        balances[t.akun_talang] -= t.nominal;
        if (t.akun_tujuan) {
          balances[t.akun_tujuan as keyof typeof balances] += t.nominal;
        }
      }
    });
    return balances;
  }, [talang]);

  // General outstanding, borrowed and repaid metrics
  const talangMetrics = useMemo(() => {
    let pinjamanBaru = 0;
    let pelunasanBayar = 0;
    talang.forEach((t) => {
      if (t.jenis === 'Baru') {
        pinjamanBaru += t.nominal;
      } else if (t.jenis === 'Pelunasan') {
        pelunasanBayar += t.nominal;
      }
    });

    const outstanding = Math.max(0, talangBalances.Jisoi) + Math.max(0, talangBalances.Rakka) + Math.max(0, talangBalances.Shae);
    const progressPercent = pinjamanBaru > 0
      ? Math.min(100, Math.round((pelunasanBayar / pinjamanBaru) * 100))
      : 100;

    return {
      outstanding,
      totalBorrowed: pinjamanBaru,
      totalRepaid: pelunasanBayar,
      repaymentProgress: progressPercent
    };
  }, [talang, talangBalances]);

  const countAll = talang.length;
  const countBaru = talang.filter(t => t.jenis === 'Baru').length;
  const countPelunasan = talang.filter(t => t.jenis === 'Pelunasan').length;
  const countTransfer = talang.filter(t => t.jenis === 'Transfer').length;

  // Toggle account filters by clicking cards
  const handleAccountCardClick = (akun: string) => {
    if (akunFilter === akun) {
      setAkunFilter('Semua');
    } else {
      setAkunFilter(akun);
    }
  };

  // Quick Action Fill to pay back the remaining balance
  const initiateQuickRepayment = (akun: AkunTalang, balance: number) => {
    if (!isBendahara) return;
    setAkunFilter('Semua');
    setJenis('Pelunasan');
    setAkunTalang(akun);
    setNominal(String(balance));
    setKeterangan(`Pelunasan sisa dana talangan ${akun}`);
    setTanggal(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (jenis === 'Transfer' && akunTalang === akunTujuan) {
      toast.warning("Akun asal dan akun tujuan transfer dana talangan tidak boleh sama!");
      return;
    }

    const parsedNominal = Number(nominal);
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      toast.warning("Nominal dana talangan harus berupa angka positif yang valid (lebih dari 0)!");
      return;
    }

    // Requirement 1: pelunasan tidak bisa dilakukan melebihi saldo kas sekolah
    if (jenis === 'Pelunasan') {
      const existingTalang = editingId ? talang.find(t => t.id === editingId) : null;
      const refNominal = existingTalang && existingTalang.jenis === 'Pelunasan' ? existingTalang.nominal : 0;
      const simulatedKasBalance = kasBalance + refNominal - parsedNominal;
      if (simulatedKasBalance < 0) {
        toast.warning(
          `Transaksi ditolak! Nominal pelunasan (${formatCurrency(parsedNominal)}) melebihi saldo kas sekolah yang tersedia. Saldo kas sekolah sebelum transaksi adalah ${formatCurrency(kasBalance + refNominal)}.`
        );
        return;
      }
    }

    // Client-side simulation of account balances to prevent any balance from going negative
    const simulatedBalances: Record<AkunTalang, number> = { Jisoi: 0, Rakka: 0, Shae: 0 };

    // Build simulated transactions list
    const otherTransactions = talang.filter(t => t.id !== editingId);
    const mockTx = {
      jenis,
      akun_talang: akunTalang,
      akun_tujuan: jenis === 'Transfer' ? akunTujuan : undefined,
      nominal: parsedNominal
    };

    const allSimulatedTxs = [...otherTransactions, mockTx];

    allSimulatedTxs.forEach((t) => {
      if (t.jenis === 'Baru') {
        simulatedBalances[t.akun_talang] += t.nominal;
      } else if (t.jenis === 'Pelunasan') {
        simulatedBalances[t.akun_talang] -= t.nominal;
      } else if (t.jenis === 'Transfer') {
        simulatedBalances[t.akun_talang] -= t.nominal;
        if (t.akun_tujuan) {
          simulatedBalances[t.akun_tujuan as AkunTalang] += t.nominal;
        }
      }
    });

    for (const [acc, bal] of Object.entries(simulatedBalances)) {
      if (bal < 0) {
        toast.warning(
          `Transaksi ditolak! Sisa dana talangan akun ${acc} tidak boleh bernilai negatif (akan menjadi ${formatCurrency(bal)}).`
        );
        return;
      }
    }

    const isConfirmed = await confirm({
      title: editingId ? 'Konfirmasi Perubahan Talangan' : 'Konfirmasi Transaksi Talang',
      message: editingId
        ? `Apakah Anda yakin ingin memodifikasi data talangan ini dengan nominal baru senilai ${formatCurrency(Number(nominal))}?`
        : `Apakah Anda ingin mencatat sirkulasi dana talang (${jenis}) sebesar ${formatCurrency(Number(nominal))} ke sistem keuangan?`,
      confirmLabel: editingId ? 'Ya, Perbarui' : 'Ya, Daftarkan',
      cancelLabel: 'Batal',
      variant: 'primary'
    });
    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      const url = editingId ? `/api/talang/${editingId}` : '/api/talang';
      const method = editingId ? 'PUT' : 'POST';

      const response = await safeFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tanggal: new Date(tanggal).toISOString(),
          jenis,
          akun_talang: akunTalang,
          akun_tujuan: jenis === 'Transfer' ? akunTujuan : undefined,
          unit: jenis === 'Baru' ? unit : undefined,
          keterangan,
          nominal: Number(nominal)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan transaksi');
      }

      await refetch();

      toast.success(
        editingId ? 'Alokasi dan rincian talangan berhasil disesuaikan.' : 'Catatan kewajiban dana talangan baru berhasil diaktifkan.',
        'Kewajiban Disimpan'
      );

      // Force state resets cleanly without double warning
      setEditingId(null);
      setKeterangan('');
      setNominal('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setAkunTalang('Jisoi');
      setAkunTujuan('Rakka');
      setUnit('SD');
      setShowForm(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Gagal mendokumentasikan kewajiban talang ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate proportional shares for the stacked progress bar
  const totalOutstanding = talangMetrics.outstanding;
  const isoiShare = totalOutstanding > 0 ? (Math.max(0, talangBalances.Jisoi) / totalOutstanding) * 100 : 0;
  const rakkaShare = totalOutstanding > 0 ? (Math.max(0, talangBalances.Rakka) / totalOutstanding) * 100 : 0;
  const shaeShare = totalOutstanding > 0 ? (Math.max(0, talangBalances.Shae) / totalOutstanding) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Premium Hero Stats Panel (Overview & Audit Dashboard) */}
      <Card className="bg-gradient-to-br from-violet-900/30 via-indigo-950/20 to-slate-900/60 border border-violet-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-micro font-bold text-violet-300 uppercase tracking-widest flex items-center gap-1">
              <Coins className="h-3 w-3" /> Buku Besar Dana Talangan
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(talangMetrics.outstanding)}
            </h3>
            <p className="text-micro text-slate-400 font-medium">
              Sisa kewajiban aktif yang belum diselesaikan sekolah
            </p>
          </div>
          <div className="bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-2xl text-center">
            <span className="text-nano font-black text-violet-300 block uppercase leading-none">Settlement</span>
            <span className="text-body font-black text-white mt-1 block">{talangMetrics.repaymentProgress}%</span>
          </div>
        </div>

        {/* Proportional Stacked Balance Share Bar */}
        {totalOutstanding > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[8px] font-bold text-slate-450 tracking-wider">
              <span>PROPORSI KEWAJIBAN LENDER</span>
              <span>TOTAL ACTIVE SHARING</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden flex border border-white/5 p-0.5">
              {isoiShare > 0 && (
                <div
                  style={{ width: `${isoiShare}%` }}
                  className="bg-violet-555 rounded-full h-full transition-all bg-violet-500"
                  title={`Jisoi: ${isoiShare.toFixed(1)}%`}
                />
              )}
              {rakkaShare > 0 && (
                <div
                  style={{ width: `${rakkaShare}%` }}
                  className="bg-blue-400 rounded-full h-full transition-all"
                  title={`Rakka: ${rakkaShare.toFixed(1)}%`}
                />
              )}
              {shaeShare > 0 && (
                <div
                  style={{ width: `${shaeShare}%` }}
                  className="bg-indigo-300 rounded-full h-full transition-all"
                  title={`Shae: ${shaeShare.toFixed(1)}%`}
                />
              )}
            </div>
            <div className="flex items-center gap-3 text-[8px] font-semibold text-slate-400 pt-0.5">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet-500 block" /> Jisoi ({Math.round(isoiShare)}%)</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 block" /> Rakka ({Math.round(rakkaShare)}%)</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-300 block" /> Shae ({Math.round(shaeShare)}%)</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/5 my-3" />

        {/* Grid statistics metrics */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-900/40 p-2 rounded-2xl border border-white/5">
            <span className="text-[8px] font-bold text-slate-500 uppercase block">Total Talangan Berjalan</span>
            <span className="text-body font-black text-slate-200 mt-0.5 block flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-violet-400 shrink-0" />
              {formatCurrency(talangMetrics.totalBorrowed)}
            </span>
          </div>
          <div className="bg-slate-900/40 p-2 rounded-2xl border border-white/5">
            <span className="text-[8px] font-bold text-slate-500 uppercase block">Total Pengembalian (Kas)</span>
            <span className="text-body font-black text-brand-500 mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-brand-500 shrink-0" />
              {formatCurrency(talangMetrics.totalRepaid)}
            </span>
          </div>
        </div>
      </Card>

      {/* Account Info Cards with clickable triggers */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-micro font-bold text-slate-400 tracking-wider">
          <span>SUMBER DANA TALANG INDIVIDUAL</span>
          <span className="text-nano text-brand-500 bg-brand-500/5 px-1.5 py-0.5 rounded-full border border-brand-500/10">Saring Cepat</span>
        </div>
        <div className="space-y-2">
          {(Object.entries(talangBalances) as [AkunTalang, number][]).map(([akun, balance]) => {
            const isSelected = akunFilter === akun;
            let themeRingColor = isSelected ? "ring-2 ring-violet-500/85 border-violet-500 bg-[#161d30]/80 shadow-[0_0_15px_rgba(139,92,246,0.15)]" : "border-white/5 bg-[#121829]/60 hover:border-white/10";
            let initialsColor = "bg-violet-500/15 border-violet-500/30 text-violet-300";
            if (akun === "Rakka") initialsColor = "bg-blue-500/15 border-blue-500/30 text-blue-300";
            if (akun === "Shae") initialsColor = "bg-indigo-500/15 border-indigo-500/30 text-indigo-300";

            return (
              <button
                key={akun}
                onClick={() => handleAccountCardClick(akun)}
                className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 ${themeRingColor}`}
              >
                {/* Kolom 1 (Kiri) - Akun */}
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center font-black text-body border ${initialsColor}`}>
                    {akun[0]}
                  </div>
                  <div>
                    <span className="text-label font-black text-slate-200 uppercase leading-none tracking-wide">{akun}</span>
                    <span className="text-nano text-slate-500 block">Saring Akun</span>
                  </div>
                </div>

                {/* Kolom 2 (Kanan) - Nominal */}
                <div className="text-right">
                  <span className={`text-value font-black leading-tight block ${balance > 0 ? 'text-white' : 'text-slate-500'}`}>
                    {balance > 0 ? formatCurrency(balance) : 'Lunas'}
                  </span>
                  {balance < 0 && (
                    <span className="text-[8px] font-semibold text-brand-500 bg-brand-500/5 px-1 py-0.5 rounded block mt-0.5">
                      Kelebihan {formatCurrency(Math.abs(balance))}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Account Panel with Repayment Action */}
        {['Jisoi', 'Rakka', 'Shae'].includes(akunFilter) && (
          <div className="p-3 bg-[#161d30] border border-violet-500/20 rounded-2xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-0.5">
              <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest block">Akun Terpilih</span>
              <p className="text-label font-bold text-white flex items-center gap-1 flex-wrap">
                Lender: {akunFilter} <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" /> Outstanding: {formatCurrency(talangBalances[akunFilter as keyof typeof talangBalances])}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setAkunFilter('Semua')}
                className="px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-lg text-micro text-slate-300 font-bold"
              >
                Tutup
              </button>
              {isBendahara && talangBalances[akunFilter as keyof typeof talangBalances] > 0 && (
                <button
                  onClick={() => initiateQuickRepayment(akunFilter as AkunTalang, talangBalances[akunFilter as keyof typeof talangBalances])}
                  className="px-2.5 py-1 bg-violet-500 hover:bg-violet-600 active:scale-95 text-white shadow-md transition-all rounded-lg text-micro font-black flex items-center gap-1"
                >
                  ⚡ Bayar Pelunasan
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Header Form & Floating Toggle */}
      <div className="flex justify-between items-center pt-1">
        <h2 className="text-body font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wide">
          <Info className="h-3.5 w-3.5 text-violet-400" /> {showForm ? 'Isi Formulir Sirkulasi' : 'Alokasikan & Urus Data'}
        </h2>
        {isBendahara && (
          <button
            onClick={() => { if (showForm) { handleCancelEdit(); } else { setShowForm(true); } }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-label font-bold transition-all active:scale-95 border ${
              showForm
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                : 'bg-violet-500/10 text-violet-300 border-violet-500/20 shadow-sm'
            }`}
          >
            {showForm ? <><X className="h-3 w-3" /> {editingId ? 'Batal' : 'Tutup Form'}</> : <><Plus className="h-3 w-3" /> Talangan Baru</>}
          </button>
        )}
      </div>

      {showForm && isBendahara && (
        <Card id="talang-action-form" className="bg-[#161d30]/90 border border-violet-500/25 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200 space-y-4">
          <h3 className="text-body font-black text-violet-400 border-b border-white/5 pb-1 flex items-center gap-1.5 uppercase tracking-wider">
            <ArrowLeftRight className="h-4 w-4" /> {editingId ? 'Edit Draft Kewajiban Talang' : 'Catat Aliran Dana Talang'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Elegant Segmented Select button for Transaction Type */}
            <div className="bg-slate-900 p-1 rounded-xl grid grid-cols-3 gap-1 border border-white/5">
              <button
                type="button"
                onClick={() => setJenis('Baru')}
                className={`py-1.5 rounded-lg text-micro font-black tracking-wide uppercase transition-all ${
                  jenis === 'Baru'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Pinjam Baru
              </button>
              <button
                type="button"
                onClick={() => setJenis('Pelunasan')}
                className={`py-1.5 rounded-lg text-micro font-black tracking-wide uppercase transition-all ${
                  jenis === 'Pelunasan'
                    ? 'bg-brand-500 text-text-inverse shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Pelunasan
              </button>
              <button
                type="button"
                onClick={() => setJenis('Transfer')}
                className={`py-1.5 rounded-lg text-micro font-black tracking-wide uppercase transition-all ${
                  jenis === 'Transfer'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Transfer
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-slate-400 text-nano uppercase font-bold">Tanggal</Label>
                  <Input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    required
                    className="bg-slate-900 border-white/5 text-body text-white h-9 rounded-xl pr-2 focus:border-violet-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-400 text-nano uppercase font-bold">
                    {jenis === 'Transfer' ? 'Dari Akun' : 'Nama Pemegang'}
                  </Label>
                  <select
                    className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-900 text-body text-white px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    value={akunTalang}
                    onChange={(e) => setAkunTalang(e.target.value as AkunTalang)}
                  >
                    <option value="Jisoi">Jisoi</option>
                    <option value="Rakka">Rakka</option>
                    <option value="Shae">Shae</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {jenis === 'Transfer' && (
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-nano uppercase font-bold">Ke Akun Tujuan</Label>
                    <select
                      className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-900 text-body text-white px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      value={akunTujuan}
                      onChange={(e) => setAkunTujuan(e.target.value as AkunTalang)}
                    >
                      <option value="Jisoi">Jisoi</option>
                      <option value="Rakka">Rakka</option>
                      <option value="Shae">Shae</option>
                    </select>
                  </div>
                )}

                {jenis === 'Baru' && (
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-nano uppercase font-bold">Unit Terkait</Label>
                    <select
                      className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-900 text-body text-white px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      value={unit || 'SD'}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="Yayasan">Yayasan</option>
                    </select>
                  </div>
                )}

                <div className={`space-y-1 ${jenis === 'Pelunasan' ? 'col-span-2' : ''}`}>
                  <Label className="text-slate-400 text-nano uppercase font-bold">Nominal (IDR)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body font-bold text-slate-500 font-mono">Rp</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Masukkan nominal"
                      value={nominal}
                      onChange={e => setNominal(e.target.value)}
                      required
                      className="bg-slate-900 border-white/4 text-body text-white h-9 rounded-xl pl-8 placeholder:text-slate-605 w-full focus:border-violet-500/40"
                    />
                  </div>
                  {Number(nominal) < 0 && (
                    <span className="text-micro text-rose-500 font-semibold block mt-1">
                      ⚠ Nominal tidak boleh bernilai negatif!
                    </span>
                  )}
                </div>
              </div>

              {/* Real-time formatted helper & spelling text to prevent zero entry mistakes */}
              {numericNominal > 0 && (
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-white/5 text-micro space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex justify-between items-center text-nano font-bold text-slate-500">
                    <span>SPELLING PREWIEW INDONESIA</span>
                    <span className="text-violet-400">BENDAHARA ASSIST</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Terbaca: </span>
                    <strong className="text-violet-300 font-black">{formatCurrency(numericNominal)}</strong>
                  </div>
                  <div className="border-t border-white/5 pt-1 text-slate-400 italic font-medium leading-relaxed">
                    "{getTerbilang(numericNominal)}"
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-slate-400 text-nano uppercase font-bold">Keterangan Catatan Keuangan</Label>
                <Input
                  placeholder="Detail sirkulasi dana / keperluan sekolah..."
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  required
                  className="bg-slate-900 border-white/5 text-body text-white h-9 rounded-xl placeholder:text-slate-600 focus:border-violet-500/40"
                />
              </div>

              {jenis === 'Pelunasan' && (
                <div className="bg-brand-500/10 p-2.5 rounded-xl text-micro text-brand-500 border border-brand-500/15 leading-relaxed flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div>
                    <strong>Pelunasan Otomatis:</strong> Kas Utama Sekolah <strong>(Pengeluaran)</strong> akan terpotong secara real-time sejumlah nominal di atas untuk menyinkronkan pengembalian {akunTalang}.
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {editingId && (
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-body h-9 rounded-xl transition-all"
                >
                  Batal
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className={`${editingId ? 'flex-1' : 'w-full'} bg-violet-500 hover:bg-violet-600 text-white font-black text-body h-9 rounded-xl shadow-md`}
              >
                {submitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Daftarkan Transaksi Talangan')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Talang History Ledger */}
      <Card className="bg-[#121829]/40 border border-white/5 rounded-3xl p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-1">
          <span className="text-label font-black text-slate-300 uppercase tracking-wide">Linimasa & Log Transaksi</span>
          <span className="text-nano font-semibold text-slate-500 font-mono">Buku Kas Pembantu</span>
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari keterangan, akun, unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 bg-[#121829]/70 border-white/5 text-body text-white h-10 rounded-xl w-full focus-visible:ring-violet-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 h-10 rounded-xl text-body font-bold transition-all border active:scale-95 ${
                showAdvancedFilters || dateFrom || dateTo || akunFilter !== 'Semua' || unitFilter !== 'Semua'
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-300 font-black'
                  : 'bg-[#121829]/60 border-white/5 text-slate-300 hover:border-white/10'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {(dateFrom || dateTo || akunFilter !== 'Semua' || unitFilter !== 'Semua' || quickDate !== 'Semua') && (
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse ml-0.5" />
              )}
            </button>

            {isAnyFilterActive && (
              <button
                onClick={handleResetFilters}
                className="flex items-center justify-center p-2.5 h-10 w-10 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all active:scale-95"
                title="Reset Semua Filter"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Segmented Filter for talang types */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#121829]/30 p-1.5 rounded-xl border border-white/5">
            <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
              {[
                { label: 'Semua', value: 'Semua', count: countAll },
                { label: 'Baru', value: 'Baru', count: countBaru, color: 'text-violet-400 font-black' },
                { label: 'Lunas', value: 'Pelunasan', count: countPelunasan, color: 'text-brand-500 font-black' },
                { label: 'Transfer', value: 'Transfer', count: countTransfer, color: 'text-blue-400 font-black' }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setJenisFilter(item.value as any)}
                  className={`px-1.5 py-1.5 rounded-lg text-micro font-semibold flex items-center justify-center gap-1 transition-all ${
                    jenisFilter === item.value
                      ? 'bg-violet-500 text-white shadow font-black'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className={jenisFilter === item.value ? 'text-white' : item.color}>{item.label}</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded-full font-medium ${
                    jenisFilter === item.value
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-white/5 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-nano text-slate-400 px-1 py-1 sm:py-0 font-medium text-right sm:text-left">
              Menampilkan <span className="text-violet-400 font-bold">{filteredTalang.length}</span> dari <span className="text-white">{talang.length}</span> catatan
            </div>
          </div>

          {/* Collapsible Advanced Filters Row */}
          {showAdvancedFilters && (
            <div className="p-3 bg-[#121829]/80 border border-violet-500/15 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Quick Date Presets */}
              <div className="space-y-1.5">
                <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block">Pilihan Rentang Waktu</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Bulan Ini', value: 'Bulan Ini' },
                    { label: '30 Hari Terakhir', value: '30_hari' }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleQuickDateChange(preset.value)}
                      className={`px-2.5 py-1 rounded-lg text-micro font-medium transition-all ${
                        quickDate === preset.value
                          ? 'bg-violet-500/15 border border-violet-500/35 text-violet-300 font-bold'
                          : 'bg-slate-900/40 border border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Picker Range & Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block">Rentang Tanggal Kustom</Label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setQuickDate('Custom');
                        }}
                        className="px-2 bg-slate-950/80 border-white/5 text-label text-slate-300 h-8 rounded-lg w-full focus-visible:ring-violet-500 [color-scheme:dark]"
                      />
                    </div>
                    <span className="text-slate-500 text-body">-</span>
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setQuickDate('Custom');
                        }}
                        className="px-2 bg-slate-950/80 border-white/5 text-label text-slate-300 h-8 rounded-lg w-full focus-visible:ring-violet-500 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block">Akun/Pemegang</Label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-white/5 bg-slate-950/80 text-label text-slate-300 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={akunFilter}
                    onChange={(e) => setAkunFilter(e.target.value)}
                  >
                    {uniqueAkun.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block">Unit Terkait</Label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-white/5 bg-slate-950/80 text-label text-slate-300 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                  >
                    {uniqueUnit.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sorting Selection Rows */}
              <div className="border-t border-white/5 pt-2.5">
                <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Metode Pengurutan Audit</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSortBy('tanggal_desc')}
                    className={`px-2.5 py-1.5 rounded-lg text-micro font-semibold text-center border transition-all ${
                      sortBy === 'tanggal_desc'
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 font-black'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-350'
                    }`}
                  >
                    Tanggal Terbaru
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('tanggal_asc')}
                    className={`px-2.5 py-1.5 rounded-lg text-micro font-semibold text-center border transition-all ${
                      sortBy === 'tanggal_asc'
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 font-black'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-350'
                    }`}
                  >
                    Tanggal Terlama
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('nominal_desc')}
                    className={`px-2.5 py-1.5 rounded-lg text-micro font-semibold text-center border transition-all ${
                      sortBy === 'nominal_desc'
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 font-black'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-350'
                    }`}
                  >
                    Nominal Terbesar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('nominal_asc')}
                    className={`px-2.5 py-1.5 rounded-lg text-micro font-semibold text-center border transition-all ${
                      sortBy === 'nominal_asc'
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 font-black'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-350'
                    }`}
                  >
                    Nominal Terkecil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Pills list */}
          {isAnyFilterActive && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-nano font-bold text-slate-500 uppercase tracking-wider">Filter Aktif:</span>

              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-nano font-medium bg-violet-500/10 border border-violet-500/15 text-violet-300">
                  Cari: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {jenisFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-nano font-medium bg-violet-500/10 border border-violet-500/15 text-violet-300">
                  Jenis: {jenisFilter}
                  <button onClick={() => setJenisFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {quickDate !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-nano font-medium bg-violet-500/10 border border-violet-500/15 text-violet-300">
                  Waktu: {quickDate === '30_hari' ? '30 Hari Terakhir' : quickDate}
                  <button onClick={() => { setQuickDate('Semua'); setDateFrom(''); setDateTo(''); }} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {(dateFrom || dateTo) && quickDate === 'Custom' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-nano font-medium bg-violet-500/10 border border-violet-500/15 text-violet-300">
                  Rentang: {dateFrom || '...'} s/d {dateTo || '...'}
                  <button onClick={() => { setDateFrom(''); setDateTo(''); setQuickDate('Semua'); }} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {akunFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-nano font-medium bg-violet-500/10 border border-violet-500/15 text-violet-300">
                  Akun: {akunFilter}
                  <button onClick={() => setAkunFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {unitFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-nano font-medium bg-violet-500/10 border border-violet-500/15 text-violet-300">
                  Unit: {unitFilter}
                  <button onClick={() => setUnitFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-nano text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer ml-1"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* List of transactions */}
        <div className="space-y-2 no-scrollbar pr-0.5">
          {filteredTalang.map((t) => {
            let bgTheme = "text-violet-400 bg-violet-400/10 border-violet-400/15";
            let Icon = ArrowUpRight;
            let showOp = "+";

            if (t.jenis === 'Pelunasan') {
              bgTheme = "text-brand-500 bg-brand-500/10 border-brand-500/15";
              Icon = ArrowDownLeft;
              showOp = "-";
            } else if (t.jenis === 'Transfer') {
              bgTheme = "text-blue-400 bg-blue-400/10 border-blue-400/15";
              Icon = ArrowLeftRight;
              showOp = "";
            }

            return (
              <div
                key={t.id}
                className={`p-3 rounded-2xl bg-[#121829]/60 border transition-all grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 cursor-pointer ${
                  editingId === t.id
                    ? 'border-violet-500 bg-[#121829]/95 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'border-white/5 hover:border-white/10 hover:bg-[#121829]/95'
                }`}
                onClick={() => {
                  if (editingId === t.id) return;
                  setExpandedId(expandedId === t.id ? null : t.id);
                }}
              >
                {/* Kolom 1 row 1: tanggal */}
                <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex justify-center justify-self-center select-none">
                  <span className="text-micro font-bold text-slate-400 font-mono text-center">
                    {formatIgnoreTimezone(t.tanggal, 'dd/MM', { locale: localeId })}
                  </span>
                </div>

                {/* Kolom 1 row 2: akun tag */}
                <div className="col-start-1 col-end-2 row-start-2 row-end-3 flex justify-center justify-self-center w-full">
                  <span className={`px-1.5 py-0.5 rounded-md text-nano font-bold border shrink-0 text-center w-full max-w-[56px] truncate leading-none ${
                    t.akun_talang === 'Jisoi'
                      ? 'bg-violet-500/10 border-violet-500/20 text-violet-300'
                      : t.akun_talang === 'Rakka'
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                  }`}>
                    {t.akun_talang}
                  </span>
                </div>

                {/* Kolom 2+3 row 1: Keterangan */}
                <div className="col-start-2 col-end-4 row-start-1 row-end-2 min-w-0 flex items-end pb-0.5">
                  <span className="text-body font-bold text-slate-100 block truncate leading-tight">
                    {t.jenis === 'Transfer' ? `Transfer: ${t.akun_talang} → ${t.akun_tujuan}` : t.keterangan}
                  </span>
                </div>

                {/* Kolom 2 row 2: Nominal */}
                <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center">
                  <span className={`text-body font-black ${t.jenis === 'Pelunasan' ? 'text-brand-500' : 'text-violet-400'}`}>
                    {showOp}{formatCurrency(t.nominal)}
                  </span>
                </div>

                {/* Kolom 3 row 2: chevron */}
                <div className="col-start-3 col-end-4 row-start-2 row-end-3 flex items-center justify-end">
                  <motion.div
                    animate={{ rotate: expandedId === t.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </motion.div>
                </div>

                {/* Expanded detail area — full width */}
                <AnimatePresence>
                  {expandedId === t.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="col-start-1 col-end-4 overflow-hidden"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="border-t border-white/5 mt-1 pt-2 space-y-2">
                        {/* Badge jenis + icon + unit/akun_tujuan */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-nano border ${bgTheme}`}>
                            <Icon className="h-3 w-3" aria-hidden="true" />
                            {t.jenis === 'Baru' ? 'Pinjaman Baru' : t.jenis}
                          </span>
                          {t.unit && t.jenis === 'Baru' && (
                            <span className="bg-white/5 px-1.5 py-0.5 rounded text-nano text-slate-300 border border-white/5">
                              Unit {t.unit}
                            </span>
                          )}
                          {t.jenis === 'Transfer' && t.akun_tujuan && (
                            <span className="bg-blue-500/10 px-1.5 py-0.5 rounded text-nano text-blue-300 border border-blue-500/20">
                              → {t.akun_tujuan}
                            </span>
                          )}
                        </div>
                        {/* Keterangan full (hanya jika bukan Transfer) */}
                        {t.keterangan && t.jenis !== 'Transfer' && (
                          <div className="text-nano text-slate-400">{t.keterangan}</div>
                        )}
                        {/* Tanggal lengkap */}
                        <div className="text-nano text-slate-500">
                          {formatIgnoreTimezone(t.tanggal, 'EEEE, dd MMMM yyyy', { locale: localeId })}
                        </div>
                        {/* Action buttons */}
                        {isBendahara && (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleStartEdit(t)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-nano text-slate-400 hover:text-violet-400 hover:bg-white/5 border border-white/5 transition-colors"
                            >
                              <Edit2 className="h-3 w-3" />
                              Ubah
                            </button>
                            <button
                              onClick={async () => {
                                const isConfirmed = await confirm({
                                  title: 'Hapus Catatan Talang',
                                  message: `Apakah Anda benar-benar yakin ingin menghapus data talangan "${t.keterangan || t.jenis}" senilai ${formatCurrency(t.nominal)} secara permanen?` +
                                    (t.jenis === 'Pelunasan' ? ' Tindakan ini juga akan otomatis membatalkan kas pengeluaran terkait.' : ''),
                                  confirmLabel: 'Ya, Hapus',
                                  cancelLabel: 'Batal',
                                  variant: 'danger'
                                });
                                if (isConfirmed && t.id) {
                                  await handleDelete(t.id);
                                }
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-nano text-slate-400 hover:text-rose-400 hover:bg-white/5 border border-white/5 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredTalang.length === 0 && (
            <div className="text-center py-12 text-body text-slate-500 border border-dashed border-white/5 rounded-3xl">
              Belum ada transaksi dana talang terekam untuk penyaringan ini.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
