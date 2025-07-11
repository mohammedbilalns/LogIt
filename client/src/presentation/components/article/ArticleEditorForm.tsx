import { useState, useEffect, useCallback } from 'react';
import { TextInput, Button, Box, Group, Text, useMantineColorScheme, Loader, Center } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { UploadIcon } from '@/presentation/components/icons/UploadIcon';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createArticle, updateArticle, fetchArticle, clearCurrentArticle } from '@/infrastructure/store/slices/articleSlice';
import { fetchTags } from '@/infrastructure/store/slices/tagSlice';
import { uploadImage, clearUploadState } from '@/infrastructure/store/slices/uploadSlice';
import { AppDispatch, RootState } from '@/infrastructure/store';
import TagSelector from '@/presentation/components/tags/TagSelector';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
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
import type { CreateArticleResult, ArticleLimitExceededResponse } from '@/domain/usecases/article/createArticle';

interface ArticleEditorFormProps {
  mode: 'create' | 'edit';
  articleId?: string;
  onClose: () => void;
  onSubscriptionLimitError?: (error: {
    currentPlan: {
      id: string;
      name: string;
      price: number;
      maxLogsPerMonth: number;
      maxArticlesPerMonth: number;
      description: string;
    };
    nextPlan?: {
      id: string;
      name: string;
      price: number;
      maxLogsPerMonth: number;
      maxArticlesPerMonth: number;
      description: string;
    };
    currentUsage: number;
    limit: number;
    exceededResource: 'logs' | 'articles';
  }) => void;
}

interface FormErrors {
  title?: string;
  content?: string;
}

const lowlight = createLowlight();
lowlight.register({ ts, javascript, html, css, python, ruby, java, csharp, php, go, swift, kotlin });

