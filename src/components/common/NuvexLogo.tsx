export function NuvexLogo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="url(#nuvex-grad)" />
      <path
        d="M12 28V16L20 28V16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 16L28 28L32 16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="nuvex-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="hsl(211, 100%, 50%)" />
          <stop offset="1" stopColor="hsl(230, 100%, 60%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
