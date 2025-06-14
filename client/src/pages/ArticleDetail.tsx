import  { useEffect, useState } from 'react';
import { fetchArticle, deleteArticle, setArticleReported } from '@slices/articleSlice';
import { clearReportState, createReport } from '@slices/reportSlice';
import { IconAlertTriangle, IconEdit, IconTrash } from '@tabler/icons-react';
import ReactMarkdown, { Components } from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ConfirmModal } from '@/components/confirm';
import {
  Box,
  Button,
  Center,
  Chip,
  Group,
  Loader,
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

  // Check if the current user is an admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isAuthor = user?._id === article?.authorId;

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
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!article) {
    return (
      <Center h="100vh">
        <Text size="xl" c="dimmed">
          Article not found
        </Text>
      </Center>
    );
  }

  const renderCodeBlock = (language: string | undefined, code: React.ReactNode) => {
    const codeString = String(code);

    return (
      <Box style={{ position: 'relative' }}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: `${theme.spacing.md}px 0`,
            borderRadius: theme.radius.md,
            fontSize: isMobile ? theme.fontSizes.sm : theme.fontSizes.md,
            backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
            padding: theme.spacing.md,
            overflow: 'auto',
          }}
          showLineNumbers
          wrapLines
          wrapLongLines
          useInlineStyles
        >
          {codeString.replace(/\n$/, '')}
        </SyntaxHighlighter>
      </Box>
    );
  };

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
    pre: ({ children, className }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : undefined;

      return language ? (
        renderCodeBlock(language, children)
      ) : (
        <Box
          component="pre"
          style={{
            overflowX: 'auto',
            maxWidth: '100%',
            backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            fontSize: isMobile ? theme.fontSizes.sm : theme.fontSizes.md,
          }}
        >
          {children}
        </Box>
      );
    },
    code: ({ className, children }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : undefined;
      const isInline = !match;

      if (isInline) {
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
      }
      return renderCodeBlock(language, children);
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
      <Box
        style={{
          marginLeft: isMobile ? theme.spacing.md : isSidebarOpen ? '290px' : theme.spacing.md,
          marginRight: isMobile ? theme.spacing.md : theme.spacing.xl,
          paddingTop: '30px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Paper shadow="sm" radius="md" p={isMobile ? 'md' : 'xl'} withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Title order={1} size={isMobile ? 'h2' : 'h1'} style={{ wordBreak: 'break-word' }}>
                  {article.title}
                </Title>
                <Group gap="xs" mt={4} wrap="wrap">
                  <Text size="sm" c="dimmed" fw={500}>
                    By {article.author}
                  </Text>
                  <Text size="sm" c="dimmed">
                    •
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Box>

              <Group gap="sm">
                {isAuthor && (
                  <>
                    <Button
                      leftSection={<IconEdit size={16} />}
                      onClick={() => navigate(`/articles/${article._id}/edit`)}
                      size={isMobile ? 'sm' : 'md'}
                    >
                      Edit Article
                    </Button>
                    <Button
                      leftSection={<IconTrash size={16} />}
                      onClick={() => setDeleteModalOpen(true)}
                      size={isMobile ? 'sm' : 'md'}
                      color="red"
                      variant="outline"
                    >
                      Delete Article
                    </Button>
                  </>
                )}
                {!isAuthor && !isAdmin && (
                  <Button
                    leftSection={<IconAlertTriangle size={16} />}
                    onClick={() => setReportModalOpen(true)}
                    size={isMobile ? 'sm' : 'md'}
                    variant="outline"
                    color="red"
                    disabled={article.isReported}
                  >
                    {article.isReported ? 'Report Submitted' : 'Report Article'}
                  </Button>
                )}
              </Group>
            </Group>

            <Box mt="md" style={{ wordBreak: 'break-word' }}>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {article.content}
              </ReactMarkdown>
            </Box>

            <Group gap="xs" mt="xl" wrap="wrap">
              {article.tagNames.map((tag) => (
                <Chip key={tag} size="sm" checked readOnly variant="light" color="blue">
                  {tag}
                </Chip>
              ))}
            </Group>
          </Stack>
        </Paper>
      </Box>

      <Modal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Article"
        centered
        zIndex={2000}
      >
        <form onSubmit={reportForm.onSubmit(handleReportSubmit)}>
          <Stack gap="md">
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

            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={() => setReportModalOpen(false)}
                disabled={reportLoading}
              >
                Cancel
              </Button>
              <Button type="submit" color="red" loading={reportLoading}>
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
