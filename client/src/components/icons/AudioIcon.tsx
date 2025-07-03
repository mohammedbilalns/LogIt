import React from 'react';

export const AudioIcon = ({ width = 20, height = 20, color = 'currentColor' }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="4" width="6" height="16" rx="3" stroke={color} strokeWidth="2" />
    <path d="M19 10V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M5 10V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
export default AudioIcon; 