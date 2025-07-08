import React from 'react';
import { Box, Paper, Center, Text, rem, useMantineTheme, useMantineColorScheme } from '@mantine/core';

interface AuthSplitLayoutProps {
    children: React.ReactNode;
    rightHeading?: string;
    rightDescription?: string;
}

export default function AuthSplitLayout({ children, rightHeading, rightDescription }: AuthSplitLayoutProps) {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const rightBg = isDark ? theme.colors.blue[8] : theme.colors.blue[6];
    const imageSrc = isDark ? '/auth_image_dark.png' : '/auth_image.png';

    return (
        <Box
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: isDark ? theme.colors.dark[7] : 'var(--mantine-color-gray-0)',
            }}
        >
            <Box
                style={{
                    flex: 1,
                    background: isDark ? theme.colors.dark[7] : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: 0,
                    padding: rem(32),
                }}
            >
                <Box style={{ width: '100%', maxWidth: 400 }}>{children}</Box>
            </Box>

            <Box
                className="auth-split-right"
                style={{
                    flex: 1,
                    background: rightBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    minWidth: 0,
                }}
            >
                <Box style={{ width: '90%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper
                        shadow="md"
                        radius="lg"
                        p="lg"
                        style={{
                            width: '100%',
                            marginBottom: rem(24),
                            background: isDark ? theme.colors.dark[6] : '#fff',
                            color: isDark ? theme.white : '#3b2ff5',
                            boxShadow: '0 4px 24px rgba(44, 62, 80, 0.10)',
                            textAlign: 'left',
                        }}
                    >
                        <Text fw={700} fz="lg" mb={4} c={isDark ? theme.white : '#3b2ff5'}>
                            {rightHeading || 'Welcome to LogIt'}
                        </Text>
                        <Text fz="sm" c={isDark ? theme.colors.gray[3] : 'dimmed'}>
                            {rightDescription || (
                                <>
                                    Turn your ideas into reality.<br />
                                    Consistent quality and experience across all platforms and devices.
                                </>
                            )}
                        </Text>
                    </Paper>
                    <img
                        src={imageSrc}
                        alt="Auth visual"
                        style={{
                            width: '100%',
                            borderRadius: rem(24),
                            boxShadow: '0 8px 32px rgba(44, 62, 80, 0.18)',
                            marginBottom: rem(8),
                            background: isDark ? theme.colors.dark[5] : '#fff',
                        }}
                    />
                </Box>
            </Box>

            <style>{`
        @media (max-width: 900px) {
          .auth-split-right {
            display: none !important;
          }
        }
      `}</style>
        </Box>
    );
} 