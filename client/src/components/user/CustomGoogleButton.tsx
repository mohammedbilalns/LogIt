import React, { useRef } from 'react';
import { Button, useMantineTheme, useMantineColorScheme, rem } from '@mantine/core';
import { GoogleButton } from './GoogleButton';

export default function CustomGoogleButton({ style }: { style?: React.CSSProperties }) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    const btn = googleBtnRef.current?.querySelector('div[role="button"]');
    if (btn) (btn as HTMLElement).click();
  };

  return (
    <>
      <Button
        fullWidth
        radius="md"
        size="md"
        variant={isDark ? 'outline' : 'default'}
        leftSection={
          <img
            src="/gogle_light.svg"
            alt="Google"
            style={{ width: rem(28), height: rem(28), marginRight: rem(10) }}
          />
        }
        style={{
          fontWeight: 500,
          background: isDark ? theme.colors.dark[6] : '#fff',
          color: isDark ? theme.white : '#222',
          border: isDark ? `1px solid ${theme.colors.gray[7]}` : '1px solid #e0e0e0',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.12)' : '0 2px 8px rgba(44,62,80,0.06)',
          ...style,
        }}
        onClick={handleClick}
      >
        Continue with Google
      </Button>
      <div ref={googleBtnRef} style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }}>
        <GoogleButton />
      </div>
    </>
  );
} 