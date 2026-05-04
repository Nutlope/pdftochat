import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fdfbf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 24 24" width={132} height={132} fill="none">
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
      </div>
    ),
    { ...size },
  );
}
