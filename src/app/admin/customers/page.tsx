import React from 'react';
import prisma from '@/lib/prisma';
import { Users, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react';
import { formatDate } from '@/lib/utils';


export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      profile: true,
      rentals: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-text tracking-tight">Data Pelanggan (Customers)</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Daftar penyewa terdaftar beserta nomor kontak, alamat, dan total riwayat rental.
        </p>
      </div>

      {/* MOBILE CARDS VIEW (block md:hidden) */}
      <div className="block md:hidden space-y-3.5">
        {customers.map((c) => {
          const lastRental = c.rentals[0];

          return (
            <div key={c.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-accent-mint flex items-center justify-center text-primary font-black text-sm">
                    {c.profile.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-sm">{c.profile.name}</h4>
                    <span className="text-[11px] text-text-muted">{c.profile.email}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-accent-mint text-primary font-bold text-xs shrink-0">
                  {c.rentals.length} Order
                </span>
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <a
                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-border/70 text-text font-bold min-h-[44px] hover:bg-accent-mint hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>WhatsApp: {c.phone}</span>
                </a>

                {c.address && (
                  <div className="flex items-start gap-1.5 text-text-muted text-[11px] px-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-muted" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-border/70 flex justify-between text-[11px] text-text-muted">
                  <span>Rental Terakhir:</span>
                  <span className="font-semibold text-text">
                    {lastRental ? `${lastRental.code} (${formatDate(lastRental.createdAt)})` : '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama Pelanggan</th>
                <th className="px-5 py-3.5">Kontak WhatsApp</th>
                <th className="px-5 py-3.5">Alamat Domisili</th>
                <th className="px-5 py-3.5 text-center">Total Rental</th>
                <th className="px-5 py-3.5">Rental Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {customers.map((c) => {
                const lastRental = c.rentals[0];

                return (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent-mint flex items-center justify-center text-primary font-bold text-xs">
                          {c.profile.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-text text-sm block">{c.profile.name}</span>
                          <span className="text-[11px] text-text-muted">{c.profile.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-text">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs text-text truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="truncate">{c.address}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-accent-mint text-primary font-bold">
                        {c.rentals.length} Order
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-text-muted">
                      {lastRental ? (
                        <span>
                          {lastRental.code} ({formatDate(lastRental.createdAt)})
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
