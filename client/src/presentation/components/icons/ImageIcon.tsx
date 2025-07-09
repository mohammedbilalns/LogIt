import React from 'react';

interface ImageIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const ImageIcon: React.FC<ImageIconProps> = ({ 
  width = 24, 
  height = 24, 
  color = 'currentColor' 
}) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
); 