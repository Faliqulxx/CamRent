'use client';

import React, { useState } from 'react';
import { User, Plus, X, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface GoogleAccount {
  name: string;
  email: string;
  avatar?: string;
  isExisting?: boolean;
}

interface GoogleChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string }) => void;
}

export default function GoogleChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
}: GoogleChooserModalProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const predefinedAccounts: GoogleAccount[] = [
    {
      name: 'Dimas Pratama',
      email: 'dimas@gmail.com',
      avatar: 'D',
      isExisting: true,
    },
    {
      name: 'Faliqul Fauzi',
      email: 'faliq.outdoor@gmail.com',
      avatar: 'F',
      isExisting: false,
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setError('Nama dan Email Google wajib diisi');
      return;
    }
    if (!customEmail.includes('@')) {
      setError('Format email Google tidak valid');
      return;
    }
    setError('');
    onSelectAccount({
      name: customName.trim(),
      email: customEmail.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Google Sign-in Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 font-sans">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Google G Logo SVG */}
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Masuk dengan Google
              </h3>
              <p className="text-xs text-gray-500">
                Pilih akun untuk melanjutkan ke <strong className="text-emerald-700">CampRent</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!customMode ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Pilih Akun Demo Google:
              </div>

              {predefinedAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => onSelectAccount({ name: acc.name, email: acc.email })}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group min-h-[58px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {acc.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-900 truncate flex items-center gap-2">
                        <span>{acc.name}</span>
                        {acc.isExisting ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Akun Lama
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Akun Baru
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{acc.email}</div>
                    </div>
                  </div>
                </button>
              ))}

              {/* Use another account button */}
              <button
                onClick={() => {
                  setCustomMode(true);
                  setError('');
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-gray-300 hover:border-emerald-500 hover:bg-gray-50 transition-colors text-left text-gray-700 min-h-[54px] mt-2"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Gunakan Akun Google Lain</div>
                  <div className="text-[11px] text-gray-500">Ketik nama & email Google kustom</div>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-1">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span>Input Akun Google Kustom</span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap Google
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Andi Saputra"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Akun Google
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-[#165a3d] text-white hover:bg-[#124b32] rounded-xl shadow-md shadow-[#165a3d]/20 transition-all"
                >
                  Lanjutkan
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400 text-center leading-relaxed">
            Untuk melanjutkan, Google akan membagikan nama dan alamat email Anda dengan CampRent.
          </div>
        </div>
      </div>
    </div>
  );
}
