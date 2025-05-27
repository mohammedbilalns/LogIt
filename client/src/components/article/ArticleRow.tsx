import { Box, Button, Chip, Group, Image, Paper, Text, useMantineColorScheme } from '@mantine/core';
import { IconArticle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMediaQuery } from '@mantine/hooks';

const MAX_VISIBLE_LINES = 2;

interface ArticleRowProps {
  article: {
    _id: string;
    title: string;
    content: string;
    author: string;
    featured_image?: string;
    tagNames: string[];
    createdAt: string;
  };
}

export default function ArticleRow({ article }: ArticleRowProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const renderArticleContent = (content: string, articleId: string) => {
    return (
      <Box mt={4}>
        <Box style={{ 
          maxHeight: `${MAX_VISIBLE_LINES * 1.5}em`,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <ReactMarkdown 
            rehypePlugins={[rehypeRaw]} 
            remarkPlugins={[remarkGfm]}
            components={{
              img: () => null,
              p: ({ children }) => (
                <Text size="sm" lineClamp={MAX_VISIBLE_LINES} style={{ wordBreak: 'break-word' }}>{children}</Text>
              )
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
              height: '2em',
              background: isDark 
                ? 'linear-gradient(transparent, var(--mantine-color-dark-6))'
                : 'linear-gradient(transparent, white)',
              pointerEvents: 'none'
            }}
          />
        </Box>
        <Button 
          variant="subtle" 
          size="xs" 
          onClick={() => navigate(`/articles/${articleId}`)}
          mt={4}
        >
          View Full Article
        </Button>
      </Box>
    );
  };

  const renderArticleImage = (article: ArticleRowProps['article']) => {
    if (article.featured_image) {
      return (
        <Image 
          src={article.featured_image} 
          alt={article.title}
          w={isMobile ? 80 : 120} 
          h={isMobile ? 80 : 100} 
          fit="cover" 
          radius="md"
        />
      );
    }

    return (
      <Box
        w={isMobile ? 80 : 120}
        h={isMobile ? 80 : 100}
        bg={isDark ? "dark.5" : "gray.1"}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : '#eee'}`
        }}
      >
        <IconArticle size={isMobile ? 24 : 32} color={isDark ? "#999" : "#666"} />
      </Box>
    );
  };

  return (
    <Paper 
      shadow="sm" 
      radius="md" 
      p={isMobile ? "sm" : "md"} 
      withBorder
      style={{ 
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/articles/${article._id}`)}
    >
      <Group align="flex-start" wrap="nowrap" gap={isMobile ? "xs" : "md"}>
        {renderArticleImage(article)}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size={isMobile ? "md" : "lg"} style={{ wordBreak: 'break-word' }}>{article.title}</Text>
          <Group gap="xs" wrap="wrap">
            <Text size="sm" c="dimmed" fw={500}>By {article.author}</Text>
          </Group>
          {renderArticleContent(article.content, article._id)}
          <Group gap="xs" mt={6} style={{ flexWrap: 'wrap' }}>
            {article.tagNames.slice(0, isMobile ? 3 : 5).map(tag => (
              <Chip 
                key={tag} 
                size="xs" 
                checked 
                readOnly
                variant="light"
                color="blue"
              >
                {tag}
              </Chip>
            ))}
            {article.tagNames.length > (isMobile ? 3 : 5) && (
              <Chip 
                size="xs" 
                variant="light"
                color="blue"
                disabled
              >
                +{article.tagNames.length - (isMobile ? 3 : 5)} more
              </Chip>
            )}
          </Group>
          <Text size="xs" mt={4} c="dimmed">
            {new Date(article.createdAt).toLocaleDateString()}
          </Text>
        </Box>
      </Group>
    </Paper>
  );
} 