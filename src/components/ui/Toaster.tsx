'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast } from './useToast';

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const COLOR_MAP = {
  success: 'bg-emerald-900 border-emerald-700 text-emerald-100',
  error: 'bg-red-900 border-red-700 text-red-100',
  info: 'bg-sky-900 border-sky-700 text-sky-100',
  warning: 'bg-amber-900 border-amber-700 text-amber-100',
} as const;

export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon = ICON_MAP[toast.variant];
        const color = COLOR_MAP[toast.variant];

        return (
          <div
            key={toast.id}
            className={`${color} border rounded-xl shadow-xl p-3 pointer-events-auto flex gap-3 items-start animate-in slide-in-from-right-full duration-300`}
            role="alert"
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              {toast.description && (
                <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
