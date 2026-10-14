'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import GoogleChooserModal from './GoogleChooserModal';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setUserSession, loginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);

  // Step state for 2-step registration: 'MAIN' | 'GOOGLE_COMPLETION'
  const [step, setStep] = useState<'MAIN' | 'GOOGLE_COMPLETION'>('MAIN');

  // Google data gathered from Step 1
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Step 2 completion fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Standard email/pass fields
  const [standardEmail, setStandardEmail] = useState('');
  const [standardName, setStandardName] = useState('');
  const [standardPassword, setStandardPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync tab with context when modal opens
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab);
      setStep('MAIN');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  // Handler when user selects an account in Google Chooser
  const handleSelectGoogleAccount = async (account: { name: string; email: string }) => {
    setIsGoogleChooserOpen(false);
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Call check-or-login
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-or-login',
          email: account.email,
          name: account.name,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghubungkan dengan Google');
      }

      if (data.status === 'LOGGED_IN') {
        // Account already exists -> Login success!
        setUserSession(data.user);
        setSuccessMsg(`Selamat datang kembali, ${data.user.name}!`);
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      } else if (data.status === 'NEEDS_COMPLETION') {
        // New Account -> Transition to Step 2 (Phone & Address completion)
        setGoogleEmail(data.email);
        setGoogleName(data.name);
        setPhone('');
        setAddress('');
        setStep('GOOGLE_COMPLETION');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk dengan Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Step 2 completion
  const handleCompleteGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Nomor WhatsApp wajib diisi');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Alamat lengkap domisili wajib diisi');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-register',
          email: googleEmail,
          name: googleName,
          phone: phone.trim(),
          address: address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyelesaikan pendaftaran');
      }

      setUserSession(data.user);
      setSuccessMsg(`Pendaftaran berhasil! Selamat bergabung di CampRent, ${data.user.name}!`);
      setTimeout(() => {
        closeAuthModal();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan profil pelanggan');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for traditional demo login / register
  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (activeTab === 'login') {
        // Quick Customer Login
        await loginAs('CUSTOMER');
        setSuccessMsg('Berhasil masuk sebagai Pelanggan (Dimas Pratama)');
      } else {
        // Register demo: register with provided details or customer
        await loginAs('CUSTOMER');
        setSuccessMsg('Pendaftaran akun berhasil!');
      }
      setTimeout(() => {
        closeAuthModal();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses autentikasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={closeAuthModal}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-border overflow-hidden z-10 animate-in zoom-in-95 duration-200 font-sans max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/30">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                {step === 'GOOGLE_COMPLETION' ? (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Lengkapi Data Profil</span>
                  </>
                ) : (
                  <span>{activeTab === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun CampRent'}</span>
                )}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {step === 'GOOGLE_COMPLETION'
                  ? 'Satu langkah lagi untuk menyelesaikan registrasi Google'
                  : 'Sewa perlengkapan camping terbaik di Gresik dengan mudah'}
              </p>
            </div>
            <button
              onClick={closeAuthModal}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            {step === 'MAIN' ? (
              <div>
                {/* Tabs Switcher */}
                <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'login'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'register'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Daftar Baru
                  </button>
                </div>

                {/* Primary Google Auth Button */}
                <button
                  type="button"
                  onClick={() => setIsGoogleChooserOpen(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 min-h-[48px] rounded-2xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50/80 transition-all shadow-xs active:scale-98 group font-semibold text-xs text-gray-700"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {activeTab === 'login'
                      ? 'Lanjutkan dengan Google'
                      : 'Daftar dengan Akun Google'}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <span className="relative px-3 bg-white text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    atau dengan email
                  </span>
                </div>

                {/* Standard Form */}
                <form onSubmit={handleStandardAuth} className="space-y-3.5">
                  {activeTab === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={standardName}
                          onChange={(e) => setStandardName(e.target.value)}
                          placeholder="Nama lengkap Anda"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required={activeTab === 'register'}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={standardEmail}
                        onChange={(e) => setStandardEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={standardPassword}
                        onChange={(e) => setStandardPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 min-h-[44px] bg-[#165a3d] text-white rounded-xl font-bold text-xs hover:bg-[#124b32] transition-all shadow-md shadow-[#165a3d]/20 active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{activeTab === 'login' ? 'Masuk' : 'Daftar Sekarang'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: GOOGLE COMPLETION (Phone & Address) */
              <form onSubmit={handleCompleteGoogleRegistration} className="space-y-4">
                {/* Account Summary Banner */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {googleName.charAt(0) || 'G'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">
                      {googleName}
                    </span>
                    <span className="text-[11px] text-gray-500 block truncate">
                      {googleEmail}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                  Mohon lengkapi <strong>Nomor WhatsApp</strong> dan <strong>Alamat</strong> untuk
                  keperluan koordinasi pengiriman/pengambilan dan jaminan sewa peralatan camping.
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Nomor WhatsApp / HP</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Wajib diisi *</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Alamat Lengkap Domisili</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Wajib diisi *</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      placeholder="Contoh: Jl. Panglima Sudirman No. 45, Kec. Gresik, Gresik"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 min-h-[44px] bg-[#165a3d] text-white rounded-xl font-bold text-xs hover:bg-[#124b32] transition-all shadow-md shadow-[#165a3d]/20 active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Selesaikan & Masuk ke CampRent</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('MAIN');
                      setIsGoogleChooserOpen(true);
                    }}
                    className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Ganti Akun Google
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Google Account Chooser Simulation Dialog */}
      <GoogleChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </>
  );
}
