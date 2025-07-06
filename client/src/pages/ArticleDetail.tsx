import  { useEffect, useState } from 'react';
import { fetchArticle, deleteArticle, setArticleReported } from '@slices/articleSlice';
import { clearReportState, createReport } from '@slices/reportSlice';
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import ReactMarkdown, { Components } from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ConfirmModal } from '@/components/confirm';
import TagList from '@/components/tags/TagList';
import {
  Box,
  Button,
  Center,
  Chip,
  Group,
  Skeleton,
  Modal,
  Paper,
  Radio,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { AppDispatch, RootState } from '@/store';

const ArticleDetailSkeleton = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMantineTheme();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const containerClassName = `user-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <div className={containerClassName}>
      <Paper
        radius="md"
        p={isMobile ? 'sm' : 'lg'}
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(12px)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
          boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Skeleton height={isMobile ? 28 : 36} width="80%" mb="xs" />
              <Group gap="xs" mt={4} wrap="wrap">
                <Skeleton height={18} width={120} />
                <Skeleton height={18} width={18} />
                <Skeleton height={18} width={100} />
              </Group>
            </Box>
            <Group gap="xs">
              <Skeleton height={32} width={100} />
              <Skeleton height={32} width={100} />
            </Group>
          </Group>

          <Box mt="sm">
            <Skeleton height={18} width="100%" mb="sm" />
            <Skeleton height={18} width="95%" mb="sm" />
            <Skeleton height={18} width="90%" mb="sm" />
            <Skeleton height={18} width="85%" mb="sm" />
            <Skeleton height={18} width="92%" mb="sm" />
            <Skeleton height={18} width="88%" mb="sm" />
          </Box>

          <Group gap="xs" wrap="wrap">
            <Skeleton height={22} width={80} radius="xl" />
            <Skeleton height={22} width={100} radius="xl" />
            <Skeleton height={22} width={90} radius="xl" />
          </Group>
        </Stack>
      </Paper>
    </div>
  );
};

export default function ArticleDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentArticle: article, loading } = useSelector((state: RootState) => state.articles);
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    loading: reportLoading,
    success: reportSuccess,
    error: reportError,
  } = useSelector((state: RootState) => state.report);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMantineTheme();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isAuthor = user?._id === article?.authorId;

  const containerClassName = `user-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  const reportForm = useForm({
    initialValues: {
      reason: '',
      otherReason: '',
    },
    validate: {
      reason: (value, values) => {
        if (!value) return 'Please select a reason';
        if (value === 'Other (please specify)' && !values.otherReason.trim()) {
          return 'Please specify the reason';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchArticle(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (reportSuccess) {
      notifications.show({
        title: 'Success',
        message: 'Article reported successfully.',
        color: 'green',
      });
      if (id) {
        dispatch(setArticleReported(id));
      }
      setReportModalOpen(false);
      reportForm.reset();
      dispatch(clearReportState());
    }
    if (reportError) {
      notifications.show({
        title: 'Error',
        message: reportError,
        color: 'red',
      });
      dispatch(clearReportState());
    }
  }, [reportSuccess, reportError, dispatch, reportForm, id]);

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (!article) {
    return (
      <div className={containerClassName}>
      <Center h="100vh">
        <Paper
            radius="md"
            p="lg"
          style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
            boxShadow: isDark
                ? '0 2px 12px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
            <Text size="lg" c="dimmed">
            Article not found
          </Text>
        </Paper>
      </Center>
      </div>
    );
  }

  const components: Components = {
    img: ({ src, alt }) => (
      <Box style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            maxHeight: isMobile ? '300px' : '400px',
            objectFit: 'contain',
          }}
        />
      </Box>
    ),
    p: ({ children }) => (
      <Text size={isMobile ? 'sm' : 'md'} style={{ wordBreak: 'break-word' }}>
        {children}
      </Text>
    ),
    h1: ({ children }) => (
      <Title order={1} size={isMobile ? 'h2' : 'h1'} style={{ wordBreak: 'break-word' }}>
        {children}
      </Title>
    ),
    h2: ({ children }) => (
      <Title order={2} size={isMobile ? 'h3' : 'h2'} style={{ wordBreak: 'break-word' }}>
        {children}
      </Title>
    ),
    h3: ({ children }) => (
      <Title order={3} size={isMobile ? 'h4' : 'h3'} style={{ wordBreak: 'break-word' }}>
        {children}
      </Title>
    ),
    pre: ({ children }) => (
      <Box
        component="pre"
        style={{
          overflowX: 'auto',
          maxWidth: '100%',
          backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
          padding: theme.spacing.sm,
          borderRadius: theme.radius.md,
          fontSize: isMobile ? theme.fontSizes.sm : theme.fontSizes.md,
        }}
      >
        {children}
      </Box>
    ),
    code: ({ className, children }) => {
      // Inline code
      return (
        <Box
          component="code"
          style={{
            backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
            padding: '0.2em 0.4em',
            borderRadius: theme.radius.sm,
            fontSize: isMobile ? theme.fontSizes.sm : theme.fontSizes.md,
            fontFamily: 'monospace',
            color: isDark ? theme.colors.gray[0] : theme.colors.dark[7],
          }}
        >
          {children}
        </Box>
      );
    },
  };

  const handleReportSubmit = async () => {
    if (!id) return;

    const reason =
      reportForm.values.reason === 'Other (please specify)'
        ? reportForm.values.otherReason.trim()
        : reportForm.values.reason;

    dispatch(
      createReport({
        targetType: 'article',
        targetId: id,
        reason: reason,
      })
    );
  };

  const handleDeleteArticle = async () => {
    if (!id) return;
    
    try {
      await dispatch(deleteArticle(id)).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Article deleted successfully',
        color: 'green',
      });
      navigate('/articles');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete article',
        color: 'red',
      });
    }
  };

  return (
    <>
      <div className={containerClassName}>
        <Paper
          radius="md"
          p={isMobile ? 'sm' : 'lg'}
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(12px)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
            boxShadow: isDark
              ? '0 2px 12px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Title order={1} size={isMobile ? 'h2' : 'h1'} style={{ wordBreak: 'break-word' }}>
                  {article.title}
                </Title>
                <Group gap="xs" mt={4} wrap="wrap">
                  <Text size="sm" c="dimmed" fw={500}>
                    By {isAuthor ? article.author : (
                      <span
                        style={{ color: '#228be6', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => navigate(`/user/${article.authorId}`)}
                      >
                        {article.author}
                      </span>
                    )}
                  </Text>
                  <Text size="sm" c="dimmed">
                    •
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Box>

              <Group gap="xs">
                {isAuthor && (
                  <>
                    <Button
                      leftSection={<EditIcon width={14} />}
                      onClick={() => navigate(`/articles/${article._id}/edit`)}
                      size={isMobile ? 'xs' : 'sm'}
                    >
                      Edit Article
                    </Button>
                    <Button
                      leftSection={<TrashIcon width={14} />}
                      onClick={() => setDeleteModalOpen(true)}
                      size={isMobile ? 'xs' : 'sm'}
                      color="red"
                      variant="outline"
                    >
                      Delete Article
                    </Button>
                  </>
                )}
                {!isAuthor && !isAdmin && (
                  <Button
                    leftSection={<AlertTriangleIcon width={14} />}
                    onClick={() => setReportModalOpen(true)}
                    size={isMobile ? 'xs' : 'sm'}
                    variant="outline"
                    color="red"
                    disabled={article.isReported}
                  >
                    {article.isReported ? 'Report Submitted' : 'Report Article'}
                  </Button>
                )}
              </Group>
            </Group>

            <Box mt="sm" style={{ wordBreak: 'break-word' }}>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {article.content}
              </ReactMarkdown>
            </Box>

            <TagList 
              tags={article.tagNames.map(name => ({ name }))} 
              size="xs"
              maxVisible={10}
            />
          </Stack>
        </Paper>
      </div>

      <Modal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Article"
        centered
        zIndex={2000}
        styles={{
          content: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
          },
          header: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <form onSubmit={reportForm.onSubmit(handleReportSubmit)}>
          <Stack gap="sm">
            <Text size="sm" fw={500}>
              Reason for reporting
            </Text>
            <Radio.Group {...reportForm.getInputProps('reason')}>
              <Stack>
                <Radio value="Spam or misleading" label="Spam or misleading" />
                <Radio value="Offensive or abusive content" label="Offensive or abusive content" />
                <Radio value="Copyright Infringement" label="Copyright Infringement" />
                <Radio value="Misinformation" label="Misinformation" />
                <Radio value="Other (please specify)" label="Other (please specify)" />
              </Stack>
            </Radio.Group>

            {reportForm.values.reason === 'Other (please specify)' && (
              <Textarea
                label="Additional Comments"
                placeholder="Provide more details..."
                autosize
                minRows={2}
                {...reportForm.getInputProps('otherReason')}
              />
            )}

            {reportForm.errors.reason &&
              reportForm.isTouched('reason') && (
                <Text c="red" size="sm">
                  {reportForm.errors.reason}
                </Text>
              )}

            <Group justify="flex-end" mt="sm">
              <Button
                variant="default"
                onClick={() => setReportModalOpen(false)}
                disabled={reportLoading}
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" color="red" loading={reportLoading} size="sm">
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteArticle}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        confirmLabel="Delete"
        loading={loading}
      />
    </>
  );
}
