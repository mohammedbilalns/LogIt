import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ArticleRowSkeleton from '@components/skeletons/ArticleRowSkeleton';
import ArticleRow from '@components/article/ArticleRow';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import UserSidebar from '@/components/user/UserSidebar';

const dummyUser = {
  _id: 'u123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  profession: 'Software Engineer',
  bio: 'Passionate about open source and web technologies.',
  profileImage: null,
};

const dummyArticles = [
  {
    _id: 'a1',
    title: 'Understanding React Hooks',
    content: 'A deep dive into how React Hooks work internally. This is the full content of the article.',
    author: dummyUser.name,
    featured_image: null,
    tagNames: ['React', 'Hooks'],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'a2',
    title: 'TypeScript Best Practices',
    content: 'Tips and tricks for writing better TS code. This is the full content of the article.',
    author: dummyUser.name,
    featured_image: null,
    tagNames: ['TypeScript', 'Best Practices'],
    createdAt: new Date().toISOString(),
  },
];

export default function UserPublicProfile() {
  const { id } = useParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState(dummyArticles);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && page === 1 && !loading) {
        setLoading(true);
        setTimeout(() => {
          setArticles((prev) => [...prev, ...dummyArticles]);
          setPage((p) => p + 1);
          setLoading(false);
        }, 1000); // Simulate load
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loading, page]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const renderSkeletons = () =>
    Array.from({ length: 2 }, (_, i) => <ArticleRowSkeleton key={i} />);

  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <>
      <UserSidebar />
      <Box className={containerClassName}>
        <Box mb={40}>
          <Stack align="center" gap="xs">
            <Avatar src={dummyUser.profileImage} size={isMobile ? 80 : 120} radius="xl">
              {getInitials(dummyUser.name)}
            </Avatar>
            <Title order={3}>{dummyUser.name}</Title>
            <Text c="dimmed">{dummyUser.email}</Text>
            <Text size="sm">{dummyUser.profession}</Text>
            <Text size="sm" ta="center" maw={600}>
              {dummyUser.bio}
            </Text>

            <Group mt="sm" wrap="wrap" justify="center">
              <Button color="blue">Follow</Button>
              <Button variant="outline">Chat</Button>
              <Button color="red">Block</Button>
              <Button variant="outline" color="gray">Report</Button>
            </Group>
          </Stack>
        </Box>

        <Box>
          <Title order={4} mb="md">
            Recent Articles
          </Title>
          <Stack gap="md">
            {articles.map((article) => (
              <ArticleRow key={article._id} article={article} />
            ))}
            <div ref={observerTarget} style={{ height: 20 }} />
            {loading && renderSkeletons()}
          </Stack>
        </Box>
      </Box>
    </>
  );
}
