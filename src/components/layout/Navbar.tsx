'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ArrowRight,
  LogOut,
  Calendar,
  Layers,
  Phone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useBrand, BrandLogoRenderer } from '@/context/BrandContext';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { user, loginAs, logout } = useAuth();
  const { brandName, brandTagline, brandLogoType, brandLogoPreset, brandLogoUrl } = useBrand();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = pathname === '/';

  // Track scroll position to handle transparent navbar on homepage
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
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
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/catalog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/#contact' },
  ];

  // Dynamic navbar theme based on page and scroll
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <header
        className={`${
          isHome ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
        } z-40 w-full transition-all duration-300 ${
          isTransparent
            ? 'bg-gradient-to-b from-black/70 via-black/40 to-transparent text-white border-transparent'
            : 'bg-white/95 backdrop-blur-md text-text border-b border-border shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Configurable Brand Name */}
            <Link
              href="/"
              className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-h-[44px]"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 ${
                  brandLogoType !== 'preset' && brandLogoUrl
                    ? 'bg-white shadow-sm overflow-hidden p-0.5 border border-white/20'
                    : isTransparent
                    ? 'text-white'
                    : 'bg-primary text-white shadow-md shadow-primary/20'
                }`}
              >
                <BrandLogoRenderer
                  type={brandLogoType}
                  preset={brandLogoPreset}
                  url={brandLogoUrl}
                  brandName={brandName}
                  className={
                    brandLogoType !== 'preset' && brandLogoUrl
                      ? 'w-full h-full object-contain rounded-lg'
                      : 'w-7 h-7 sm:w-8 sm:h-8'
                  }
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight leading-none transition-colors ${
                    isTransparent ? 'text-white' : 'text-primary'
                  }`}
                >
                  {brandName || 'CampRent'}
                </span>
                {brandTagline && (
                  <span
                    className={`text-[9px] uppercase font-bold tracking-widest mt-0.5 transition-colors ${
                      isTransparent ? 'text-white/70' : 'text-text-muted'
                    }`}
                  >
                    {brandTagline}
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Nav Links (Home, Catalog, About, Contact) */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors py-2 ${
                      isTransparent
                        ? isActive
                          ? 'text-white font-bold'
                          : 'text-white/80 hover:text-white'
                        : isActive
                        ? 'text-primary font-bold'
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Shortcut Icon */}
              <Link
                href="/catalog"
                className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-colors ${
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
                title="Cari Produk"
                aria-label="Cari Produk"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Cart Button with Counter Badge */}
              <Link
                href="/cart"
                className={`relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-colors active:scale-95 ${
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
                aria-label="Keranjang Belanja"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#165a3d] text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {/* Login / Register or Profile Buttons */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  {user.role === 'OWNER' || user.role === 'STAFF' ? (
                    <Link
                      href={user.role === 'STAFF' ? '/admin?mode=staff' : '/admin'}
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] text-xs font-bold rounded-full bg-[#165a3d] text-white hover:bg-[#124b32] transition-colors shadow-sm"
                    >
                      <span>Portal Admin</span>
                    </Link>
                  ) : (
                    <Link
                      href="/account/rentals"
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] text-xs font-bold rounded-full bg-[#165a3d] text-white hover:bg-[#124b32] transition-colors shadow-sm"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Rental</span>
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className={`min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full transition-all border ${
                      isTransparent
                        ? 'bg-black/30 backdrop-blur-md text-white border-white/20 hover:bg-black/50 hover:text-red-300'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    }`}
                    title="Keluar (Logout)"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={() => loginAs('CUSTOMER')}
                    className={`text-sm font-semibold transition-colors px-2 py-1 ${
                      isTransparent ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => loginAs('CUSTOMER')}
                    className="inline-flex items-center justify-center px-5 py-2 min-h-[38px] text-xs font-bold rounded-full bg-[#165a3d] text-white hover:bg-[#124b32] transition-all shadow-md shadow-[#165a3d]/25 active:scale-95"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className={`md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors ${
                  isTransparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Sheet) */}
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
              {/* Drawer Header with Configured Brand */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden p-0.5 ${
                      brandLogoType !== 'preset' && brandLogoUrl
                        ? 'bg-white shadow-xs border border-gray-200'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <BrandLogoRenderer
                      type={brandLogoType}
                      preset={brandLogoPreset}
                      url={brandLogoUrl}
                      brandName={brandName}
                      className={
                        brandLogoType !== 'preset' && brandLogoUrl
                          ? 'w-full h-full object-contain rounded-lg'
                          : 'w-6 h-6'
                      }
                    />
                  </div>
                  <div>
                    <span className="font-black text-lg text-primary block leading-tight">
                      {brandName || 'CampRent'}
                    </span>
                    {brandTagline && (
                      <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted block">
                        {brandTagline}
                      </span>
                    )}
                  </div>
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
                <div className="my-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#165a3d] text-white font-black text-sm flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-xs text-text block truncate">{user.name}</span>
                    <span className="text-[10px] text-emerald-800 font-bold block uppercase">{user.role}</span>
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <div className="py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-text hover:bg-gray-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="pt-4 border-t border-border space-y-2.5">
              {user ? (
                <>
                  {user.role === 'OWNER' || user.role === 'STAFF' ? (
                    <Link
                      href="/admin"
                      className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] bg-[#165a3d] text-white rounded-xl font-bold text-sm shadow-md"
                    >
                      <span>Masuk Portal Admin</span>
                    </Link>
                  ) : (
                    <Link
                      href="/account/rentals"
                      className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] bg-[#165a3d] text-white rounded-xl font-bold text-sm shadow-md"
                    >
                      <User className="w-4 h-4" />
                      <span>Riwayat Sewa Saya</span>
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => loginAs('CUSTOMER')}
                    className="w-full py-3 min-h-[44px] border border-gray-300 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => loginAs('CUSTOMER')}
                    className="w-full py-3 min-h-[44px] bg-[#165a3d] text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
