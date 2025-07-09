import React from 'react';

interface PlayIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const PlayIcon: React.FC<PlayIconProps> = ({ 
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
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

export const PauseIcon: React.FC<PlayIconProps> = ({ 
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
    <line x1="6" y1="4" x2="6" y2="20" />
    <line x1="18" y1="4" x2="18" y2="20" />
  </svg>
); 