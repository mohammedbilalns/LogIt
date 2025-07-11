interface VideoIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const VideoIcon = ({ width = 24, height = 24, color = 'currentColor' }: VideoIconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
); 