import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AdminLayoutClient user={user ? { name: user.name, role: user.role } : null}>
      {children}
    </AdminLayoutClient>
  );
}
