import React from 'react';

export const VideoIcon = ({ width = 20, height = 20, color = 'currentColor' }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="15" height="14" rx="2" stroke={color} strokeWidth="2" />
    <path d="M21 7.5V16.5L17 14V10L21 7.5Z" fill={color} />
  </svg>
);

export default VideoIcon; 