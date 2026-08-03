'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { UserRole } from '@/types';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

/**
 * Demo identities mirror seeded users (prisma/seed.js) so role switch stays
 * consistent with real DB-backed flows.
 */
const DEMO_USERS: Record<string, DemoUser> = {
  DEV_LEARNER: {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Abdullah Ahmad (Learner Demo)',
    email: 'learner.demo@localhost.test',
    role: 'LEARNER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  },
  DEV_EDUCATOR: {
    id: '10000000-0000-0000-0000-000000000101',
    name: 'Ustadz DR. Ahmad Al-Hafiz, M.A.',
    email: 'educator.demo@localhost.test',
    role: 'EDUCATOR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  DEV_LAJNAH: {
    id: '10000000-0000-0000-0000-000000000501',
    name: "KH. Ma'ruf Amin (Lajnah Verifier Demo)",
    email: 'lajnah.demo@localhost.test',
    role: 'LAJNAH_VERIFIER',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  },
  DEV_FOUNDER: {
    id: '10000000-0000-0000-0000-000000000601',
    name: 'Founder Admin SEMESTA ISLAM',
    email: 'founder.demo@localhost.test',
    role: 'FOUNDER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  },
};

export function DemoRoleSwitcher() {
  const [activeKey, setActiveKey] = useState<string>('DEV_LEARNER');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/demo-login')
      .then((res) => res.json())
      .then((json) => {
        const email = json?.data?.email as string | null;
        if (email) {
          const match = Object.entries(DEMO_USERS).find(([, u]) => u.email === email);
          if (match) setActiveKey(match[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectRole = async (key: string) => {
    const user = DEMO_USERS[key];
    if (!user) return;
    setActiveKey(key);
    setIsOpen(false);
    await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    }).catch(() => {});
    // Reload page to reflect role changes across app
    window.location.reload();
  };

  if (!mounted) return null;

  const currentUser = DEMO_USERS[activeKey] || DEMO_USERS.DEV_LEARNER;

  return (
    <div className="fixed bottom-20 right-4 z-50 font-sans">
      {isOpen ? (
        <div className="bg-[#0F3D2E] text-white p-4 rounded-2xl shadow-2xl border border-[#D4AF37] w-72 space-y-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> LOCAL DEMO MODE
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-emerald-200">
            Identitas Aktif: <strong className="text-white block font-semibold">{currentUser.name}</strong>
            <span className="text-[10px] text-emerald-300 font-mono">Role: {currentUser.role}</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {Object.keys(DEMO_USERS).map((key) => {
              const u = DEMO_USERS[key];
              const isSelected = key === activeKey;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectRole(key)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37] text-gray-900 font-bold shadow-md'
                      : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
                  }`}
                >
                  <span>{u.role}</span>
                  {isSelected && <UserCheck className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-emerald-400 text-center pt-1 border-t border-emerald-800/60">
            Mode Simulasi Lokal (Bukan Otentikasi Supabase Cloud)
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0F3D2E] text-[#D4AF37] hover:bg-[#16533F] border border-[#D4AF37] shadow-xl px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
        >
          <UserCheck className="w-4 h-4" />
          <span>Demo: {currentUser.role}</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
