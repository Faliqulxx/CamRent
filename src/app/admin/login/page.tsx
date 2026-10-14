'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, UserCheck, Lock, ArrowLeft, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useBrand, BrandLogoRenderer, BrandNameDisplay } from '@/context/BrandContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role');

  const { brandName, brandTagline, brandLogoType, brandLogoPreset, brandLogoUrl } = useBrand();

  const [username, setUsername] = useState(initialRole === 'staff' ? 'staff' : '');
  const [password, setPassword] = useState(initialRole === 'staff' ? 'staff' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialRole === 'staff') {
      setUsername('staff');
      setPassword('staff');
    } else if (initialRole === 'admin') {
      setUsername('admin');
      setPassword('admin');
    }
  }, [initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Username atau password salah');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        // Hard navigation to trigger fresh server layout cookies
        window.location.href = data.redirectUrl || '/admin';
      }, 500);
    } catch (err: any) {
      setError('Terjadi kendala jaringan saat mencoba login');
      setLoading(false);
    }
  };

  const handleQuickFill = (userVal: string, passVal: string) => {
    setUsername(userVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2419] via-[#0f3323] to-[#16432f] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-mint/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold transition-all border border-white/10 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xl p-1 border border-white/20 mb-3 sm:mb-4">
            <BrandLogoRenderer
              type={brandLogoType}
              preset={brandLogoPreset}
              url={brandLogoUrl}
              brandName={brandName}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Portal Kelola <span className="text-emerald-400">CampRent</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
            Silakan masukkan kredensial Admin atau Staf untuk mengakses sistem
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Quick Credential Selector Badges */}
          <div className="mb-6 p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Pilih Cepat Kredensial:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin')}
                className={`py-2 px-2.5 rounded-xl text-left border transition-all text-xs flex flex-col ${
                  username === 'admin'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Admin
                  </span>
                  {username === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5">user: admin | pw: admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('staff', 'staff')}
                className={`py-2 px-2.5 rounded-xl text-left border transition-all text-xs flex flex-col ${
                  username === 'staff'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Staf
                  </span>
                  {username === 'staff' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5">user: staff | pw: staff</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Login berhasil! Membuka dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau staff"
                  required
                  autoFocus
                  className="w-full px-4 py-3 min-h-[46px] rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 min-h-[46px] rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 min-h-[48px] rounded-xl bg-[#165a3d] hover:bg-[#124b32] text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-500 block">
              Akses khusus pengelola & staf toko CampRent
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
