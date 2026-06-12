import { useTransactions } from '../hooks/useTransactions';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BarChart3, Users, AlertTriangle, Wallet, Building2, Receipt } from 'lucide-react';
import { formatIgnoreTimezone } from '../lib/utils';
import { tokens } from '../lib/tokens';

export default function Laporan() {
  const { kas, talang, loading } = useTransactions();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-10 w-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Menyusun Analitik...</span>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  // Process Kas Data
  const kasBalance = kas.reduce((acc, curr) => {
    return curr.jenis === 'Pemasukan' ? acc + curr.nominal : acc - curr.nominal;
  }, 0);

  // Group kas by month for chart
  const kasByMonth = kas.reduce((acc: any, curr) => {
    const month = formatIgnoreTimezone(curr.tanggal, 'MMM yy', { locale: localeId });
    if (!acc[month]) acc[month] = { name: month, Pemasukan: 0, Pengeluaran: 0 };
    acc[month][curr.jenis] += curr.nominal;
    return acc;
  }, {});

  const chartData = Object.values(kasByMonth).reverse();

  // Process Talang Data
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

  return (
    <div className="space-y-4">
      {/* Dynamic Cards Layout */}
      <div className="space-y-3">
        {/* Baris 1: Bersih Sikat */}
        <div className="bg-gradient-to-br from-brand-500/10 via-surface-card/90 to-surface-card/95 border border-brand-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-brand-500/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[10px] font-bold text-brand-500 tracking-wider uppercase">Bersih SIKAT</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(saldoBersih)}
            </h2>
            <p className="text-[9px] text-slate-400 font-medium">Dana bersih lembaga siap sikat setelah dikurangi utang talang</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 z-10">
            <Wallet className="h-5 w-5 text-brand-500" />
          </div>
        </div>

        {/* Baris 2: Kas Lembaga & Hutang Talang */}
        <div className="grid grid-cols-2 gap-3">
          {/* Kas Lembaga */}
          <div className="bg-surface-card/60 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase">Kas Lembaga</span>
              <div className="h-6 w-6 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-brand-500" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[15px] font-extrabold text-white tracking-tight leading-tight block truncate">
                {formatCurrency(kasBalance)}
              </span>
              <span className="text-[8px] text-slate-500 font-medium">Total cash terkumpul</span>
            </div>
          </div>

          {/* Hutang Talang */}
          <div className="bg-surface-card/60 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9.5px] font-bold text-rose-400 tracking-wider uppercase">Hutang Talang</span>
              <div className="h-6 w-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Receipt className="h-3.5 w-3.5 text-rose-400" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[15px] font-extrabold text-rose-400 tracking-tight leading-tight block truncate">
                {formatCurrency(totalTalangAktif)}
              </span>
              <span className="text-[8px] text-rose-400/50 font-medium">Kewajiban penjamin aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="kas" className="w-full space-y-3">
        <TabsList className="grid w-full grid-cols-2 bg-surface-card/60 p-1 rounded-xl border border-white/5 h-auto">
          <TabsTrigger
            value="kas"
            className="data-[state=active]:bg-brand-500 data-[state=active]:text-text-inverse text-slate-400 text-xs py-1.5 rounded-lg font-bold"
          >
            Arus Kas Utama
          </TabsTrigger>
          <TabsTrigger
            value="talang"
            className="data-[state=active]:bg-violet-500 data-[state=active]:text-white text-slate-400 text-xs py-1.5 rounded-lg font-bold"
          >
            Sensus Dana Talang
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kas" className="outline-none">
          <Card className="bg-surface-card/40 border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="flex flex-col mb-4">
              <h3 className="text-[13px] font-extrabold text-slate-200 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-brand-500" /> Tren Transaksi Bulanan
              </h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Komparasi kredit & debit instansi terpusat</p>
            </div>

            <div className="h-64 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    fontSize={9}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={9}
                    tickLine={false}
                    tickFormatter={(val) => `Rp${val >= 1000000 ? (val/1000000).toFixed(0) + 'jt' : val}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: tokens.colors.surface.overlay, borderColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}
                    itemStyle={{ color: '#fff', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    formatter={(val: number) => [formatCurrency(val), '']}
                  />
                  <Bar dataKey="Pemasukan" fill={tokens.colors.chart.pemasukan} radius={[3, 3, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Pengeluaran" fill={tokens.colors.chart.pengeluaran} radius={[3, 3, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Micro Legenda Indicator */}
            <div className="flex justify-center items-center gap-4 mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                <span className="text-[10px] font-bold text-slate-300">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-300">Pengeluaran</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="talang" className="outline-none">
          <Card className="bg-surface-card/40 border-white/5 rounded-2xl p-4 overflow-hidden space-y-4">
            <div className="flex flex-col">
              <h3 className="text-[13px] font-extrabold text-slate-200 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-violet-400" /> Kewajiban Outstanding Aktif
              </h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Analisa hutang terhutang per penjamin dana</p>
            </div>

            <div className="space-y-2">
              {Object.entries(talangBalances).map(([akun, balance]) => {
                const totalHutangRekomendasi = 4000000; // Mock limit limit
                const persentasi = Math.min(100, (balance / totalHutangRekomendasi) * 100);

                return (
                  <div key={akun} className="p-3 bg-surface-card/60 hover:border-white/10 transition-colors rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-[10px]">
                          {akun[0]}
                        </div>
                        <span className="text-xs font-bold text-slate-100">{akun}</span>
                      </div>
                      <span className="text-xs font-bold text-rose-400">{formatCurrency(balance)}</span>
                    </div>

                    {/* Progress tracking indicator */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${persentasi}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            balance > 2500000 ? 'bg-rose-500' : 'bg-violet-400'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-500 font-medium">
                        <span>Lunas</span>
                        <span>Batas Aman: {formatCurrency(totalHutangRekomendasi)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalTalangAktif > 0 && (
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-amber-300">Peringatan Dana Talang</h4>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    Total kewajiban outstanding aktif sebesar {formatCurrency(totalTalangAktif)} membebani likuditas kas sekolah. Segera lakukan koordinasi settlement pelunasan.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
