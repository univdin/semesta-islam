'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShieldCheck, Calendar } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/directory', label: 'Pendidik', icon: Users },
    { href: '/booking', label: 'Ajukan Sesi', icon: Calendar },
    { href: '/educator/verification', label: 'Verifikasi', icon: ShieldCheck },
  ];

  return (
    <nav className="mobile-bottom-bar">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
