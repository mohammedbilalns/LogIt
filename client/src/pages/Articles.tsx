import { Box, Button, Group, Image, Stack, Text, Title, Select, Chip, Paper } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import CreateButton from '../components/CreateButton';

const mockArticles = [
  {
    id: 1,
    title: 'Why Your Laptop Overheats and How to Fix It?',
    author: 'Raj Mehra',
    role: 'Computer Technician',
    date: 'May 9, 2025',
    tags: ['Laptop', 'Overheat'],
    image: '/overheat.jpg',
    description:
      'Is your laptop feeling like a frying pan after just 20 minutes of use? Overheating is a common problem that can reduce performance, cause system crashes, or even damage your hardware over time.',
  },
  {
    id: 2,
    title: "Phone Battery Draining Fast? Here's What You Can Do",
    author: 'Raj Mehra',
    role: 'Computer Technician',
    date: 'May 9, 2025',
    tags: ['Phone', 'Battery'],
    image: '/battery.jpg',
    description:
      'Is your laptop feeling like a frying pan after just 20 minutes of use? Overheating is a common problem that can reduce performance, cause system crashes, or even damage your hardware over time.',
  },
];

export default function ArticlesPage() {
  const [sortBy, setSortBy] = useState('new');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(mockArticles.flatMap(article => article.tags)));

  const filteredArticles = mockArticles.filter(article =>
    selectedTags.length === 0 || article.tags.some(tag => selectedTags.includes(tag))
  );

  const handleCreate = () => {
    // Handle create article action
    console.log('Create article clicked');
  };

  return (
    <Box ml={290} mt={100} mr={30} pl="md">
      <Group justify="space-between" mb="md">
        <Title order={2}>Articles</Title>

        <Group>
          <Text fw={500}>Sort By:</Text>
          <Select
            data={[
              { value: 'new', label: 'New To Old' },
              { value: 'old', label: 'Old To New' },
            ]}
            value={sortBy}
            onChange={(val) => setSortBy(val!)}
            size="xs"
            radius="md"
          />
        </Group>
      </Group>

      {/* Tags filter */}
      <Group mb="md">
        <Text fw={500}>Tags:</Text>
        <Group gap="xs">
          {allTags.map((tag) => (
            <Chip
              key={tag}
              checked={selectedTags.includes(tag)}
              onChange={() =>
                setSelectedTags(prev =>
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )
              }
              size="sm"
            >
              {tag}
            </Chip>
          ))}
          <Button variant="default" size="xs" leftSection={<IconPlus size={14} />}>
            Add
          </Button>
        </Group>
      </Group>

      <Stack gap="md">
        {filteredArticles.map((article) => (
          <Paper 
            key={article.id} 
            shadow="sm" 
            radius="md" 
            p="md" 
            withBorder
            style={{ 
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Group align="flex-start" wrap="nowrap">
              <Image 
                src={article.image} 
                alt={article.title}
                w={120} 
                h={100} 
                fit="cover" 
                radius="md"
              />
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="lg">{article.title}</Text>
                <Group gap="xs">
                  <Text size="sm" fw={500}>{article.author}</Text>
                  <Text size="sm" c="dimmed">•</Text>
                  <Text size="sm" c="dimmed">{article.role}</Text>
                </Group>
                <Text size="sm" mt={4} lineClamp={2}>
                  {article.description}
                </Text>
                <Group gap="xs" mt={6}>
                  {article.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      size="xs" 
                      checked 
                      readOnly
                      variant="light"
                    >
                      {tag}
                    </Chip>
                  ))}
                </Group>
                <Text size="xs" mt={4} c="dimmed">
                  {article.date}
                </Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </Stack>

      <CreateButton onClick={handleCreate} />
    </Box>
  );
}
