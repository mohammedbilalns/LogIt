import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Text,
  useMantineColorScheme,
  Stack,
} from '@mantine/core';
import { ArticleIcon } from '@/presentation/components/icons/ArticleIcon';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMediaQuery } from '@mantine/hooks';
import TagList from '../tags/TagList';

const MAX_VISIBLE_LINES = 2;

interface ArticleRowProps {
  article: {
    _id: string;
    title: string;
    content: string;
    author: string;
    featured_image?: string | null;
    tagNames: string[];
    createdAt: string;
  };
}

export default function ArticleRow({ article }: ArticleRowProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const renderArticleContent = (content: string, articleId: string) => (
    <Box>
      <Box
        style={{
          maxHeight: `${MAX_VISIBLE_LINES * 1.4}em`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            img: () => null,
            p: ({ children }) => (
              <Text size="sm" lineClamp={MAX_VISIBLE_LINES} style={{ wordBreak: 'break-word' }}>
                {children}
              </Text>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1.5em',
            background: isDark
              ? 'linear-gradient(transparent, var(--mantine-color-dark-6))'
              : 'linear-gradient(transparent, white)',
            pointerEvents: 'none',
          }}
        />
      </Box>
      <Button
        variant="subtle"
        size="xs"
        onClick={() => navigate(`/articles/${articleId}`)}
        mt={2}
      >
        Read More
      </Button>
    </Box>
  );

  const renderArticleImage = () => {
    if (article.featured_image) {
      return (
        <Image
          src={article.featured_image}
          alt={article.title}
          w={isMobile ? 60 : 80}
          h={isMobile ? 60 : 80}
          fit="cover"
          radius="sm"
          style={{
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
      );
    }

    return (
      <Box
        w={isMobile ? 60 : 80}
        h={isMobile ? 60 : 80}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ccc',
          backdropFilter: 'blur(10px)',
        }}
      >
        <ArticleIcon width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} color={isDark ? '#aaa' : '#555'} />
      </Box>
    );
  };

  const tags = Array.isArray(article.tagNames) ? article.tagNames.map((name) => ({ name })) : [];

  return (
    <Paper
      radius="md"
      p="sm"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/articles/${article._id}`)}
    >
      <Group align="flex-start" wrap="nowrap" gap="sm">
        {renderArticleImage()}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Stack gap="xs">
          <Text
            fw={600}
              size={isMobile ? 'sm' : 'md'}
            style={{ wordBreak: 'break-word' }}
          >
            {article.title}
          </Text>
            
            <Group gap="xs" wrap="wrap" align="center">
              <Text size="xs" c="dimmed">
              By {article.author}
            </Text>
              <Text size="xs" c="dimmed">
            {new Date(article.createdAt).toLocaleDateString()}
          </Text>
            </Group>

            {renderArticleContent(article.content, article._id)}
            
            {tags.length > 0 && (
              <TagList tags={tags} />
            )}
          </Stack>
        </Box>
      </Group>
    </Paper>
  );
}