export default function ArticleEditorForm({ mode, articleId, onClose, onSubscriptionLimitError }: ArticleEditorFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { currentArticle, loading: articleLoading, error: articleError } = useSelector((state: RootState) => state.articles);
  const { loading: tagsLoading, error: tagError } = useSelector((state: RootState) => state.tags);
  const { loading: isUploading, error: uploadError } = useSelector((state: RootState) => state.upload);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(undefined);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
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
      const tagIds = currentArticle.tags.map((tag: any) =>
        typeof tag === 'string' ? tag : (tag._id || tag.id)
      );
      setSelectedTags(tagIds);
      setFeaturedImage(currentArticle.featured_image ?? undefined);
      editor.commands.setContent(currentArticle.content);
      setEditorContent(currentArticle.content);
    }
  }, [mode, currentArticle, editor]);

  useEffect(() => {
    dispatch(fetchTags({
      page: 1,
      limit: 10,
      search: '',
      promoted: undefined
    }));
  }, [dispatch]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) {
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setUploadingImage(true);
    editor.chain().focus().setImage({ src: localUrl }).run();
    try {
      const imageUrl = await dispatch(uploadImage(file)).unwrap();
      if (!hasUploadedImage) {
        setFeaturedImage(imageUrl);
        setHasUploadedImage(true);
      }
      const html = editor.getHTML().replace(localUrl, imageUrl);
      editor.commands.setContent(html);
      const pos = editor.state.doc.content.size;
      editor.commands.focus(pos);
      editor.commands.enter();
      setPreviewImage(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: uploadError || 'Failed to upload image. Please try again.',
        color: 'red',
      });
      setPreviewImage(null);
    } finally {
      setUploadingImage(false);
      URL.revokeObjectURL(localUrl);
    }
  }, [editor, hasUploadedImage, dispatch, uploadError]);

  const handleSubmit = async () => {
    if (!editor || !validateForm()) {
      return;
    }

    const articleCreateData = {
      title: title.trim(),
      content: editor.getHTML(),
      tags: selectedTags,
      featured_image: featuredImage,
    };
    const articleUpdateData = {
      title: title.trim(),
      content: editor.getHTML(),
      tagIds: selectedTags,
      featured_image: featuredImage,
    };

    try {
      if (mode === 'create') {
        const result = await dispatch(createArticle(articleCreateData)).unwrap() as CreateArticleResult;
        if ('limitExceeded' in result && result.limitExceeded) {
          if (onSubscriptionLimitError) {
            onSubscriptionLimitError(result as ArticleLimitExceededResponse);
          }
          return;
        }
        notifications.show({
          title: 'Success',
          message: 'Article created successfully',
          color: 'green',
        });
      } else if (mode === 'edit' && articleId) {
        const result = await dispatch(updateArticle({ id: articleId, articleData: articleUpdateData })).unwrap();
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

      if (error?.currentPlan && error?.exceededResource === 'articles') {
        if (onSubscriptionLimitError) {
          onSubscriptionLimitError({
            currentPlan: error.currentPlan,
            nextPlan: error.nextPlan,
            currentUsage: error.currentUsage,
            limit: error.limit,
            exceededResource: 'articles'
          });
        }
        return; 
      }

      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to save article. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Box
      pos="relative"
      style={{
        width: '100%',
        zIndex: 0,
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(12px)',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        borderRadius: 'var(--mantine-radius-md)',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        padding: isMobile ? 'sm' : 'lg',
      }}
    >
      <Box mb="sm">
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
          size={isMobile ? "sm" : "md"}
          maxLength={150}
          styles={{
            input: {
              fontSize: isMobile ? '1rem' : '1.125rem',
              padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              '&:focus': {
                borderColor: isDark ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-blue-5)',
              },
            },
            label: {
              color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
              marginBottom: '0.25rem',
            }
          }}
        />
      </Box>

      <Box mb="sm" style={{ width: '100%', position: 'relative', zIndex: 0 }}>
        <RichTextEditor
          editor={editor}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
          }}
        >
          <RichTextEditor.Toolbar
            sticky
            stickyOffset={isMobile ? 60 : 80}
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              borderRadius: 'var(--mantine-radius-md)',
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.2)'
                : '0 2px 8px rgba(0,0,0,0.04)',
              width: '100%',
              position: 'sticky',
              top: isMobile ? '60px' : '62px',
              zIndex: 100,
              padding: '0.25rem',
            }}
          >
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
                leftSection={<UploadIcon width={14} height={14} />}
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
                styles={{
                  root: {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                    },
                  }
                }}
              >
                Image
              </Button>
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content
            style={{
              minHeight: isMobile ? '250px' : '400px',
              maxHeight: isMobile ? '350px' : '500px',
              overflow: 'auto',
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(8px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              borderRadius: 'var(--mantine-radius-md)',
              color: isDark ? 'var(--mantine-color-gray-0)' : 'inherit',
              padding: '1rem',
              width: '100%',
              position: 'relative',
              '& .ProseMirror': {
                minHeight: isMobile ? '250px' : '400px',
                maxHeight: 'none',
                '& > *:first-child': {
                  marginTop: 0,
                },
                '& > *:last-child': {
                  marginBottom: 0,
                },
                '& p': {
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  lineHeight: 1.6,
                  color: isDark ? 'var(--mantine-color-gray-0)' : 'inherit',
                  wordBreak: 'break-word',
                },
                '& h1, & h2, & h3, & h4': {
                  color: isDark ? 'var(--mantine-color-gray-0)' : 'inherit',
                  wordBreak: 'break-word',
                },
                '& h1': {
                  fontSize: isMobile ? '1.5rem' : '1.75rem',
                },
                '& h2': {
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                },
                '& h3': {
                  fontSize: isMobile ? '1.125rem' : '1.25rem',
                },
                '& blockquote': {
                  borderLeftColor: isDark ? 'var(--mantine-color-gray-6)' : 'var(--mantine-color-gray-4)',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                },
                '& code': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'var(--mantine-color-blue-3)' : 'var(--mantine-color-blue-7)',
                },
                '& pre': {
                  backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                },
                '& .ProseMirror img': {
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: isMobile ? '300px' : '400px',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  display: 'block',
                  margin: '0.75rem auto',
                },
              },
            }}
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
          >
            {editor && (
              <BubbleMenu editor={editor}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                </RichTextEditor.ControlsGroup>
              </BubbleMenu>
            )}
          </RichTextEditor.Content>
          {uploadingImage && previewImage && (
            <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: 'rgba(255,255,255,0.5)' }}>
              <Loader size="md" color="blue" />
            </Center>
          )}
        </RichTextEditor>
        {errors.content && (
          <Text c="red" size="sm" mt={4}>
            {errors.content}
          </Text>
        )}
      </Box>

      <Box mb="sm">
        <TagSelector
          value={selectedTags}
          onChange={setSelectedTags}
        />
      </Box>

      {(articleError || tagError || uploadError) && (
        <Text
          c="red"
          size="sm"
          ta="center"
          style={{
            padding: '0.5rem',
            backgroundColor: isDark ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)',
            borderRadius: '4px',
            border: '1px solid rgba(255,0,0,0.2)',
            marginBottom: '0.75rem'
          }}
        >
          {typeof articleError === 'string' ? articleError : (articleError as any)?.message || ''}
          {typeof tagError === 'string' ? tagError : (tagError as any)?.message || ''}
          {typeof uploadError === 'string' ? uploadError : (uploadError as any)?.message || ''}
        </Text>
      )}

      <Group justify="flex-end" gap="sm" wrap="wrap" mt="sm">
        <Button
          variant="light"
          onClick={onClose}
          size={isMobile ? "xs" : "sm"}
          styles={{
            root: {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
              },
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !editor?.getText().trim() || articleLoading || tagsLoading}
          size={isMobile ? "xs" : "sm"}
          loading={articleLoading || tagsLoading}
          loaderProps={{ size: 'sm', color: 'white' }}
          styles={{
            root: {
              backgroundColor: isDark ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-blue-6)',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                backgroundColor: isDark ? 'var(--mantine-color-blue-8)' : 'var(--mantine-color-blue-7)',
              },
              '&:disabled': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }
            }
          }}
        >
          {mode === 'create' ? 'Publish Article' : 'Update Article'}
        </Button>
      </Group>
    </Box>
  );
}
