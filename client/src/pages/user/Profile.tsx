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
import { useDisclosure } from "@mantine/hooks";
import CreateButton from '../../components/CreateButton';
import ArticleRow from '../../components/article/ArticleRow';
import ArticleRowSkeleton from '../../components/article/ArticleRowSkeleton';
import ChangePasswordModal from '../../components/user/ChangePasswordModal';
import { useMediaQuery } from '@mantine/hooks';

interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>();
    const [page, setPage] = useState(1);
    const { user } = useSelector((state: RootState) => state.auth);
    const { userArticles, loading, userArticlesHasMore } = useSelector((state: RootState) => state.articles);
    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        dispatch(fetchUserArticles({ page: 1, limit: 5 }));
    }, [dispatch]);

    const handleLoadMore = () => {
        if (userArticlesHasMore) {
            setPage(prev => prev + 1);
            dispatch(fetchUserArticles({ page: page + 1, limit: 5 }));
        }
    };

    const handleChangePassword = (values: ChangePasswordForm) => {
        console.log(values);
        close();
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
        <Box 
            ml={isMobile ? 16 : 290} 
            mt={100} 
            mr={isMobile ? 16 : 30} 
            pl={isMobile ? 0 : "md"} 
            pb={100}
        >
            {/* Profile Header */}
            <Box mb={40}>
                <Stack align="center" gap="xs">
                    <Avatar
                        src={user?.profileImage}
                        size={isMobile ? 80 : 120}
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
                    <Group mt="sm" wrap="wrap" justify="center">
                        <Button variant="filled">
                            Edit Profile
                        </Button>
                        <Button variant="default" onClick={open}>
                            Change Password
                        </Button>
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

            <Box pos="fixed" bottom={24} right={24}>
                <CreateButton />
            </Box>

            <ChangePasswordModal 
                opened={opened}
                onClose={close}
                onSubmit={handleChangePassword}
            />
        </Box>
    );
}
  