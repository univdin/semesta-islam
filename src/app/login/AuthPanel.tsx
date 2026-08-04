'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  FlaskConical,
  Loader2,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/useToast';

const DEMO_IDENTITIES = [
  { email: 'learner.demo@localhost.test', label: 'Learner' },
  { email: 'educator.demo@localhost.test', label: 'Educator' },
  { email: 'lajnah.demo@localhost.test', label: 'Lajnah' },
  { email: 'founder.demo@localhost.test', label: 'Founder' },
  { email: 'orgadmin.demo@localhost.test', label: 'Org Admin' },
  { email: 'orgstaff.demo@localhost.test', label: 'Org Staff' },
];

// NEXT_PUBLIC_* vars are inlined into the client bundle at build time.
const supabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder');

type AuthMode = 'signin' | 'register' | 'forgot';

function safeRedirect(target: string | null | undefined): string {
  if (
    target &&
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.includes(':') &&
    !target.includes('\\')
  ) {
    return target;
  }
  return '/member';
}

export function AuthPanel({
  demoMode,
  redirect,
  error,
  initialMode,
}: {
  demoMode: boolean;
  redirect?: string;
  error?: string;
  initialMode?: 'signin' | 'register';
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode ?? 'signin');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');
  const toast = useToast();
  const router = useRouter();

  const authErrorBanner = error === 'auth_callback_failed'
    ? 'Pendaftaran/masuk gagal diselesaikan. Silakan coba lagi.'
    : error === 'provision_failed'
      ? 'Akun berhasil dikonfirmasi, tetapi profil lokal belum siap. Silakan coba masuk lagi.'
      : '';

  const getTargetRouteForRole = (demoEmail: string): string => {
    if (demoEmail.includes('learner')) return '/learner/activity';
    if (demoEmail.includes('educator')) return '/educator/workspace';
    if (demoEmail.includes('lajnah')) return '/management/lajnah';
    if (demoEmail.includes('founder')) return '/management/governance';
    if (demoEmail.includes('org')) return '/organization';
    return '/member';
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Gagal masuk.');
      }
      const target = getTargetRouteForRole(demoEmail);
      toast.success('Bismillah, Anda telah masuk ke mode demo.', `Status aktif: ${demoEmail}`);
      router.push(target);
      router.refresh();
    } catch (err) {
      toast.error('Gagal masuk.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfo('');
    setLoading(true);
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      const msg = signInError.message.toLowerCase();
      toast.error(
        'Gagal Masuk',
        msg.includes('confirm')
          ? 'Email Anda belum dikonfirmasi. Cek kotak masuk untuk tautan konfirmasi.'
          : signInError.message
      );
      return;
    }

    toast.success('Bismillah, selamat datang kembali!');
    router.push(safeRedirect(redirect));
    router.refresh();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfo('');
    setLoading(true);
    const { data, error: signUpError } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      toast.error('Gagal Mendaftar', signUpError.message);
      return;
    }

    if (data.session) {
      toast.success('Akun berhasil dibuat', 'Anda telah masuk ke ILMIFY.');
      router.push(safeRedirect(redirect));
      router.refresh();
    } else {
      setInfo('Tautan konfirmasi telah dikirim ke email Anda. Periksa kotak masuk (termasuk folder spam) lalu kembali untuk masuk.');
      setMode('signin');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfo('');
    setLoading(true);
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/api/auth/callback?next=/auth/update-password` }
    );
    setLoading(false);

    if (resetError) {
      toast.error('Gagal Mengirim Tautan', resetError.message);
      return;
    }

    setInfo('Tautan reset kata sandi telah dikirim ke email Anda. Periksa kotak masuk Anda.');
    setMode('signin');
  };

  const handleOAuth = async (provider: 'google') => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/api/auth/callback${
      safeRedirect(redirect) !== '/member' ? `?next=${encodeURIComponent(safeRedirect(redirect))}` : ''
    }`;
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    setLoading(false);
    if (oauthError) {
      toast.error('Gagal masuk', oauthError.message);
    }
  };

  const inputCls =
    'block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E] dark:focus:ring-[#D4AF37] transition-colors text-sm';
  const labelCls = 'text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider';

  return (
    <div className="glass-panel p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {(authErrorBanner || info) && (
          <div
            className={`p-3 rounded-xl text-sm flex items-start gap-2 border ${
              authErrorBanner
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {authErrorBanner ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{authErrorBanner || info}</span>
          </div>
        )}

        {/* Mode tabs (only when Supabase is configured) */}
        {supabaseConfigured && (
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-900/60">
            {(
              [
                { key: 'signin', label: 'Masuk' },
                { key: 'register', label: 'Daftar' },
                { key: 'forgot', label: 'Lupa' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key);
                  setInfo('');
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === tab.key
                    ? 'bg-white dark:bg-gray-800 text-[#0F3D2E] dark:text-[#D4AF37] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-1">
              <label className={labelCls}>Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  disabled={!supabaseConfigured || loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Kata Sandi</label>
                {supabaseConfigured && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Lupa kata sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  disabled={!supabaseConfigured || loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!supabaseConfigured || loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0F3D2E] hover:bg-[#16533F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F3D2E] transition-all group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Masuk ke Workspace
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1">
              <label className={labelCls}>Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Nama lengkap Anda"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="anda@email.com"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Minimal 8 karakter"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!supabaseConfigured || loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0F3D2E] hover:bg-[#16533F] transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Daftar Akun Baru
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {!supabaseConfigured && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Pendaftaran sedang dinonaktifkan karena autentikasi belum dikonfigurasi. Silakan
                hubungi tim ILMIFY.
              </p>
            )}
            <p className="text-xs text-gray-500 text-center">
              Dengan mendaftar Anda menyetujui{' '}
              <a href="/terms-of-service" className="text-emerald-700 hover:underline">
                Ketentuan Layanan
              </a>{' '}
              dan{' '}
              <a href="/privacy-policy" className="text-emerald-700 hover:underline">
                Kebijakan Privasi
              </a>
              .
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Masukkan email terdaftar Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi.
            </p>
            <div className="space-y-1">
              <label className={labelCls}>Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="anda@email.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0F3D2E] hover:bg-[#16533F] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Tautan Reset'}
            </button>
          </form>
        )}

        {/* OAuth buttons */}
        {supabaseConfigured && mode === 'signin' && (
          <div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 rounded-full text-xs">
                  Atau masuk dengan
                </span>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuth('google')}
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Masuk dengan Google
              </button>
            </div>
          </div>
        )}

        {!supabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200/80">
            Masuk dengan akun (email/Google) belum aktif pada lingkungan ini. {demoMode ? 'Gunakan Quick Demo Login di bawah.' : 'Silakan hubungi pengelola platform.'}
          </div>
        )}

        {/* Demo quick login (dev only) */}
        {demoMode && (
          <div className="pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 rounded-full text-xs flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5" /> Quick Demo Login (localhost)
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_IDENTITIES.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(d.email)}
                  className="py-2 px-3 rounded-xl border border-emerald-700/40 bg-emerald-50/60 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
