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
import { TrendingUp, TrendingDown, Plus, X, Calendar, Wallet, Search, SlidersHorizontal, RotateCcw, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { parseDateIgnoreTimezone, formatIgnoreTimezone } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const getLocalDateString = (dateInput: any) => {
  const d = parseDateIgnoreTimezone(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Kas() {
  const { kas, loading, refetch } = useTransactions();
  const { user, isBendahara } = useAuth();
  const { toast, confirm } = useFeedback();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStartEdit = (t: any) => {
    setExpandedId(null);
    setEditingId(t.id || null);
    setJenis(t.jenis);
    setTanggal(getLocalDateString(t.tanggal));
    if (t.jenis === 'Pemasukan') {
      setSumberDana(t.sumber_dana || 'BOS SD');
    } else {
      setKategori(t.kategori || '');
    }
    setKeterangan(t.keterangan);
    setNominal(String(t.nominal));
    setShowForm(true);

    // Smoothly scroll to the form element
    setTimeout(() => {
      const formElement = document.getElementById('kas-action-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCancelEdit = async () => {
    if (!editingId && (keterangan.trim() || nominal.trim())) {
      const isConfirmed = await confirm({
        title: 'Batalkan Catatan',
        message: 'Apakah Anda yakin ingin mematalkan rekap keuangan ini? Semua data yang telah Anda ketik akan dibuang.',
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
    setKategori('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await safeFetch(`/api/kas/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus transaksi');
      }
      await refetch();
      toast.success('Rekam transaksi berhasil dihapus dari Buku Kas utama.');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Gagal menghapus catatan transaksi pada server.');
    }
  };

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [jenisFilter, setJenisFilter] = useState<'Semua' | 'Pemasukan' | 'Pengeluaran'>('Semua');
  const [sumberDanaFilter, setSumberDanaFilter] = useState<string>('Semua');
  const [kategoriFilter, setKategoriFilter] = useState<string>('Semua');
  const [quickDate, setQuickDate] = useState<string>('Semua');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Form State
  const [jenis, setJenis] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [sumberDana, setSumberDana] = useState('BOS SD');
  const [kategori, setKategori] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Extract unique kategori and sumber_dana from kas database for precise dropdown filtering
  const uniqueKategori = useMemo(() => {
    const kats = kas
      .map(t => t.kategori)
      .filter((k): k is string => !!k);
    return ['Semua', ...Array.from(new Set(kats))];
  }, [kas]);

  const uniqueSumberDana = useMemo(() => {
    const sd = kas
      .map(t => t.sumber_dana)
      .filter((s): s is string => !!s);
    return ['Semua', ...Array.from(new Set(sd))];
  }, [kas]);

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
           sumberDanaFilter !== 'Semua' ||
           kategoriFilter !== 'Semua' ||
           quickDate !== 'Semua';
  }, [searchTerm, dateFrom, dateTo, jenisFilter, sumberDanaFilter, kategoriFilter, quickDate]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setJenisFilter('Semua');
    setSumberDanaFilter('Semua');
    setKategoriFilter('Semua');
    setQuickDate('Semua');
  };

  const filteredKas = useMemo(() => {
    return kas.filter(t => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = t.keterangan.toLowerCase().includes(s) ||
                            (t.kategori && t.kategori.toLowerCase().includes(s)) ||
                            (t.sumber_dana && t.sumber_dana.toLowerCase().includes(s));

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

      let matchesSumberDana = true;
      if (sumberDanaFilter !== 'Semua') {
        matchesSumberDana = t.sumber_dana === sumberDanaFilter;
      }

      let matchesKategori = true;
      if (kategoriFilter !== 'Semua') {
        matchesKategori = t.kategori === kategoriFilter;
      }

      return matchesSearch && matchesDate && matchesJenis && matchesSumberDana && matchesKategori;
    });
  }, [kas, searchTerm, dateFrom, dateTo, jenisFilter, sumberDanaFilter, kategoriFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-10 w-10 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Memuat Buku Kas...</span>
      </div>
    );
  }

  const kasBalance = kas.reduce((acc, curr) => {
    return curr.jenis === 'Pemasukan' ? acc + curr.nominal : acc - curr.nominal;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const currentMonthTransactions = kas.filter(t => {
    const d = parseDateIgnoreTimezone(t.tanggal);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const pemasukanBulanIni = currentMonthTransactions.filter(t => t.jenis === 'Pemasukan').reduce((sum, t) => sum + t.nominal, 0);
  const pengeluaranBulanIni = currentMonthTransactions.filter(t => t.jenis === 'Pengeluaran').reduce((sum, t) => sum + t.nominal, 0);

  const countAll = kas.length;
  const countPemasukan = kas.filter(t => t.jenis === 'Pemasukan').length;
  const countPengeluaran = kas.filter(t => t.jenis === 'Pengeluaran').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isConfirmed = await confirm({
      title: editingId ? 'Konfirmasi Perubahan Catatan' : 'Konfirmasi Penyimpanan Transaksi',
      message: editingId
        ? `Apakah Anda yakin ingin memodifikasi data rekap ini dengan nominal senilai ${formatCurrency(Number(nominal))}?`
        : `Simpan transaksi ${jenis === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran'} baru sebesar ${formatCurrency(Number(nominal))} ke Buku Kas?`,
      confirmLabel: editingId ? 'Ya, Perbarui' : 'Ya, Simpan',
      cancelLabel: 'Batal',
      variant: 'success'
    });
    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      const url = editingId ? `/api/kas/${editingId}` : '/api/kas';
      const method = editingId ? 'PUT' : 'POST';

      const response = await safeFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tanggal: new Date(tanggal).toISOString(),
          jenis,
          keterangan,
          nominal: Number(nominal),
          sumber_dana: jenis === 'Pemasukan' ? sumberDana : undefined,
          kategori: jenis === 'Pengeluaran' ? kategori : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan transaksi');
      }

      await refetch();

      toast.success(
        editingId ? 'Catatan rekap keuangan berhasil diperbarui.' : 'Transaksi luar/masuk baru telah sukses direkam.',
        'Transaksi Disimpan'
      );

      // Force state resets cleanly without double warning
      setEditingId(null);
      setKeterangan('');
      setNominal('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setKategori('');
      setShowForm(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Terjadi gangguan saat menyimpan data catatan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Modern Compact Flow Highlights */}
      <div className="flex flex-col gap-2">
        {/* Baris 1: Saldo Kas */}
        <div className="bg-surface-card/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-nano font-bold text-slate-400 uppercase tracking-wide">Saldo Kas</span>
            <span className="text-[18px] font-black text-white leading-tight mt-1 truncate">
              {formatCurrency(kasBalance)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        {/* Baris 2: In (Bulan ini) + Out (Bulan ini) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-card/60 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-nano font-bold text-brand-500 uppercase">In (Bulan ini)</span>
            <span className="text-value font-bold text-brand-500 leading-tight mt-1 truncate">
              {formatCurrency(pemasukanBulanIni)}
            </span>
          </div>
          <div className="bg-surface-card/60 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-nano font-bold text-rose-400 uppercase">Out (Bulan ini)</span>
            <span className="text-value font-bold text-rose-400 leading-tight mt-1 truncate">
              {formatCurrency(pengeluaranBulanIni)}
            </span>
          </div>
        </div>
      </div>

      {/* Trigger Button or Active Form Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-value font-bold text-slate-300">Rekap Buku Kas Utama</h2>
        {isBendahara && (
          <button
            onClick={() => { if (showForm) { handleCancelEdit(); } else { setShowForm(true); } }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-label font-bold transition-all active:scale-95 border ${
              showForm
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-brand-500/10 text-brand-500 border-brand-500/20 shadow-sm'
            }`}
          >
            {showForm ? <><X className="h-3 w-3" /> {editingId ? 'Batal Ubah' : 'Tutup'}</> : <><Plus className="h-3 w-3" /> Transaksi Baru</>}
          </button>
        )}
      </div>

      {showForm && isBendahara && (
        <Card id="kas-action-form" className="bg-surface-elevated/90 border border-brand-500/20 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
          <h3 className="text-sm font-bold text-brand-500 mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Wallet className="h-4 w-4" /> {editingId ? 'Ubah Catatan Aliran' : 'Catat Aliran Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Segmented Toggle for Jenis */}
            <div className="bg-slate-900/60 p-1 rounded-xl grid grid-cols-2 gap-1 border border-white/5">
              <button
                type="button"
                onClick={() => setJenis('Pemasukan')}
                className={`py-1.5 rounded-lg text-body font-bold transition-all ${
                  jenis === 'Pemasukan'
                    ? 'bg-brand-500 text-text-inverse shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pemasukan (CR)
              </button>
              <button
                type="button"
                onClick={() => setJenis('Pengeluaran')}
                className={`py-1.5 rounded-lg text-body font-bold transition-all ${
                  jenis === 'Pengeluaran'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pengeluaran (DR)
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-slate-400 text-micro uppercase font-bold">Tanggal</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={tanggal}
                      onChange={e => setTanggal(e.target.value)}
                      required
                      className="bg-slate-900/80 border-white/5 text-body text-white h-9 rounded-xl pr-2"
                    />
                  </div>
                </div>

                {jenis === 'Pemasukan' ? (
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-micro uppercase font-bold">Sumber Dana</Label>
                    <select
                      className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-900/80 text-body text-white px-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={sumberDana}
                      onChange={(e) => setSumberDana(e.target.value)}
                    >
                      <option value="BOS SD">BOS SD</option>
                      <option value="BOS SMP">BOS SMP</option>
                      <option value="BOS SMA">BOS SMA</option>
                      <option value="SPP">SPP</option>
                      <option value="Donatur">Donatur</option>
                      <option value="Hibah">Hibah</option>
                      <option value="Unit Usaha">Unit Usaha</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-micro uppercase font-bold">Kategori</Label>
                    <Input
                      placeholder="cth: Gaji, Sarpras"
                      value={kategori}
                      onChange={e => setKategori(e.target.value)}
                      required
                      className="bg-slate-900/80 border-white/5 text-body text-white h-9 rounded-xl placeholder:text-slate-600"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-micro uppercase font-bold">Nominal (IDR)</Label>
                <div className="relative justify-center flex">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body font-bold text-slate-500 font-mono">Rp</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Masukkan nominal"
                    value={nominal}
                    onChange={e => setNominal(e.target.value)}
                    required
                    className="bg-slate-900/80 border-white/5 text-body text-white h-9 rounded-xl pl-8 placeholder:text-slate-600 w-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-micro uppercase font-bold">Keterangan / Deskripsi</Label>
                <Input
                  placeholder="Detail tujuan aliran dana..."
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  required
                  className="bg-slate-900/80 border-white/5 text-body text-white h-9 rounded-xl placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
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
                className={`${editingId ? 'flex-1' : 'w-full'} bg-brand-500 hover:bg-brand-400 text-text-inverse font-black text-body h-9 rounded-xl transition-all shadow-md`}
              >
                {submitting ? 'Menyimpan...' : (editingId ? 'Ubah Transaksi' : 'Simpan Setor / Tarik')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Ledger List Card */}
      <Card className="bg-surface-card/40 border-white/5 rounded-2xl p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
          <span className="text-label font-bold text-slate-300">Catatan Aliran Kas</span>
          <span className="text-nano font-semibold text-slate-500">Urut Terkini</span>
        </div>

        {/* Modern Filter Section */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari keterangan, kategori, sumber dana..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 bg-surface-card/60 border-white/5 text-body text-white h-10 rounded-xl w-full focus-visible:ring-brand-500"
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
                showAdvancedFilters || dateFrom || dateTo || sumberDanaFilter !== 'Semua' || kategoriFilter !== 'Semua'
                  ? 'bg-brand-500/10 border-brand-500/25 text-brand-500'
                  : 'bg-surface-card/60 border-white/5 text-slate-300 hover:border-white/10'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter Lanjutan</span>
              {(dateFrom || dateTo || sumberDanaFilter !== 'Semua' || kategoriFilter !== 'Semua' || quickDate !== 'Semua') && (
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse ml-0.5" />
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

          {/* Quick Segmented Filter for Aliran Jenis */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-card/30 p-1.5 rounded-xl border border-white/5">
            <div className="grid grid-cols-3 gap-1 w-full sm:w-auto">
              {[
                { label: 'Semua', value: 'Semua', count: countAll },
                { label: 'Pemasukan', value: 'Pemasukan', count: countPemasukan, color: 'text-brand-500' },
                { label: 'Pengeluaran', value: 'Pengeluaran', count: countPengeluaran, color: 'text-rose-400' }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setJenisFilter(item.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-body font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    jenisFilter === item.value
                      ? 'bg-brand-500 text-text-inverse shadow font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={jenisFilter === item.value ? 'text-text-inverse hover:text-text-inverse' : item.color}>{item.label}</span>
                  <span className={`text-nano px-1.5 py-0.5 rounded-full font-medium ${
                    jenisFilter === item.value
                      ? 'bg-slate-950/20 text-text-inverse font-bold'
                      : 'bg-white/5 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-micro text-slate-400 px-1 py-1 sm:py-0 font-medium text-right sm:text-left">
              Menampilkan <span className="text-brand-500 font-bold">{filteredKas.length}</span> dari <span className="text-white">{kas.length}</span> transaksi
            </div>
          </div>

          {/* Collapsible Advanced Filters Row */}
          {showAdvancedFilters && (
            <div className="p-3 bg-surface-card/80 border border-brand-500/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Quick Date Presets */}
              <div className="space-y-1.5">
                <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block">Pilihan Waktu Cepat</Label>
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
                          ? 'bg-brand-500/10 border border-brand-500/30 text-brand-500 font-bold'
                          : 'bg-slate-900/40 border border-white/5 text-slate-400 hover:text-slate-300'
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
                        className="px-2 bg-slate-950/80 border-white/5 text-label text-slate-300 h-8 rounded-lg w-full focus-visible:ring-brand-500 [color-scheme:dark]"
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
                        className="px-2 bg-slate-950/80 border-white/5 text-label text-slate-300 h-8 rounded-lg w-full focus-visible:ring-brand-500 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block">Sumber Dana</Label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-white/5 bg-slate-950/80 text-label text-slate-300 px-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={sumberDanaFilter}
                    onChange={(e) => setSumberDanaFilter(e.target.value)}
                  >
                    {uniqueSumberDana.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-nano font-bold text-slate-400 uppercase tracking-wider block">Kategori</Label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-white/5 bg-slate-950/80 text-label text-slate-300 px-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={kategoriFilter}
                    onChange={(e) => setKategoriFilter(e.target.value)}
                  >
                    {uniqueKategori.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Pills list */}
          {isAnyFilterActive && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-nano font-bold text-slate-500 uppercase tracking-wider">Filter Aktif:</span>

              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-medium bg-brand-500/10 border border-brand-500/20 text-brand-500">
                  Kata Kunci: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {jenisFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-medium bg-brand-500/10 border border-brand-500/20 text-brand-500">
                  Jenis: {jenisFilter}
                  <button onClick={() => setJenisFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {quickDate !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-medium bg-brand-500/10 border border-brand-500/20 text-brand-500">
                  Waktu: {quickDate === '30_hari' ? '30 Hari Terakhir' : quickDate}
                  <button onClick={() => { setQuickDate('Semua'); setDateFrom(''); setDateTo(''); }} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {(dateFrom || dateTo) && quickDate === 'Custom' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-medium bg-brand-500/10 border border-brand-500/20 text-brand-500">
                  Rentang: {dateFrom || '...'} s/d {dateTo || '...'}
                  <button onClick={() => { setDateFrom(''); setDateTo(''); setQuickDate('Semua'); }} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {sumberDanaFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-medium bg-brand-500/10 border border-brand-500/20 text-brand-500">
                  Sumber: {sumberDanaFilter}
                  <button onClick={() => setSumberDanaFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {kategoriFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-medium bg-brand-500/10 border border-brand-500/20 text-brand-500">
                  Kategori: {kategoriFilter}
                  <button onClick={() => setKategoriFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-micro text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer ml-1"
              >
                Atur Ulang
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 no-scrollbar pr-0.5">
          {filteredKas.map((t) => {
            const isPemasukan = t.jenis === 'Pemasukan';
            return (
              <div
                key={t.id}
                className={`p-3 rounded-2xl bg-surface-card/60 border transition-all grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 cursor-pointer ${
                  editingId === t.id
                    ? 'border-brand-500 bg-surface-card/95 shadow-[0_0_15px_rgba(0,229,163,0.15)]'
                    : 'border-white/5 hover:border-white/10'
                }`}
                onClick={() => {
                  if (editingId === t.id) return;
                  setExpandedId(expandedId === t.id ? null : t.id);
                }}
              >
                {/* Kolom 1 rowspan-2: Tanggal mini card */}
                <div className="col-start-1 col-end-2 row-start-1 row-end-3 flex flex-col items-center justify-center self-center w-10 min-h-[2.75rem] bg-white/5 rounded-xl border border-white/10 px-1 gap-0.5">
                  <span className="text-nano text-slate-500 font-medium leading-none uppercase">
                    {formatIgnoreTimezone(t.tanggal, 'MMM', { locale: localeId })}
                  </span>
                  <span className="text-value font-black text-slate-100 leading-none">
                    {formatIgnoreTimezone(t.tanggal, 'dd', { locale: localeId })}
                  </span>
                </div>

                {/* Kolom 2+3 row 1: Keterangan */}
                <div className="col-start-2 col-end-4 row-start-1 row-end-2 min-w-0 flex items-end pb-0.5">
                  <span className="text-body font-bold text-slate-100 block truncate leading-tight">
                    {t.keterangan}
                  </span>
                </div>

                {/* Kolom 2 row 2: Nominal */}
                <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center">
                  <span className={`text-body font-black ${isPemasukan ? 'text-brand-500' : 'text-rose-400'}`}>
                    {isPemasukan ? '+' : '-'}{formatCurrency(t.nominal)}
                  </span>
                </div>

                {/* Kolom 3 row 2: Chevron toggle */}
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
                        {/* Badge jenis + sumber/kategori */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-nano border ${
                            isPemasukan
                              ? 'bg-brand-500/10 text-brand-500 border-brand-500/10'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                          }`}>
                            {isPemasukan ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
                            {t.jenis}
                          </span>
                          <span className="bg-white/5 px-1.5 py-0.5 rounded text-nano text-slate-300 border border-white/5">
                            {isPemasukan ? t.sumber_dana : t.kategori}
                          </span>
                        </div>
                        {/* Tanggal lengkap */}
                        <div className="text-nano text-slate-500">
                          {formatIgnoreTimezone(t.tanggal, 'EEEE, dd MMMM yyyy', { locale: localeId })}
                        </div>
                        {/* Action buttons */}
                        {isBendahara && (
                          t.kategori === 'Pelunasan Dana Talang' ? (
                            <div className="text-micro text-slate-500 italic text-right">
                              Kelola di Dana Talang
                            </div>
                          ) : (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleStartEdit(t)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-nano text-slate-400 hover:text-brand-500 hover:bg-white/5 border border-white/5 transition-colors"
                              >
                                <Edit2 className="h-3 w-3" />
                                Ubah
                              </button>
                              <button
                                onClick={async () => {
                                  const isConfirmed = await confirm({
                                    title: 'Hapus Transaksi Kas',
                                    message: `Apakah Anda benar-benar yakin ingin melenyapkan catatan "${t.keterangan}" senilai ${formatCurrency(t.nominal)} secara permanen?`,
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
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredKas.length === 0 && (
            <div className="text-center py-10 text-body text-slate-500 border border-dashed border-white/5 rounded-2xl">
              {isAnyFilterActive ? 'Tidak ada transaksi yang sesuai filter.' : 'Belum ada transaksi terekam.'}
            </div>
          )}
        </div>
      </Card>


    </div>
  );
}
