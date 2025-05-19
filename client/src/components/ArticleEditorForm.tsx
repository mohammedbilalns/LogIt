import { useState, useEffect, useCallback } from 'react';
import { TextInput, Button, Box, Group, LoadingOverlay, Text } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { IconUpload } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createArticle, updateArticle, fetchArticle, clearCurrentArticle } from '../store/slices/articleSlice';
import { AppDispatch, RootState } from '../store';
import TagSelector from './TagSelector';
import { notifications } from '@mantine/notifications';

import '@mantine/tiptap/styles.css';

interface ArticleEditorFormProps {
  mode: 'create' | 'edit';
  articleId?: string;
  onClose: () => void;
}

interface FormErrors {
  title?: string;
  content?: string;
}

export default function ArticleEditorForm({ mode, articleId, onClose }: ArticleEditorFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentArticle, loading: articleLoading } = useSelector((state: RootState) => state.articles);
  const { loading: tagsLoading } = useSelector((state: RootState) => state.tags);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(undefined);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      })
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setEditorContent(content);
      validateContent(content);
    },
  });

  const validateTitle = useCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 5) {
      return 'Title must be at least 5 characters long';
    }
    if (trimmed.length > 25) {
      return 'Title must not exceed 25 characters';
    }
    return undefined;
  }, []);

  const validateContent = useCallback((_content: string) => {
    const textContent = editor?.getText().trim() || '';
    if (textContent.length < 50) {
      return 'Article content must be at least 50 characters long';
    }
    return undefined;
  }, [editor]);

  const validateForm = useCallback(() => {
    const titleError = validateTitle(title);
    const contentError = validateContent(editorContent);
    
    const newErrors: FormErrors = {};
    if (titleError) {
      newErrors.title = titleError;
    }
    if (contentError) {
      newErrors.content = contentError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, editorContent, validateTitle, validateContent]);

  useEffect(() => {
    return () => {
      void dispatch(clearCurrentArticle());
    };
  }, [dispatch]);

  useEffect(() => {
    if (mode === 'edit' && articleId) {
      dispatch(fetchArticle(articleId));
    } else if (mode === 'create') {
      setTitle('');
      setSelectedTags([]);
      setEditorContent('');
      setFeaturedImage(undefined);
      setHasUploadedImage(false);
      setErrors({});
      if (editor) {
        editor.commands.setContent('');
      }
    }
  }, [dispatch, mode, articleId, editor]);

  useEffect(() => {
    if (mode === 'edit' && currentArticle && editor) {
      setTitle(currentArticle.title);
      setSelectedTags(currentArticle.tags);
      setFeaturedImage(currentArticle.featured_image);
      editor.commands.setContent(currentArticle.content);
      setEditorContent(currentArticle.content);
    }
  }, [mode, currentArticle, editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) {
      return;
    }
    try {
      setIsUploading(true);
      
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(`Upload failed: ${data.error?.message || response.statusText}`);
      }

      if (!hasUploadedImage) {
        setFeaturedImage(data.secure_url);
        setHasUploadedImage(true);
      }

      editor.chain().focus().setImage({ src: data.secure_url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [editor, hasUploadedImage]);

  const handleSubmit = async () => {
    if (!editor || !validateForm()) {
      return;
    }

    const articleData = {
      title: title.trim(),
      content: editor.getHTML(),
      tagIds: selectedTags,
      featured_image: featuredImage,
    };

    try {
      if (mode === 'create') {
        await dispatch(createArticle(articleData)).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Article created successfully',
          color: 'green',
        });
      } else if (mode === 'edit' && articleId) {
        await dispatch(updateArticle({ id: articleId, articleData })).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Article updated successfully',
          color: 'green',
        });
      }
      onClose();
      navigate('/articles');
    } catch (error) {
      console.error('Failed to save article:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save article. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Box pos="relative" ml={290} mt={100} mr={30} pl="md">
      <LoadingOverlay visible={articleLoading || tagsLoading || isUploading} overlayProps={{ radius: "sm", blur: 2 }} />

      <Box mb="xl">
        <TextInput
          label="Title"
          placeholder="Enter article title"
          value={title}
          onChange={(e) => {
            const newValue = e.target.value;
            setTitle(newValue);
            const error = validateTitle(newValue);
            setErrors(prev => ({ ...prev, title: error }));
          }}
          error={errors.title}
          required
          size="lg"
        />
      </Box>

      <Box mb="xl">
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Code />
              <RichTextEditor.CodeBlock />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconUpload size={16} />}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  };
                  input.click();
                }}
              >
                Image
              </Button>
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content
            style={{ minHeight: '400px' }}
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (items) {
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    if (file) {
                      handleImageUpload(file);
                    }
                  }
                }
              }
            }}
          />
        </RichTextEditor>
        {errors.content && (
          <Text c="red" size="sm" mt={5}>
            {errors.content}
          </Text>
        )}
      </Box>

      <Box mb="xl">
        <TagSelector
          value={selectedTags}
          onChange={setSelectedTags}
        />
      </Box>

      <Group justify="flex-end" gap="md">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !editor?.getText().trim() || articleLoading || tagsLoading || isUploading}
        >
          {mode === 'create' ? 'Publish Article' : 'Update Article'}
        </Button>
      </Group>
    </Box>
  );
}
