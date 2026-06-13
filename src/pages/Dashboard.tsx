import { Card } from '../components/ui/card';
import { useTransactions } from '../hooks/useTransactions';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCw, Send, ListCollapse } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { TransaksiKas, TransaksiTalang } from '../types';
import { Link } from 'react-router-dom';
import { parseDateIgnoreTimezone, formatIgnoreTimezone } from '../lib/utils';

export default function Dashboard() {
  const { kas, talang, loading } = useTransactions();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-10 w-10 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Memuat Data Keuangan...</span>
      </div>
    );
  }

  // Calculate Balances
  const kasBalance = kas.reduce((acc, curr) => {
    return curr.jenis === 'Pemasukan' ? acc + curr.nominal : acc - curr.nominal;
  }, 0);

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

  const totalTalangAktif = talangBalances.Jisoi + talangBalances.Rakka + talangBalances.Shae;
  const saldoBersih = kasBalance - totalTalangAktif;
  const talangPct = kasBalance > 0
    ? Math.min(100, (totalTalangAktif / kasBalance) * 100)
    : (totalTalangAktif > 0 ? 100 : 0);
  const saldoPct = kasBalance > 0
    ? Math.min(100, Math.max(0, (saldoBersih / kasBalance) * 100))
    : 0;

  // Recent transactions (Kas and Talang combined, limit to 4 for compact mobile layout)
  const allTransactions = [
    ...kas.map(t => ({ ...t, kind: 'kas' as const })),
    ...talang.map(t => ({ ...t, kind: 'talang' as const }))
  ].sort((a, b) => parseDateIgnoreTimezone(b.tanggal).getTime() - parseDateIgnoreTimezone(a.tanggal).getTime()).slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Premium Gradient Hero Card (Fintech E-Wallet style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-hero-from via-hero-via to-hero-to p-5 border border-white/5 shadow-[0_15px_30px_rgba(4,18,33,0.5)]">
        {/* Glow decorative effects inside hero */}
        <div aria-hidden="true" className="absolute top-[-30%] right-[-10%] w-44 h-44 bg-brand-500/10 rounded-full blur-[50px] pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-[-20%] left-[10%] w-36 h-36 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-micro uppercase tracking-wider text-slate-300 font-bold">Total Saldo Terpusat</span>
          </div>
          <span className="text-micro font-mono text-slate-400">IDR • Akun Utama</span>
        </div>

        <div className="space-y-1 mb-5">
          <h2 className="text-3xl font-black tracking-tight text-white select-all break-words">
            {formatCurrency(kasBalance)}
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-label text-slate-400">Saldo bersih instansi:</span>
            <span className={`text-body font-bold ${saldoBersih >= 0 ? 'text-brand-500' : 'text-rose-400'}`}>
              {formatCurrency(saldoBersih)}
            </span>
          </div>
        </div>

        {/* Quick Micro-Operations: 3 solid-color buttons stretching full-width horizontally */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/kas"
            title="Catat Masuk"
            className="h-11 rounded-xl bg-brand-500 hover:bg-brand-400 active:scale-95 transition-all text-text-inverse flex items-center justify-center shadow-lg shadow-brand-500/10"
          >
            <ArrowUpRight className="h-5.5 w-5.5 stroke-[2.5]" />
          </Link>
          <Link
            to="/kas"
            title="Catat Keluar"
            className="h-11 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg shadow-rose-500/10"
          >
            <ArrowDownLeft className="h-5.5 w-5.5 stroke-[2.5]" />
          </Link>
          <Link
            to="/talang"
            title="Beri Talangan"
            className="h-11 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg shadow-indigo-500/10"
          >
            <Send className="h-5 w-5 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Active Debt / Dana Talang Card Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-surface-card/60 border-white/5 rounded-2xl p-3 flex flex-col justify-between min-h-[110px] hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 mb-2">
            <CreditCard className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-label font-semibold">Dana Talang Aktif</span>
          </div>
          <div className="text-[18px] font-bold text-slate-100">
            {formatCurrency(totalTalangAktif)}
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div
              style={{ width: `${talangPct}%` }}
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </Card>

        <Card className="bg-surface-card/60 border-white/5 rounded-2xl p-3 flex flex-col justify-between min-h-[110px] hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 mb-2">
            <Wallet className="h-3.5 w-3.5 text-brand-500" />
            <span className="text-label font-semibold">Kapasitas Sisa</span>
          </div>
          <div className="text-[18px] font-bold text-brand-500">
            {formatCurrency(saldoBersih > 0 ? saldoBersih : 0)}
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div
              style={{ width: `${saldoPct}%` }}
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </Card>
      </div>

      {/* Bento Grid: Accounts list & recent transaction summary */}
      <div className="space-y-4">
        {/* Rincian Dana Talang Accounts */}
        <Card className="bg-gradient-to-b from-surface-elevated/65 to-surface-card/40 border-white/5 rounded-2xl p-4 relative shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              <h3 className="text-body font-bold text-slate-200 tracking-tight">Rincian Per Akun Talang</h3>
            </div>
            <span className="text-nano bg-slate-800/60 px-2 py-0.5 rounded-full border border-white/5 text-slate-400 font-medium">
              Sisa Kewajiban
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(talangBalances).map(([akun, balance]) => {
              const possessesBalance = balance > 0;
              return (
                <div
                  key={akun}
                  className={`flex items-center justify-between p-3 rounded-xl border relative transition-all duration-250 hover:border-white/10 ${
                    possessesBalance
                      ? 'bg-rose-950/10 border-rose-500/10'
                      : 'bg-brand-500/5 border-brand-500/10'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-label font-bold text-slate-300 truncate tracking-wide">{akun}</span>
                    <span className={`text-body font-mono font-bold tracking-tight mt-0.5 truncate ${
                      possessesBalance ? 'text-rose-400' : 'text-brand-500'
                    }`}>
                      {possessesBalance ? formatCurrency(balance) : 'Lunas'}
                    </span>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-nano font-bold border leading-none shrink-0 ${
                    possessesBalance
                      ? 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                      : 'bg-brand-500/5 text-brand-500 border-brand-500/10'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${possessesBalance ? 'bg-rose-500 animate-pulse' : 'bg-brand-500'}`} />
                    {possessesBalance ? 'Aktif' : 'Aman'}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Transactions List with colored pill icons */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="h-4 w-1 bg-brand-500 rounded-full" />
              <h3 className="text-value font-bold text-slate-200">Riwayat Transaksi Terkini</h3>
            </div>
            <Link to="/kas" className="text-label font-medium text-brand-500 hover:underline flex items-center gap-0.5">
              <ListCollapse className="h-3 w-3" /> Semua
            </Link>
          </div>

          <div className="space-y-2">
            {allTransactions.map((tx, idx) => {
              const isIncoming = tx.kind === 'kas' && (tx as TransaksiKas).jenis === 'Pemasukan';
              const isExpense = tx.kind === 'kas' && (tx as TransaksiKas).jenis === 'Pengeluaran';
              const isTalangBaru = tx.kind === 'talang' && (tx as TransaksiTalang).jenis === 'Baru';
              const isTalangPelunasan = tx.kind === 'talang' && (tx as TransaksiTalang).jenis === 'Pelunasan';

              let Icon = Wallet;
              let bgTheme = "text-amber-400 bg-amber-500/10 border-amber-500/10";

              if (isIncoming) {
                Icon = ArrowUpRight;
                bgTheme = "text-brand-500 bg-brand-500/10 border-brand-500/15";
              } else if (isExpense) {
                Icon = ArrowDownLeft;
                bgTheme = "text-rose-400 bg-rose-400/10 border-rose-400/15";
              } else if (isTalangBaru) {
                Icon = CreditCard;
                bgTheme = "text-violet-400 bg-violet-400/10 border-violet-400/15";
              } else {
                Icon = RefreshCw;
                bgTheme = "text-sky-400 bg-sky-400/10 border-sky-400/15";
              }

              return (
                <div
                  key={`${tx.kind}-${tx.id}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-card/60 border border-white/5 hover:border-white/10 active:bg-white/5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-xl border ${bgTheme}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-body font-bold text-slate-100 truncate">{tx.keterangan}</span>
                      <span className="text-nano text-slate-400 flex items-center gap-1 mt-0.5 overflow-hidden">
                        <span className="font-medium text-slate-300 truncate">
                          {tx.kind === 'kas' ? 'Kas' : `Talang ${((tx as TransaksiTalang).akun_talang)}`}
                        </span>
                        <span className="shrink-0">•</span>
                        <span className="shrink-0">{formatIgnoreTimezone(tx.tanggal, 'dd MMM yy', { locale: id })}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`text-body font-black shrink-0 ml-2 ${
                    isIncoming || isTalangBaru
                      ? 'text-brand-500'
                      : isExpense || isTalangPelunasan
                        ? 'text-rose-400'
                        : 'text-slate-100'
                  }`}>
                    {isIncoming || isTalangBaru ? '+' : '-'}{formatCurrency(tx.nominal)}
                  </span>
                </div>
              );
            })}

            {allTransactions.length === 0 && (
              <div className="text-center text-slate-500 py-6 text-body bg-surface-card/20 rounded-2xl border border-white/5">
                Belum ada transaksi terekam
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
