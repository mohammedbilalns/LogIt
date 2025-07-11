interface VideoOffIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const VideoOffIcon = ({ width = 24, height = 24, color = 'currentColor' }: VideoOffIconProps) => (
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
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.16 16.16L5 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    <path d="M21 7v10a2 2 0 0 1-2 2H9" />
    <path d="M12 12l4-4" />
  </svg>
); 