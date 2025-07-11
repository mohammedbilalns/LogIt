import React from 'react';

export const NetworkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon icon-tabler icons-tabler-outline icon-tabler-network"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0" />
    <path d="M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6" />
    <path d="M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6" />
    <path d="M6 9h12" />
    <path d="M3 20h7" />
    <path d="M14 20h7" />
    <path d="M10 20a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M12 15v3" />
  </svg>
);