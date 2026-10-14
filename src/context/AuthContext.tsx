'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'STAFF' | 'CUSTOMER';
  customer?: {
    id: string;
    phone: string;
    address: string;
  } | null;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  loginAs: (role: 'OWNER' | 'STAFF' | 'CUSTOMER' | 'GUEST') => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setUser(data.user || null);
    } catch (e) {
      console.error('Failed to fetch session', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const loginAs = async (role: 'OWNER' | 'STAFF' | 'CUSTOMER' | 'GUEST') => {
    setIsLoading(true);
    try {
      if (role === 'GUEST') {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        setUser(null);
      } else {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });
        const data = await res.json();
        setUser(data.user || null);
      }
      router.refresh();
    } catch (e) {
      console.error('Failed to login as role', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await loginAs('GUEST');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAs,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
