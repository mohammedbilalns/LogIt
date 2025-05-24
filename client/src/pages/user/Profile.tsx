import {
    Avatar,
    Box,
    Button,
    Group,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUserArticles } from '../../store/slices/articleSlice';
import CreateButton from '../../components/CreateButton';
import ArticleRow from '../../components/article/ArticleRow';
import ArticleRowSkeleton from '../../components/article/ArticleRowSkeleton';

export default function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>();
    const [page, setPage] = useState(1);
    const { user } = useSelector((state: RootState) => state.auth);
    const { userArticles, loading, userArticlesHasMore } = useSelector((state: RootState) => state.articles);

    useEffect(() => {
        dispatch(fetchUserArticles({ page: 1, limit: 5 }));
    }, [dispatch]);

    const handleLoadMore = () => {
        if (userArticlesHasMore) {
            setPage(prev => prev + 1);
            dispatch(fetchUserArticles({ page: page + 1, limit: 5 }));
        }
    };

    const getInitials = (name?: string) => {
        if (!name) {
            return '?';
        }
        const parts = name.split(' ');
        if (parts.length === 1) {
            return parts[0][0];
        }
        return parts[0][0] + parts[parts.length - 1][0];
    };

    const renderSkeletons = () => {
        return Array(3).fill(0).map((_, index) => (
            <ArticleRowSkeleton key={index} />
        ));
    };

    return (
        <Box ml={290} mt={100} mr={30} pl="md" pb={100}>
            {/* Profile Header */}
            <Box mb={40}>
                <Stack align="center" gap="xs">
                    <Avatar
                        src={user?.profileImage}
                        size={120}
                        radius="xl"
                    >
                        {getInitials(user?.name)}
                    </Avatar>
                    <Title order={3}>{user?.name}</Title>
                    <Text c="dimmed">{user?.email}</Text>
                    <Text size="sm">{user?.profession}</Text>
                    <Text size="sm" ta="center" maw={600}>
                        {user?.bio}
                    </Text>
                    <Group mt="sm">
                        <Button variant="filled">Edit Profile</Button>
                        <Button variant="default">Change Password</Button>
                        <Button variant="outline" leftSection={<Avatar size={18} radius="xl" />}>
                            Upgrade to Pro
                        </Button>
                    </Group>
                </Stack>
            </Box>

            {/* Recent Articles */}
            <Box>
                <Title order={4} mb="md">
                    Recent Articles
                </Title>
                <Stack gap="md">
                    {loading && page === 1 ? (
                        renderSkeletons()
                    ) : (
                        userArticles.map((article) => (
                            <ArticleRow 
                                key={article._id} 
                                article={{
                                    _id: article._id,
                                    title: article.title,
                                    content: article.content,
                                    author: article.author,
                                    featured_image: article.featured_image,
                                    tagNames: article.tagNames || [],
                                    createdAt: article.createdAt
                                }} 
                            />
                        ))
                    )}
                </Stack>
                {userArticlesHasMore && (
                    <Group justify="center" mt="xl">
                        <Button 
                            variant="light" 
                            onClick={handleLoadMore}
                            loading={loading && page > 1}
                        >
                            Load More
                        </Button>
                    </Group>
                )}
            </Box>

            {/* Create Floating Button */}
            <Box pos="fixed" bottom={24} right={24}>
                <CreateButton />
            </Box>
        </Box>
    );
}
  