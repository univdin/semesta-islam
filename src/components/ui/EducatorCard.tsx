import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Star, MapPin, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { EducatorSummary, VerificationStatus } from '@/types';

interface EducatorCardProps {
  educator: EducatorSummary;
}

const VERIFICATION_STATUS: Record<VerificationStatus, { label: string; cls: string; icon?: typeof Clock }> = {
  VERIFIED: { label: 'Terverifikasi Lajnah', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  SUBMITTED: { label: 'Menunggu Verifikasi Lajnah', cls: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock },
  UNDER_REVIEW_LAJNAH: { label: 'Sedang Ditelaah Lajnah', cls: 'bg-blue-50 text-blue-800 border-blue-200', icon: Clock },
  REJECTED: { label: 'Verifikasi Ditolak', cls: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  DRAFT: { label: 'Belum Diverifikasi', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  REVOKED: { label: 'Verifikasi Dicabut', cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: XCircle },
};

export function EducatorCard({ educator }: EducatorCardProps) {
  const status = VERIFICATION_STATUS[educator.verifiedStatus] ?? VERIFICATION_STATUS.DRAFT;
  const StatusIcon = status.icon;
  return (
    <div className="educator-card">
      <div className="card-top">
        <div className="avatar-wrapper">
          <img
            src={educator.avatar}
            alt={educator.name}
            className="avatar-img"
            loading="lazy"
          />
          {educator.verified && (
            <div className="verified-badge-icon" title="Terverifikasi ILMIFY">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>
        <div className="educator-info">
          <h3>{educator.name}</h3>
          <p className="educator-title">{educator.title}</p>
          <div className="location-tag">
            <MapPin className="w-3 h-3 text-[#94A3B8]" />
            <span>{educator.location} ({educator.method})</span>
          </div>
        </div>
      </div>

      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border w-fit mb-3 ${
          status.cls
        }`}
      >
        {StatusIcon && <StatusIcon className="w-3 h-3" />}
        {status.label}
      </span>

      <div className="expertise-chips">
        {educator.expertise.map((exp, idx) => (
          <span key={idx} className="exp-chip">{exp}</span>
        ))}
      </div>

      <div className="card-footer">
        <Link
          href={`/educator/${educator.slug || educator.id}`}
          className="btn btn-secondary text-xs py-1.5 px-3"
        >
          Lihat Profil & Sanad
        </Link>
        <Link
          href={`/booking?educatorId=${educator.id}`}
          className="btn btn-primary text-xs py-1.5 px-3"
        >
          Ajukan Sesi Belajar
        </Link>
      </div>
    </div>
  );
}
