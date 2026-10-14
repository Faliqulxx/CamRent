'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Boxes,
  Calendar,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  Settings,
  Tent,
  ArrowLeft,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, loginAs } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Manajemen Rental', href: '/admin/rentals', icon: CalendarDays },
    { name: 'Inventori & Unit', href: '/admin/inventory', icon: Boxes },
    { name: 'Kalender Rental', href: '/admin/calendar', icon: Calendar },
    { name: 'Pelanggan', href: '/admin/customers', icon: Users },
    { name: 'Pembayaran', href: '/admin/payments', icon: CreditCard },
    { name: 'Maintenance Unit', href: '/admin/maintenance', icon: Wrench },
    { name: 'Laporan Keuangan', href: '/admin/reports', icon: BarChart3, ownerOnly: true },
    { name: 'Pengaturan Toko', href: '/admin/settings', icon: Settings, ownerOnly: true },
  ];

  const isStaff = user?.role === 'STAFF';

  return (
    <aside className="w-64 bg-sidebar-bg text-white flex flex-col shrink-0 h-full border-r border-sidebar-active select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-sidebar-active/60 flex items-center justify-between">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center gap-3 min-h-[44px]"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-black/30 shrink-0">
            <Tent className="w-5 h-5 text-accent-mint" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block">CampRent</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block -mt-1">
              Admin Portal
            </span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Menu Operasional
        </div>

        {navItems.map((item) => {
          if (item.ownerOnly && isStaff) {
            return null;
          }

          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sidebar-active text-white font-bold shadow-xs'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-mint' : 'text-gray-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & Store Switcher */}
      <div className="p-4 border-t border-sidebar-active/60 bg-black/15 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user?.name?.charAt(0) || 'O'}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-white block truncate">{user?.name || 'Budi Setiawan'}</span>
            <span className="text-[10px] text-emerald-400 font-semibold block capitalize">
              Role: {user?.role || 'OWNER'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-sidebar-active/40 flex items-center justify-between text-xs">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors py-2 min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Web Publik</span>
          </Link>

          <button
            onClick={() => {
              loginAs('GUEST');
              if (onCloseMobile) onCloseMobile();
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors py-2 min-h-[36px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
