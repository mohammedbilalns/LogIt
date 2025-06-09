import { Box, Button, Container, Group, Stack, Text, Title, useMantineColorScheme, Image, Grid, Card, Badge } from '@mantine/core';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  IconArrowRight, 
  IconBook, 
  IconShare, 
  IconTarget, 
  IconRocket, 
  IconUsers, 
  IconMessageCircle,
  IconLock,
  IconWorld
} from '@tabler/icons-react';
import React from 'react';

const MotionDiv = motion.div;

const features = [
  {
    icon: <IconTarget size={32} />,
    title: 'Personal Logs',
    description: 'Keep track of your daily experiences, technical challenges, and personal growth. Document your journey with private logs that only you can access.',
    color: 'blue'
  },
  {
    icon: <IconShare size={32} />,
    title: 'Public Articles',
    description: 'Share your knowledge and experiences with the community through well-crafted articles. Help others learn from your insights and discoveries.',
    color: 'green'
  },
  {
    icon: <IconMessageCircle size={32} />,
    title: 'Real-time Communication',
    description: 'Connect with other users through chat, audio, and video calls. Collaborate, discuss, and learn together in a secure environment.',
    color: 'violet'
  },
  {
    icon: <IconLock size={32} />,
    title: 'Privacy First',
    description: 'Your personal logs are private by default. Choose what to share and with whom. Maintain complete control over your content and privacy.',
    color: 'orange'
  }
];

const stats = [
  { value: '10K+', label: 'Personal Logs', icon: <IconBook size={24} /> },
  { value: '5K+', label: 'Public Articles', icon: <IconWorld size={24} /> },
  { value: '2K+', label: 'Active Users', icon: <IconUsers size={24} /> },
  { value: '100%', label: 'Privacy Guaranteed', icon: <IconLock size={24} /> }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  return (
    <Box>
      {/* Hero Section */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: isDark 
            ? 'linear-gradient(135deg, var(--mantine-color-dark-7) 0%, var(--mantine-color-dark-9) 100%)'
            : 'linear-gradient(135deg, #f6f8fd 0%, #e9f0f7 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
          <Grid gutter={40} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <MotionDiv
                  style={{ opacity, scale, y }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Badge size="lg" variant="gradient" gradient={{ from: 'blue', to: 'violet' }} mb="md">
                    Your Personal Digital Journal
                  </Badge>
                  <Title 
                    order={1} 
                    size={60} 
                    style={{ 
                      background: isDark 
                        ? 'linear-gradient(45deg, #fff 30%, #a5b4fc 90%)'
                        : 'linear-gradient(45deg, #1a1b1e 30%, #4c6ef5 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: '1rem',
                      lineHeight: 1.2
                    }}
                  >
                    Log, Share, Connect, Grow
                  </Title>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Text 
                    size="xl" 
                    c="dimmed" 
                    style={{ fontSize: '1.25rem', lineHeight: 1.6 }}
                  >
                    Your all-in-one platform for personal logging and knowledge sharing. 
                    Keep private logs, share public articles, and connect with others through chat and video calls.
                  </Text>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Group>
                    <Button
                      size="lg"
                      radius="md"
                      onClick={() => navigate('/logs')}
                      rightSection={<IconArrowRight size={20} />}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'violet' }}
                    >
                      Start Logging
                    </Button>
                    <Button
                      size="lg"
                      radius="md"
                      variant="outline"
                      onClick={() => navigate('/articles')}
                    >
                      Browse Articles
                    </Button>
                  </Group>
                </MotionDiv>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MotionDiv
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Image
                  src="/hero-illustration.svg"
                  alt="Personal Logging Platform"
                  fallbackSrc="https://placehold.co/600x400?text=Personal+Logging+Platform"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </MotionDiv>
            </Grid.Col>
          </Grid>
        </Container>

        {/* Background Animation */}
        <MotionDiv
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark 
              ? 'radial-gradient(circle at 50% 50%, rgba(76, 110, 245, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 50% 50%, rgba(76, 110, 245, 0.05) 0%, transparent 50%)',
            zIndex: 0
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </MotionDiv>

      {/* Stats Section */}
      <Box py={80} style={{ background: isDark ? 'var(--mantine-color-dark-8)' : 'white' }}>
        <Container size="lg">
          <Grid gutter="xl">
            {stats.map((stat, index) => (
              <Grid.Col key={stat.label} span={{ base: 6, md: 3 }}>
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card withBorder padding="xl" radius="md">
                    <Group gap="xs" mb="md">
                      {stat.icon}
                      <Text size="xl" fw={700} c={isDark ? 'blue.4' : 'blue.6'}>
                        {stat.value}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {stat.label}
                    </Text>
                  </Card>
                </MotionDiv>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={100} style={{ background: isDark ? 'var(--mantine-color-dark-9)' : '#f8fafc' }}>
        <Container size="lg">
          <Stack gap={80}>
            {features.map((feature, index) => (
              <MotionDiv
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Grid gutter={40} align="center">
                  <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: index % 2 === 0 ? 1 : 2 }}>
                    <Stack>
                      <Group gap="xs">
                        <Box 
                          style={{ 
                            color: isDark ? `var(--mantine-color-${feature.color}-4)` : `var(--mantine-color-${feature.color}-6)`
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Title order={2} style={{ 
                          color: isDark ? `var(--mantine-color-${feature.color}-4)` : `var(--mantine-color-${feature.color}-6)`
                        }}>
                          {feature.title}
                        </Title>
                      </Group>
                      <Text size="lg" c="dimmed" style={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: index % 2 === 0 ? 2 : 1 }}>
                    <Image
                      src={`/feature-${index + 1}.svg`}
                      alt={feature.title}
                      fallbackSrc={`https://placehold.co/600x400?text=${feature.title}`}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Grid.Col>
                </Grid>
              </MotionDiv>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={100} style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, var(--mantine-color-dark-7) 0%, var(--mantine-color-dark-9) 100%)'
          : 'linear-gradient(135deg, #f6f8fd 0%, #e9f0f7 100%)'
      }}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Title order={2} ta="center" size={40}>
                Ready to Start Your Journey?
              </Title>
            </MotionDiv>
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Text size="xl" ta="center" c="dimmed" maw={600}>
                Join our community of users who are documenting their journey, sharing knowledge, and connecting with others.
              </Text>
            </MotionDiv>
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Group>
                <Button
                  size="lg"
                  radius="md"
                  onClick={() => navigate('/signup')}
                  rightSection={<IconRocket size={20} />}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'violet' }}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  radius="md"
                  variant="outline"
                  onClick={() => navigate('/articles')}
                >
                  Explore Articles
                </Button>
              </Group>
            </MotionDiv>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
} 