'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tent,
  ShoppingBag,
  User,
  Menu,
  X,
  Shield,
  ChevronDown,
  ArrowRight,
  LogOut,
  Calendar,
  Layers,
  Phone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { user, loginAs, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setRoleDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // If in admin dashboard, public navbar is not displayed
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Beranda', href: '/', icon: Tent },
    { name: 'Katalog Peralatan', href: '/catalog', icon: Layers },
    { name: 'Tentang Kami', href: '/about', icon: Shield },
    { name: 'Kontak & Lokasi', href: '/#contact', icon: Phone },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0 min-h-[44px]">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <Tent className="w-5 h-5 text-accent-mint" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-primary">CampRent</span>
                <span className="block text-[9px] uppercase font-bold tracking-widest text-text-muted -mt-1">
                  Outdoor Rental
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-primary py-2 ${
                    pathname === link.href ? 'text-primary font-bold' : 'text-text-muted'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Demo Role Switcher Dropdown (Desktop & Mobile) */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-accent-mint/70 text-primary border border-primary/20 hover:bg-accent-mint transition-colors active:scale-95"
                  title="Ganti peran untuk pengujian"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Role:</span>
                  <span>{user ? user.role : 'GUEST'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-border p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Uji Coba Peran Pengguna
                    </div>
                    <button
                      onClick={() => {
                        loginAs('OWNER');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-accent-mint text-text hover:text-primary transition-colors flex items-center justify-between min-h-[44px]"
                    >
                      <span>Owner (Budi)</span>
                      {user?.role === 'OWNER' && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                    <button
                      onClick={() => {
                        loginAs('STAFF');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-accent-mint text-text hover:text-primary transition-colors flex items-center justify-between min-h-[44px]"
                    >
                      <span>Staff (Rian)</span>
                      {user?.role === 'STAFF' && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                    <button
                      onClick={() => {
                        loginAs('CUSTOMER');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-accent-mint text-text hover:text-primary transition-colors flex items-center justify-between min-h-[44px]"
                    >
                      <span>Customer (Dimas)</span>
                      {user?.role === 'CUSTOMER' && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                    <button
                      onClick={() => {
                        loginAs('GUEST');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-red-50 text-red-600 transition-colors flex items-center justify-between min-h-[44px]"
                    >
                      <span>Guest (Tamu / Logout)</span>
                      {!user && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Button: Always visible on Mobile & Desktop outside hamburger menu! */}
              <Link
                href="/cart"
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-text hover:text-primary hover:bg-accent-mint/50 transition-colors active:scale-95"
                aria-label="Keranjang Belanja"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {/* Desktop User Buttons */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  {user.role === 'OWNER' || user.role === 'STAFF' ? (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] text-xs font-bold rounded-xl bg-sidebar-bg text-white hover:bg-sidebar-active transition-colors shadow-sm"
                    >
                      <span>Portal Admin</span>
                    </Link>
                  ) : (
                    <Link
                      href="/account/rentals"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Rental</span>
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => loginAs('CUSTOMER')}
                  className="hidden md:inline-flex items-center px-4 py-2 min-h-[44px] text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Masuk Akun
                </button>
              )}

              {/* Mobile Hamburger Button with 44px touch target */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text hover:bg-gray-100 transition-colors active:scale-95"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Sheet) from Right with Backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Sheet Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                    <Tent className="w-4 h-4 text-accent-mint" />
                  </div>
                  <span className="font-black text-lg text-primary">CampRent</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-text hover:bg-gray-100 transition-colors"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info Bar if logged in */}
              {user && (
                <div className="my-4 p-3.5 rounded-2xl bg-accent-mint/60 border border-primary/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-xs text-text block truncate">{user.name}</span>
                    <span className="text-[10px] text-primary font-bold block uppercase">{user.role}</span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1.5 mt-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Cart Quick Link in Drawer */}
              <div className="mt-4 pt-4 border-t border-border">
                <Link
                  href="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl bg-gray-50 border border-border text-sm font-bold text-text hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span>Keranjang Sewa</span>
                  </div>
                  {totalItemsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                      {totalItemsCount} item
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-6 border-t border-border">
              {user ? (
                <>
                  {user.role === 'OWNER' || user.role === 'STAFF' ? (
                    <Link
                      href="/admin"
                      onClick={() => setDrawerOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl bg-sidebar-bg text-white font-bold text-xs shadow-md"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Buka Portal Admin</span>
                    </Link>
                  ) : (
                    <Link
                      href="/account/rentals"
                      onClick={() => setDrawerOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl bg-primary text-white font-bold text-xs shadow-md"
                    >
                      <User className="w-4 h-4" />
                      <span>Buka My Rental ({user.name.split(' ')[0]})</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    loginAs('CUSTOMER');
                    setDrawerOpen(false);
                  }}
                  className="w-full py-3 min-h-[44px] rounded-xl bg-primary text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Masuk sebagai Customer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
