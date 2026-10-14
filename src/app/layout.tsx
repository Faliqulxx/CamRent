import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthModal from '@/components/auth/AuthModal';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { BrandProvider } from '@/context/BrandContext';

export const metadata: Metadata = {
  title: 'CampRent — Sistem Rental Peralatan Camping Terlengkap & Terpercaya',
  description: 'Sistem operasional rental peralatan camping. Cari tenda, sleeping bag, alat masak berdasarkan tanggal dengan unit tracking dan ketersediaan akurat.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F6B3F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full overflow-x-hidden">
      <body className="min-h-full flex flex-col bg-bg-light text-text-main selection:bg-accent-mint selection:text-primary overflow-x-hidden w-full max-w-full">
        <AuthProvider>
          <BrandProvider>
            <CartProvider>
              <Navbar />
              <AuthModal />
              <main className="flex-1 w-full max-w-full">{children}</main>
              <Footer />
            </CartProvider>
          </BrandProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
