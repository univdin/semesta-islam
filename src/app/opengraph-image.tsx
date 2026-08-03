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
          <svg width="48" height="48" viewBox="0 0 512 512" fill="none">
            <g transform="translate(256, 256) scale(1.3)">
              <rect x="-150" y="-150" width="300" height="300" rx="20" fill="none" stroke="#D4AF37" strokeWidth="10" opacity="0.5" />
              <rect x="-150" y="-150" width="300" height="300" rx="20" fill="none" stroke="#D4AF37" strokeWidth="10" transform="rotate(45)" opacity="0.5" />
              <path d="M-80 55 Q-35 25 0 55 Q35 25 80 55 Q45 80 0 68 Q-45 80 -80 55 Z" fill="#D4AF37"/>
              <path d="M0 -105 L15 -35 L75 -65 L32 -15 L85 12 L18 22 L32 80 L-10 32 L-52 68 L-32 10 L-85 -10 L-22 -20 L-45 -65 L0 -35 Z" fill="#FFF3C4"/>
            </g>
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
