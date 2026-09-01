interface HeartIconProps {
  filled: boolean;
  size?: number;
}

export function HeartIcon({ filled, size = 36 }: HeartIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#ff5d8f" : "none"}
      stroke={filled ? "#ff5d8f" : "#4a194240"}
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path d="M12 21s-7.2-4.6-9.9-9.1C.5 8.6 1.7 5 5.1 4.1c2.1-.5 4.1.5 5.1 2.2.2.3.6.3.8 0 1-1.7 3-2.7 5.1-2.2 3.4.9 4.6 4.5 3 7.8C19.2 16.4 12 21 12 21z" />
    </svg>
  );
}
