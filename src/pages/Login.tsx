import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authClient } from '../lib/auth-client';
import { Wallet, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Login() {
  const { user, refetchProfile } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Credentials input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (user) return <Navigate to="/" />;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Nama lengkap wajib diisi');
        }
        const res = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (res.error) {
          throw new Error(res.error.message || 'Gagal registrasi');
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
        });
        if (res.error) {
          throw new Error(res.error.message || 'Email atau password salah');
        }
      }

      // Trigger context loading of the user profile
      await refetchProfile();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-app font-sans relative overflow-hidden flex items-center justify-center p-4 text-slate-100">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic device card wrapper */}
      <Card className="w-full max-w-sm bg-surface-panel border border-white/5 backdrop-blur-xl relative z-10 text-white rounded-2xl p-6 shadow-2xl ring-1 ring-white/5">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-grd-start to-grd-end rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,160,0.3)] text-text-inverse font-black text-lg">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            &lt;SIKAT&gt;
          </h1>
          <p className="text-slate-400 text-[10px] leading-relaxed uppercase tracking-wider font-bold">
            Sistem Informasi Keuangan Terpusat
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3.5">
          {isSignUp && (
            <div className="space-y-1">
              <Label htmlFor="nama" className="text-slate-400 text-[10px] uppercase font-bold">Nama Lengkap</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="bg-surface-card/60 border-white/15 text-xs h-10 rounded-xl focus:border-brand-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-slate-400 text-[10px] uppercase font-bold">Alamat Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-surface-card/60 border-white/15 text-xs h-10 rounded-xl focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-slate-400 text-[10px] uppercase font-bold">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-surface-card/60 border-white/15 text-xs h-10 rounded-xl focus:border-brand-500"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-400 font-bold text-center">{errorMsg}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-400 text-text-inverse font-black text-xs h-10 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 mt-2"
          >
            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading ? 'Memproses...' : isSignUp ? 'Daftar Akun Baru' : 'Masuk Aplikasi'}
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-[10px] text-brand-500 font-bold hover:underline transition-colors"
          >
            {isSignUp
              ? 'Sudah punya akun? Masuk di sini'
              : 'Belum punya akun? Daftar sebagai Viewer'
            }
          </button>
        </div>
      </Card>
    </div>
  );
}
