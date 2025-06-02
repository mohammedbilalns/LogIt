import { Box, Button, Group, Stack, Text, Title, Chip, Paper, Loader, Center, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { fetchArticle } from '@slices/articleSlice';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { IconEdit } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ArticleDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentArticle: article, loading } = useSelector((state: RootState) => state.articles);
  const { user } = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMantineTheme();

  useEffect(() => {
    if (id) {
      dispatch(fetchArticle(id));
    }
  }, [dispatch, id]);

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
        <Text size="xl" c="dimmed">Article not found</Text>
      </Center>
    );
  }

  const isAuthor = user?._id === article.authorId;

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
            objectFit: 'contain'
          }} 
        />
      </Box>
    ),
    p: ({ children }) => (
      <Text size={isMobile ? "sm" : "md"} style={{ wordBreak: 'break-word' }}>{children}</Text>
    ),
    h1: ({ children }) => (
      <Title order={1} size={isMobile ? "h2" : "h1"} style={{ wordBreak: 'break-word' }}>{children}</Title>
    ),
    h2: ({ children }) => (
      <Title order={2} size={isMobile ? "h3" : "h2"} style={{ wordBreak: 'break-word' }}>{children}</Title>
    ),
    h3: ({ children }) => (
      <Title order={3} size={isMobile ? "h4" : "h3"} style={{ wordBreak: 'break-word' }}>{children}</Title>
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
    }
  };

  return (
    <Box 
      style={{
        marginLeft: isMobile ? theme.spacing.md : (isSidebarOpen ? '290px' : theme.spacing.md),
        marginRight: isMobile ? theme.spacing.md : theme.spacing.xl,
        paddingTop: '30px',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <Paper shadow="sm" radius="md" p={isMobile ? "md" : "xl"} withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Title order={1} size={isMobile ? "h2" : "h1"} style={{ wordBreak: 'break-word' }}>{article.title}</Title>
              <Group gap="xs" mt={4} wrap="wrap">
                <Text size="sm" c="dimmed" fw={500}>By {article.author}</Text>
                <Text size="sm" c="dimmed">•</Text>
                <Text size="sm" c="dimmed">
                  {new Date(article.createdAt).toLocaleDateString()}
                </Text>
              </Group>
            </Box>
            
            {isAuthor && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => navigate(`/articles/${article._id}/edit`)}
                size={isMobile ? "sm" : "md"}
              >
                Edit Article
              </Button>
            )}
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
            {article.tagNames.map(tag => (
              <Chip 
                key={tag} 
                size="sm" 
                checked 
                readOnly
                variant="light"
                color="blue"
              >
                {tag}
              </Chip>
            ))}
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
} 