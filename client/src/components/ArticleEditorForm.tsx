import { useState, useEffect, useCallback } from 'react';
import { TextInput, Button, Box, Group, LoadingOverlay, Text } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { IconUpload } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createArticle, updateArticle, fetchArticle, clearCurrentArticle } from '../store/slices/articleSlice';
import { fetchTags } from '../store/slices/tagSlice';
import { uploadImage, clearUploadState } from '../store/slices/uploadSlice';
import { AppDispatch, RootState } from '../store';
import TagSelector from './TagSelector';
import { notifications } from '@mantine/notifications';
import ts from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import go from 'highlight.js/lib/languages/go';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';

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

const lowlight = createLowlight();
lowlight.register({ts, javascript, html, css, python, ruby, java, csharp, php, go, swift, kotlin});

export default function ArticleEditorForm({ mode, articleId, onClose }: ArticleEditorFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentArticle, loading: articleLoading } = useSelector((state: RootState) => state.articles);
  const { loading: tagsLoading } = useSelector((state: RootState) => state.tags);
  const { loading: isUploading, error: uploadError } = useSelector((state: RootState) => state.upload);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(undefined);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({codeBlock: false}),
      Image,
      CodeBlockLowlight.configure({ lowlight }),
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
    if (trimmed.length > 150) {
      return 'Title must not exceed 150 characters';
    }
    return undefined;
  }, []);

  const validateContent = useCallback((_content: string) => {
    const textContent = editor?.getText().trim() || '';
    if (textContent.length < 50) {
      return 'Article content must be at least 50 characters long';
    }
    if (textContent.length > 50000) {
      return 'Article content must not exceed 50,000 characters';
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
      void dispatch(clearUploadState());
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

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) {
      return;
    }
    try {
      const imageUrl = await dispatch(uploadImage(file)).unwrap();
      
      if (!hasUploadedImage) {
        setFeaturedImage(imageUrl);
        setHasUploadedImage(true);
      }

      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
      notifications.show({
        title: 'Error',
        message: uploadError || 'Failed to upload image. Please try again.',
        color: 'red',
      });
    }
  }, [editor, hasUploadedImage, dispatch, uploadError]);

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
        const result = await dispatch(updateArticle({ id: articleId, articleData })).unwrap();
        console.log('Update result:', result);
        notifications.show({
          title: 'Success',
          message: 'Article updated successfully',
          color: 'green',
        });
      }
      onClose();
      navigate('/articles');
    } catch (error: any) {
      console.error('Failed to save article:', error);

      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to save article. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Box pos="relative" ml={290} mt={100} mb={5} mr={30} pl="md">
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
          maxLength={150}
        />
      </Box>

      <Box mb="xl">
        <RichTextEditor editor={editor}>
          
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              { editor && ( <BubbleMenu editor={editor}>
                <RichTextEditor.ControlsGroup>

              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              </RichTextEditor.ControlsGroup>

             </BubbleMenu>
              )}
                 <RichTextEditor.Strikethrough />
                 <RichTextEditor.ClearFormatting />
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
            style={{ minHeight: '400px', maxHeight: '800px', overflowY: 'auto' }}
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
