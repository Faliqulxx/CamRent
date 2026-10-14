'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu, Tent, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    name: string;
    role: string;
  } | null;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen h-[100dvh] bg-bg-light w-full max-w-full overflow-hidden">
      {/* 1. Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:flex h-screen shrink-0 sticky top-0 z-20">
        <AdminSidebar />
      </div>

      {/* 2. Mobile Drawer (Sheet) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer container from Left */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-xs h-full z-10 animate-in slide-in-from-left duration-300">
            <AdminSidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-xs">
          {/* Left: Mobile Hamburger + Brand / Desktop Status */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text hover:bg-gray-100 transition-colors active:scale-95"
              aria-label="Buka Menu Admin"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Brand */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
                <Tent className="w-4 h-4 text-accent-mint" />
              </div>
              <span className="font-black text-sm text-text">CampRent Admin</span>
            </div>

            {/* Desktop Brand status */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-bold text-text-muted">CampRent Operations System</span>
              <span className="text-border">|</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Live System Active
              </span>
            </div>
          </div>

          {/* Right: Public link + profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-primary hover:text-primary-dark underline hidden sm:inline"
            >
              Lihat Katalog Publik ↗
            </Link>

            <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-accent-mint flex items-center justify-center text-primary font-black text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="font-bold text-text block leading-tight">{user?.name || 'Budi Setiawan'}</span>
                <span className="text-[10px] text-text-muted block">{user?.role || 'OWNER'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
