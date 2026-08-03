'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Sun,
  Moon,
  FlaskConical,
  Users,
  BookOpen,
  Gift,
  LayoutDashboard,
  ChevronDown,
  History,
  UserRound,
  Info,
  Building2,
  Code2,
  ShieldCheck,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface HeaderIdentity {
  userId: string;
  email: string;
  roles: UserRole[];
}

interface HeaderProps {
  identity: HeaderIdentity | null;
  demoMode: boolean;
}

const PRIMARY_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/directory', label: 'Direktori' },
  { href: '/booking', label: 'Ajukan Sesi' },
  { href: '/educator/verification', label: 'Verifikasi' },
  { href: '/faq', label: 'FAQ' },
];

const PREVIEW_LINKS = [
  { href: '/discovery', label: 'Diagnostik', desc: 'Alur diagnostik — pratinjau', icon: FlaskConical },
  { href: '/contributions', label: 'Apresiasi Syi\'ar', desc: 'Kontribusi — pratinjau', icon: Gift },
  { href: '/ambassador', label: 'Ambassador', desc: 'Program — pratinjau', icon: Users },
  { href: '/affiliate', label: 'Affiliate', desc: 'Program — pratinjau', icon: BookOpen },
] as const;

export function Header({ identity, demoMode }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('semesta_theme') as 'light' | 'dark' || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setWorkspaceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('semesta_theme', next);
  };

  const roles = identity?.roles ?? [];
  const isEducator = roles.includes('EDUCATOR');
  const isVerifier = roles.includes('LAJNAH_VERIFIER') || roles.includes('FOUNDER_ADMIN');
  const isFounder = roles.includes('FOUNDER_ADMIN');

  return (
    <header className="top-bar">
      <div className="top-bar-content">
        <Link href="/" className="brand-logo">
          <div className="logo-icon">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <span className="brand-title">
            ILMIFY
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {/* Workspace dropdown (signed-in users, role-aware, internal) */}
          {identity && (
            <div className="drop-wrap" ref={workspaceRef}>
              <button
                onClick={() => setWorkspaceOpen((v) => !v)}
                className="drop-btn"
                aria-expanded={workspaceOpen}
                aria-haspopup="menu"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Workspace</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {workspaceOpen && (
                <div className="drop-menu" role="menu" aria-label="Area kerja">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      {demoMode && <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      {identity.email}
                    </div>
                  </div>
                  
                  <span className="drop-section">Area Kerja</span>
                  <Link
                    href="/member"
                    className="drop-item"
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                    <span>
                      <span className="drop-item-label">Portal Member</span>
                      <span className="drop-item-desc">Dasbor, profil, notifikasi, organisasi</span>
                    </span>
                  </Link>
                  <Link
                    href="/learner/activity"
                    className="drop-item"
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <History className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                    <span>
                      <span className="drop-item-label">Aktivitas Saya</span>
                      <span className="drop-item-desc">Pengajuan sesi & poin internal</span>
                    </span>
                  </Link>
                  <Link
                    href="/organization"
                    className="drop-item"
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <Building2 className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                    <span>
                      <span className="drop-item-label">Portal Organisasi</span>
                      <span className="drop-item-desc">Kelola keanggotaan organisasi</span>
                    </span>
                  </Link>
                  {isEducator && (
                    <Link
                      href="/educator/workspace"
                      className="drop-item"
                      onClick={() => setWorkspaceOpen(false)}
                    >
                      <UserRound className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                      <span>
                        <span className="drop-item-label">Ruang Pendidik</span>
                        <span className="drop-item-desc">Kelola pengajuan sesi masuk</span>
                      </span>
                    </Link>
                  )}
                  {isVerifier && (
                    <Link
                      href="/management/lajnah"
                      className="drop-item"
                      onClick={() => setWorkspaceOpen(false)}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                      <span>
                        <span className="drop-item-label">Portal Lajnah</span>
                        <span className="drop-item-desc">Antrean verifikasi kredensial & sanad</span>
                      </span>
                    </Link>
                  )}
                  {isFounder && (
                    <Link
                      href="/management"
                      className="drop-item"
                      onClick={() => setWorkspaceOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                      <span>
                        <span className="drop-item-label">Management &amp; Governance</span>
                        <span className="drop-item-desc">Delegasi, audit, backup, sistem</span>
                      </span>
                    </Link>
                  )}
                  <div className="drop-divider" />
                  <Link
                    href="/developer"
                    className="drop-item"
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <Code2 className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                    <span>
                      <span className="drop-item-label">Developer API</span>
                      <span className="drop-item-desc">Referensi endpoint & skema</span>
                    </span>
                  </Link>
                  
                  {isFounder && (
                    <>
                      <div className="drop-divider" />
                      <span className="drop-section text-amber-600 dark:text-amber-500">Pratinjau (Founder)</span>
                      {PREVIEW_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="drop-item"
                            onClick={() => setWorkspaceOpen(false)}
                          >
                            <Icon className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <span>
                              <span className="drop-item-label">{link.label}</span>
                              <span className="drop-item-desc">{link.desc}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {!identity && (
            <Link href="/login" className="nav-link font-semibold text-emerald-900 dark:text-emerald-100 hidden sm:block">
              Masuk
            </Link>
          )}

          <button onClick={toggleTheme} className="icon-btn" aria-label="Ubah tema">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <Link href="/directory" className="btn btn-primary desktop-only">
            Cari Pendidik
          </Link>
        </div>
      </div>
    </header>
  );
}
