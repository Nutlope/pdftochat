import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PDFtoChat — chat with your PDFs in seconds.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fdfbf8',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          justifyContent: 'space-between',
          fontFamily: 'system-ui',
        }}
      >
        {/* Top row: mark + wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            color: '#2a2420',
          }}
        >
          <svg viewBox="0 0 24 24" width={48} height={48} fill="none">
            <path
              d="M4 3.75 H14.5 L20 9.25 V20.25 H4 Z"
              stroke="#2a2420"
              strokeWidth={1.6}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M14.5 3.75 V9.25 H20"
              stroke="#2a2420"
              strokeWidth={1.6}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: '#2a2420',
            }}
          >
            <span>pdf</span>
            <span style={{ color: '#90867f', margin: '0 6px' }}>→</span>
            <span>chat</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1.02,
              color: '#2a2420',
              maxWidth: '85%',
            }}
          >
            Chat with your PDFs.
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#605852',
              maxWidth: 720,
              lineHeight: 1.4,
            }}
          >
            Upload a paper. Ask anything. Every reply cites the source pages.
          </div>
        </div>

        {/* Bottom row: credits */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#90867f',
            fontSize: 22,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span>open source · MIT</span>
          <span>powered by together AI</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
