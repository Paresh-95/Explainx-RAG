import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background neural network grid */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#0f172a"
            strokeWidth="0.75"
            opacity="0.15"
          />
          <path
            d="M6 6 L18 18 M18 6 L6 18"
            stroke="#0f172a"
            strokeWidth="0.75"
            opacity="0.15"
          />
          <path
            d="M12 2 L12 22 M2 12 L22 12"
            stroke="#0f172a"
            strokeWidth="0.75"
            opacity="0.15"
          />
          {/* Main analytics line */}
          <path
            d="M4 16 L8 12 L12 14 L16 8 L20 6"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Neural network nodes */}
          <circle cx="8" cy="12" r="2" fill="#0f172a" />
          <circle cx="12" cy="14" r="2" fill="#0f172a" />
          <circle cx="16" cy="8" r="2" fill="#0f172a" />
          {/* AI connection paths */}
          <path
            d="M8 12 L12 14 L16 8"
            stroke="#0f172a"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}