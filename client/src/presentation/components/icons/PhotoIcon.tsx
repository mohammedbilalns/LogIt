import React from 'react';

export const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    className="icon icon-tabler icons-tabler-outline icon-tabler-photo"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 8h.01" />
    <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
    <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
    <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
  </svg>
);