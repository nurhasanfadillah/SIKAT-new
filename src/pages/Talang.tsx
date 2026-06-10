import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { safeFetch } from '../lib/auth-client';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { format, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Plus, X, ArrowLeftRight, CreditCard, Layers, ArrowUpRight, ArrowDownLeft, Search, Calendar, SlidersHorizontal, RotateCcw, Filter, Edit2, Trash2 } from 'lucide-react';
import { AkunTalang, JenisTalang } from '../types';

export default function Talang() {
  const { talang, loading, refetch } = useTransactions();
  const { user, isBendahara } = useAuth();
  const { toast, confirm } = useFeedback();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleStartEdit = (t: any) => {
    setEditingId(t.id || null);
    setJenis(t.jenis);
    setTanggal(new Date(t.tanggal).toISOString().split('T')[0]);
    setAkunTalang(t.akun_talang);
    if (t.jenis === 'Transfer') {
      setAkunTujuan(t.akun_tujuan || 'Rakka');
    } else if (t.jenis === 'Baru') {
      setUnit(t.unit || 'SD');
    }
    setKeterangan(t.keterangan);
    setNominal(String(t.nominal));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = async () => {
    if (keterangan.trim() || nominal) {
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

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [jenisFilter, setJenisFilter] = useState<'Semua' | 'Baru' | 'Pelunasan' | 'Transfer'>('Semua');
  const [akunFilter, setAkunFilter] = useState<string>('Semua');
  const [unitFilter, setUnitFilter] = useState<string>('Semua');
  const [quickDate, setQuickDate] = useState<string>('Semua');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Form State
  const [jenis, setJenis] = useState<JenisTalang>('Baru');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [akunTalang, setAkunTalang] = useState<AkunTalang>('Jisoi');
  const [akunTujuan, setAkunTujuan] = useState<AkunTalang>('Rakka');
  const [unit, setUnit] = useState('SD');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
  };

  const filteredTalang = useMemo(() => {
    return talang.filter(t => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = t.keterangan.toLowerCase().includes(s) || 
                            t.akun_talang.toLowerCase().includes(s) ||
                            (t.akun_tujuan && t.akun_tujuan.toLowerCase().includes(s)) ||
                            (t.unit && t.unit.toLowerCase().includes(s));
      
      let matchesDate = true;
      if (dateFrom) {
         matchesDate = matchesDate && new Date(t.tanggal) >= new Date(dateFrom);
      }
      if (dateTo) {
         matchesDate = matchesDate && new Date(t.tanggal) <= endOfDay(new Date(dateTo));
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
  }, [talang, searchTerm, dateFrom, dateTo, jenisFilter, akunFilter, unitFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-10 w-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Memuat Rekap Talangan...</span>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const talangBalances = { Jisoi: 0, Rakka: 0, Shae: 0 };
  talang.forEach((t) => {
    if (t.jenis === 'Baru') {
      talangBalances[t.akun_talang] += t.nominal;
    } else if (t.jenis === 'Pelunasan') {
      talangBalances[t.akun_talang] -= t.nominal;
    } else if (t.jenis === 'Transfer') {
      talangBalances[t.akun_talang] -= t.nominal;
      if (t.akun_tujuan) {
        talangBalances[t.akun_tujuan as keyof typeof talangBalances] += t.nominal;
      }
    }
  });

  const countAll = talang.length;
  const countBaru = talang.filter(t => t.jenis === 'Baru').length;
  const countPelunasan = talang.filter(t => t.jenis === 'Pelunasan').length;
  const countTransfer = talang.filter(t => t.jenis === 'Transfer').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (jenis === 'Transfer' && akunTalang === akunTujuan) {
      toast.warning("Akun asal dan akun tujuan transfer dana talangan tidak boleh sama!");
      return;
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

  return (
    <div className="space-y-4">
      {/* Modern Compact Cards for Individual balances */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(talangBalances).map(([akun, balance]) => (
          <div key={akun} className="bg-[#121829]/60 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">{akun}</span>
              <div className="h-4.5 w-4.5 rounded-full bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-300 font-extrabold text-[9px]">
                {akun[0]}
              </div>
            </div>
            <span className={`text-[12px] font-extrabold mt-1.5 leading-tight truncate ${balance > 0 ? 'text-violet-400' : 'text-slate-500'}`}>
              {balance > 0 ? formatCurrency(balance) : 'Lunas'}
            </span>
          </div>
        ))}
      </div>

      {/* Title & Floating Create Toggle */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-[13px] font-bold text-slate-300">Rekap Kewajiban Aktif</h2>
        {isBendahara && (
          <button 
            onClick={() => { if (showForm) { handleCancelEdit(); } else { setShowForm(true); } }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 border ${
              showForm 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : 'bg-violet-500/10 text-violet-300 border-violet-500/20 shadow-sm'
            }`}
          >
            {showForm ? <><X className="h-3 w-3" /> {editingId ? 'Batal Ubah' : 'Tutup'}</> : <><Plus className="h-3 w-3" /> Talangan Baru</>}
          </button>
        )}
      </div>

      {showForm && isBendahara && (
        <Card className="bg-[#161d30]/90 border border-violet-500/20 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
          <h3 className="text-sm font-bold text-violet-400 mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
            <ArrowLeftRight className="h-4 w-4" /> {editingId ? 'Ubah Alokasi Talang' : 'Alokasikan Dana Talang'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Custom Segmented select for Jenis */}
            <div className="bg-slate-900/60 p-1 rounded-xl grid grid-cols-3 gap-1 border border-white/5">
              <button 
                type="button"
                onClick={() => setJenis('Baru')}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                  jenis === 'Baru' 
                    ? 'bg-violet-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hutang Baru
              </button>
              <button 
                type="button"
                onClick={() => setJenis('Pelunasan')}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                  jenis === 'Pelunasan' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pelunasan
              </button>
              <button 
                type="button"
                onClick={() => setJenis('Transfer')}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                  jenis === 'Transfer' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Transfer
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-slate-400 text-[10px] uppercase font-bold">Tanggal</Label>
                  <Input 
                    type="date" 
                    value={tanggal} 
                    onChange={e => setTanggal(e.target.value)} 
                    required 
                    className="bg-slate-900/80 border-white/5 text-xs text-white h-9 rounded-xl pr-2" 
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-400 text-[10px] uppercase font-bold">
                    {jenis === 'Transfer' ? 'Dari Akun' : 'Nama Pemegang'}
                  </Label>
                  <select 
                    className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-900/80 text-xs text-white px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
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
                    <Label className="text-slate-400 text-[10px] uppercase font-bold">Ke Akun</Label>
                    <select 
                      className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-900/80 text-xs text-white px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
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
                    <Label className="text-slate-400 text-[10px] uppercase font-bold">Unit Terkait</Label>
                    <select 
                      className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-900/80 text-xs text-white px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      value={unit}
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
                  <Label className="text-slate-400 text-[10px] uppercase font-bold">Nominal (IDR)</Label>
                  <div className="relative justify-center flex">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">Rp</span>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="Masukkan nominal" 
                      value={nominal} 
                      onChange={e => setNominal(e.target.value)} 
                      required 
                      className="bg-slate-900/80 border-white/5 text-xs text-white h-9 rounded-xl pl-8 placeholder:text-slate-600 w-full" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-[10px] uppercase font-bold">Keterangan Catatan</Label>
                <Input 
                  placeholder="Detail pinjaman / transfer..." 
                  value={keterangan} 
                  onChange={e => setKeterangan(e.target.value)} 
                  required 
                  className="bg-slate-900/80 border-white/5 text-xs text-white h-9 rounded-xl placeholder:text-slate-600" 
                />
              </div>

              {jenis === 'Pelunasan' && (
                <div className="bg-emerald-500/10 p-2.5 rounded-xl text-[10px] text-emerald-400 border border-emerald-500/15 leading-relaxed">
                  💡 <strong>Catatan Pelunasan:</strong> Dana kas utama instansi akan terpotong sejumlah nilai di atas untuk menutup hutang talangan {akunTalang}.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {editingId && (
                <Button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs h-9 rounded-xl transition-all"
                >
                  Batal
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={submitting} 
                className={`${editingId ? 'flex-1' : 'w-full'} bg-violet-500 hover:bg-violet-600 text-white font-extrabold text-xs h-9 rounded-xl shadow-md`}
              >
                {submitting ? 'Menyimpan...' : (editingId ? 'Ubah Transaksi' : 'Simpan Transaksi Talangan')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Talang History Ledger */}
      <Card className="bg-[#121829]/40 border-white/5 rounded-2xl p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
          <span className="text-[11px] font-bold text-slate-300">Linimasa Dana Talang</span>
          <span className="text-[9px] font-semibold text-slate-500">Log Aktivitas</span>
        </div>

        {/* Modern Filter Section */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari keterangan, akun, unit data..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 bg-[#121829]/60 border-white/5 text-xs text-white h-10 rounded-xl w-full focus-visible:ring-violet-500"
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
              className={`flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                showAdvancedFilters || dateFrom || dateTo || akunFilter !== 'Semua' || unitFilter !== 'Semua'
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' 
                  : 'bg-[#121829]/60 border-white/5 text-slate-300 hover:border-white/10'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter Lanjutan</span>
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

          {/* Quick Segmented Filter for Aliran Jenis */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#121829]/30 p-1.5 rounded-xl border border-white/5">
            <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
              {[
                { label: 'Semua', value: 'Semua', count: countAll },
                { label: 'Baru', value: 'Baru', count: countBaru, color: 'text-violet-400' },
                { label: 'Lunas', value: 'Pelunasan', count: countPelunasan, color: 'text-emerald-400' },
                { label: 'Xfer', value: 'Transfer', count: countTransfer, color: 'text-blue-400' }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setJenisFilter(item.value as any)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    jenisFilter === item.value
                      ? 'bg-violet-500 text-white shadow font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={jenisFilter === item.value ? 'text-white' : item.color}>{item.label}</span>
                  <span className={`text-[8px] px-1 py-0.5 rounded-full font-medium ${
                    jenisFilter === item.value 
                      ? 'bg-white/20 text-white font-bold' 
                      : 'bg-white/5 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 px-1 py-1 sm:py-0 font-medium text-right sm:text-left">
              Menampilkan <span className="text-violet-400 font-bold">{filteredTalang.length}</span> dari <span className="text-white">{talang.length}</span> rekam data
            </div>
          </div>

          {/* Collapsible Advanced Filters Row */}
          {showAdvancedFilters && (
            <div className="p-3 bg-[#121829]/80 border border-violet-500/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Quick Date Presets */}
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pilihan Waktu Cepat</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Semua Waktu', value: 'Semua' },
                    { label: 'Hari Ini', value: 'Hari Ini' },
                    { label: 'Bulan Ini', value: 'Bulan Ini' },
                    { label: '30 Hari Terakhir', value: '30_hari' }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleQuickDateChange(preset.value)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        quickDate === preset.value
                          ? 'bg-violet-500/15 border border-violet-500/35 text-violet-300 font-bold'
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
                  <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rentang Tanggal Kustom</Label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                      <Input 
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setQuickDate('Custom');
                        }}
                        className="pl-7 bg-slate-950/80 border-white/5 text-[11px] text-slate-300 h-8 rounded-lg w-full focus-visible:ring-violet-500 [color-scheme:dark]"
                      />
                    </div>
                    <span className="text-slate-500 text-xs">-</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                      <Input 
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setQuickDate('Custom');
                        }}
                        className="pl-7 bg-slate-950/80 border-white/5 text-[11px] text-slate-300 h-8 rounded-lg w-full focus-visible:ring-violet-500 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nama Akun/Pemegang</Label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-white/5 bg-slate-950/80 text-[11px] text-slate-300 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={akunFilter}
                    onChange={(e) => setAkunFilter(e.target.value)}
                  >
                    {uniqueAkun.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Unit Terkait</Label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-white/5 bg-slate-950/80 text-[11px] text-slate-300 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                  >
                    {uniqueUnit.map(opt => (
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
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Filter Aktif:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Kata Kunci: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {jenisFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Jenis: {jenisFilter}
                  <button onClick={() => setJenisFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {quickDate !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Waktu: {quickDate === '30_hari' ? '30 Hari Terakhir' : quickDate}
                  <button onClick={() => { setQuickDate('Semua'); setDateFrom(''); setDateTo(''); }} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {(dateFrom || dateTo) && quickDate === 'Custom' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Rentang: {dateFrom || '...'} s/d {dateTo || '...'}
                  <button onClick={() => { setDateFrom(''); setDateTo(''); setQuickDate('Semua'); }} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {akunFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Akun: {akunFilter}
                  <button onClick={() => setAkunFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              {unitFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Unit: {unitFilter}
                  <button onClick={() => setUnitFilter('Semua')} className="p-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}

              <button 
                onClick={handleResetFilters} 
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer ml-1"
              >
                Atur Ulang
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar pr-0.5">
          {filteredTalang.map((t) => {
            let bgTheme = "text-violet-400 bg-violet-400/10 border-violet-400/15";
            let Icon = ArrowUpRight;
            let showOp = "+";
            
            if (t.jenis === 'Pelunasan') {
              bgTheme = "text-emerald-400 bg-emerald-400/10 border-emerald-400/15";
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
                className="p-3 rounded-2xl bg-[#121829]/60 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-xl border shrink-0 ${bgTheme}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[12px] font-bold text-slate-100 truncate leading-tight">
                      {t.jenis === 'Transfer' ? `Transfer dari ${t.akun_talang} ke ${t.akun_tujuan}` : t.keterangan}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-[9px] text-slate-400 mt-1">
                      <span className="bg-white/5 px-1.5 py-0.5 rounded text-white border border-white/5 font-semibold">
                        {t.akun_talang}
                      </span>
                      <span>•</span>
                      <span className="bg-white/5 px-1.5 py-0.5 rounded text-white border border-white/5 font-medium">
                        {t.jenis}
                      </span>
                      {t.jenis === 'Baru' && t.unit && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-300">Unit {t.unit}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{format(new Date(t.tanggal), 'dd MMM yy', { locale: localeId })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <span className={`text-[12px] font-bold block ${t.jenis === 'Pelunasan' ? 'text-emerald-400' : 'text-violet-400'}`}>
                      {showOp}{formatCurrency(t.nominal)}
                    </span>
                  </div>

                  {isBendahara && (
                    <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                      <button 
                        onClick={() => handleStartEdit(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 transition-colors"
                        title="Ubah Talangan"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                        title="Hapus Talangan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTalang.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl">
              Belum ada transaksi dana talang terekam.
            </div>
          )}
        </div>
      </Card>


    </div>
  );
}
