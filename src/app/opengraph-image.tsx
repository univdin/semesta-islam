import { ImageResponse } from 'next/og';

export const alt = 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0F3D2E 0%, #09271D 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#F8FAFC',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Decorative Gold Accent Lines */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
          }}
        />

        {/* Brand Icon SVG */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            marginBottom: 24,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 12 L35.5 24.5 L48 28 L35.5 31.5 L32 44 L28.5 31.5 L16 28 L28.5 24.5 Z"
              fill="#D4AF37"
            />
            <circle cx="46" cy="18" r="3" fill="#D4AF37" />
            <circle cx="18" cy="46" r="2.5" fill="#D4AF37" opacity="0.7" />
          </svg>
        </div>

        {/* Brand Title */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            display: 'flex',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span>SEMESTA</span>
          <span style={{ color: '#D4AF37' }}>ISLAM</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: '#CBD5E1',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Platform Digital Terpercaya Penghubung Pembelajaran &amp; Pendidikan Islam
        </div>

        {/* Badge Footer */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 999,
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#F3E5AB',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          <span>Verifikasi Kredensial &amp; Sanad Keilmuan Lajnah</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
