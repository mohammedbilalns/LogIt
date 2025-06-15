import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import React from 'react';
import { IconArticle } from '@tabler/icons-react';
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

  const renderArticleContent = (content: string, articleId: string) => (
    <Box mt={4}>
      <Box
        style={{
          maxHeight: `${MAX_VISIBLE_LINES * 1.5}em`,
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
            height: '2em',
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
        mt={4}
      >
        View Full Article
      </Button>
    </Box>
  );

  const renderArticleImage = () => {
    if (article.featured_image) {
      return (
        <Image
          src={article.featured_image}
          alt={article.title}
          w={isMobile ? 80 : 120}
          h={isMobile ? 80 : 100}
          fit="cover"
          radius="sm" // Reduced radius
          style={{
            boxShadow: isDark
              ? '0 2px 10px rgba(0,0,0,0.4)'
              : '0 2px 10px rgba(0,0,0,0.1)',
          }}
        />
      );
    }

    return (
      <Box
        w={isMobile ? 80 : 120}
        h={isMobile ? 80 : 100}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px', // Reduced from 8px
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ccc',
          backdropFilter: 'blur(10px)',
        }}
      >
        <IconArticle size={isMobile ? 24 : 32} color={isDark ? '#aaa' : '#555'} />
      </Box>
    );
  };

  const tags = article.tagNames.map((name) => ({ name }));

  return (
    <Paper
      radius="lg" // Reduced from xl
      p={isMobile ? 'sm' : 'md'}
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.5)'
          : '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/articles/${article._id}`)}
    >
      <Group align="flex-start" wrap="nowrap" gap={isMobile ? 'xs' : 'md'}>
        {renderArticleImage()}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fw={600}
            size={isMobile ? 'md' : 'lg'}
            style={{ wordBreak: 'break-word' }}
          >
            {article.title}
          </Text>
          <Group gap="xs" wrap="wrap">
            <Text size="sm" c="dimmed" fw={500}>
              By {article.author}
            </Text>
          </Group>
          {renderArticleContent(article.content, article._id)}
          <TagList tags={tags} />
          <Text size="xs" mt={4} c="dimmed">
            {new Date(article.createdAt).toLocaleDateString()}
          </Text>
        </Box>
      </Group>
    </Paper>
  );
}
