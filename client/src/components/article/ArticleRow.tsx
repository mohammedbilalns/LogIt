import { Box, Button, Chip, Group, Image, Paper, Text } from '@mantine/core';
import { IconArticle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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
                <Text size="sm" lineClamp={MAX_VISIBLE_LINES}>{children}</Text>
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
              background: 'linear-gradient(transparent, white)',
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
          w={120} 
          h={100} 
          fit="cover" 
          radius="md"
        />
      );
    }

    return (
      <Box
        w={120}
        h={100}
        bg="gray.1"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #eee'
        }}
      >
        <IconArticle size={32} color="#666" />
      </Box>
    );
  };

  return (
    <Paper 
      shadow="sm" 
      radius="md" 
      p="md" 
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
      <Group align="flex-start" wrap="nowrap">
        {renderArticleImage(article)}
        <Box style={{ flex: 1 }}>
          <Text fw={600} size="lg">{article.title}</Text>
          <Group gap="xs">
            <Text size="sm" c="dimmed" fw={500}>By {article.author}</Text>
          </Group>
          {renderArticleContent(article.content, article._id)}
          <Group gap="xs" mt={6} style={{ flexWrap: 'wrap' }}>
            {article.tagNames.slice(0, 5).map(tag => (
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
            {article.tagNames.length > 5 && (
              <Chip 
                size="xs" 
                variant="light"
                color="blue"
                disabled
              >
                +{article.tagNames.length - 5} more
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