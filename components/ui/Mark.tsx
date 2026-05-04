type Props = { size?: number; className?: string };

/**
 * Brand mark — a single-stroke document outline with a folded top-right
 * corner. Two paths, no fill, no dot. Reads as "page" at every size from
 * 16 px (favicon) to 180 px+ (apple icon).
 */
export default function Mark({ size = 20, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label="PDFtoChat"
      className={className}
      fill="none"
    >
      {/* Page body — 5 corners; the top-right is the fold mouth */}
      <path
        d="M4 3.75 H14.5 L20 9.25 V20.25 H4 Z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Folded corner — short L pulled back into the page */}
      <path
        d="M14.5 3.75 V9.25 H20"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
