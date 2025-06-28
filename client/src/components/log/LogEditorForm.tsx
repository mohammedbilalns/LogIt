import { useEffect, useState, useRef } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Title,
  FileInput,
  Text,
  Image,
  SimpleGrid,
  ActionIcon,
  Modal,
  Box,
  Paper,
  useMantineColorScheme,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, isNotEmpty } from '@mantine/form';
import { PhotoPlus } from '../icons/PhotoPlus';
import { XIcon } from '../icons/XIcon';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createLog,
  updateLog,
  fetchLog,
  clearCurrentLog,
} from '@/store/slices/logSlice';
import { fetchTags } from '@/store/slices/tagSlice';
import { uploadImage } from '@/store/slices/uploadSlice';
import { AppDispatch, RootState } from '@/store';
import TagSelector from '@components/tags/TagSelector';
import { notifications } from '@mantine/notifications';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import UserSidebar from '@components/user/UserSidebar';
import axios from 'axios';

interface LogEditorFormProps {
  mode: 'create' | 'edit';
  logId?: string;
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
  initialValues?: {
    _id?: string;
    title: string;
    content: string;
    tags: string[];
    mediaUrls: string[];
    createdAt: Date | null;
  };
}

export default function LogEditorForm({
  mode,
  logId,
  onClose,
  onSubscriptionLimitError,
  initialValues,
}: LogEditorFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { loading: logLoading, currentLog, error: logError } = useSelector((state: RootState) => state.logs);
  const { loading: tagsLoading, error: tagError } = useSelector((state: RootState) => state.tags);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const cropperRef = useRef<ReactCropperElement | null>(null);

  const form = useForm({
    initialValues: {
      title: initialValues?.title || '',
      content: initialValues?.content || '',
      tags: initialValues?.tags || [],
      mediaFiles: null as File[] | null,
      mediaUrls: initialValues?.mediaUrls || [],
      createdAt: initialValues?.createdAt || new Date(),
    },
    validate: {
      title: (value) => {
        if (!value) {
          console.log("Title not found")
        }
        if (!value.trim()) {
          return "Title cannot be empty"
        }
        if (value.length > 50 || value.length < 5) {
          return "Title length must be between 5- 50 characters"
        }
      },
      content: isNotEmpty('Log content cannot be empty'),
      mediaFiles: (files) =>
        files && files.length > 4 ? 'You can upload up to 4 images/videos.' : null,
    },
  });

  // Fetch tags and log data
  useEffect(() => {
    dispatch(fetchTags({
      page: 1,
      limit: 10,
      search: '',
      promoted: undefined
    }));
    if (mode === 'edit' && logId) {
      dispatch(fetchLog(logId));
    }
    return () => {
      dispatch(clearCurrentLog());
    };
  }, [dispatch, mode, logId]);

  // Update form when currentLog changes
  useEffect(() => {
    if (mode === 'edit' && currentLog) {
      form.setValues({
        title: currentLog.title,
        content: currentLog.content,
        tags: currentLog.tags.map(tag => tag._id || tag.id),
        mediaUrls: currentLog.mediaUrls,
        createdAt: new Date(currentLog.createdAt),
      });
    }
  }, [currentLog, mode]);

  // Clear form error when form values change
  useEffect(() => {
    setFormError(null);
  }, [form.values]);

  // Clear form error when component unmounts
  useEffect(() => {
    return () => {
      setFormError(null);
    };
  }, []);

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }


    if (files.length === 1) {
      setCurrentImage(files[0]);
      setCropperOpen(true);
    } else {
      setUploadingImages(true);
      try {
        const uploadPromises = files.map(file => dispatch(uploadImage(file)).unwrap());
        const uploadedUrls = await Promise.all(uploadPromises);

        form.setFieldValue('mediaUrls', [...form.values.mediaUrls, ...uploadedUrls]);

        notifications.show({
          title: 'Success',
          message: 'Images uploaded successfully',
          color: 'green',
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          notifications.show({
            title: 'Error',
            message: error.response?.data?.message || error.message,
            color: 'red',
          });
        } else if (error instanceof Error) {
          notifications.show({
            title: 'Error',
            message: error.message,
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Error',
            message: 'Failed to upload images',
            color: 'red',
          });
        }
      } finally {
        setUploadingImages(false);
      }
    }
  };

  const handleCrop = async () => {
    if (!cropperRef.current || !currentImage) {
      return;
    }

    try {
      setUploadingImages(true);
      const cropper = cropperRef.current.cropper;

      if (!cropper) {
        throw new Error('Cropper not initialized');
      }

      const canvas = cropper.getCroppedCanvas({
        maxWidth: 1920,
        maxHeight: 1080,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (!canvas) {
        throw new Error('Failed to get cropped canvas');
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', 0.95);
      });

      const croppedFile = new File([blob], currentImage.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      const uploadedUrl = await dispatch(uploadImage(croppedFile)).unwrap();

      form.setFieldValue('mediaUrls', [...form.values.mediaUrls, uploadedUrl]);

      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green',
      });
    } catch (error: unknown) {
      console.error('Crop error:', error);
      if (axios.isAxiosError(error)) {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || error.message,
          color: 'red',
        });
      } else if (error instanceof Error) {
        notifications.show({
          title: 'Error',
          message: error.message,
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to upload image',
          color: 'red',
        });
      }
    } finally {
      setUploadingImages(false);
      setCropperOpen(false);
      setCurrentImage(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newMediaUrls = [...form.values.mediaUrls];
    newMediaUrls.splice(index, 1);
    form.setFieldValue('mediaUrls', newMediaUrls);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (mode === 'create') {
        const result = await dispatch(createLog({
          ...values,
        })).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Log created successfully',
          color: 'green',
        });
        onClose();
        navigate('/logs');
      } else if (mode === 'edit' && logId) {
        const result = await dispatch(updateLog({
          id: logId,
          ...values,
        })).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Log updated successfully',
          color: 'green',
        });
        onClose();
        navigate('/logs');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        const errorData = error.response?.data;

        if (errorData && errorData.currentPlan && errorData.exceededResource === 'logs') {
          if (onSubscriptionLimitError) {
            onSubscriptionLimitError({
              currentPlan: errorData.currentPlan,
              nextPlan: errorData.nextPlan,
              currentUsage: errorData.currentUsage,
              limit: errorData.limit,
              exceededResource: 'logs'
            });
          }
          return;
        }

        if (errorMessage) {
          notifications.show({
            title: 'Error',
            message: errorMessage,
            color: 'red',
          });
        }
      } else {
        const errorData = error as any;

        // Check if it's a subscription limit error
        if (errorData?.currentPlan && errorData?.exceededResource === 'logs') {
          if (onSubscriptionLimitError) {
            onSubscriptionLimitError({
              currentPlan: errorData.currentPlan,
              nextPlan: errorData.nextPlan,
              currentUsage: errorData.currentUsage,
              limit: errorData.limit,
              exceededResource: 'logs'
            });
          }
          return;
        }

        notifications.show({
          title: 'Error',
          message: errorData?.message || 'Failed to create log. Please try again.',
          color: 'red',
        });
      }
    }
  };

  return (
    <>
      <UserSidebar isModalOpen={cropperOpen} />
      <Paper
        radius="lg"
        p="xl"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.5)'
            : '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Title
              order={2}
              c={isDark ? 'white' : 'var(--mantine-color-dark-9)'}
            >
              {mode === 'create' ? 'Create New Log' : 'Edit Log'}
            </Title>

            <TextInput
              label="Title"
              placeholder="Log Title"
              withAsterisk
              {...form.getInputProps('title')}
              styles={{
                input: {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  '&:focus': {
                    borderColor: isDark ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-blue-5)',
                  },
                },
                label: {
                  color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
                }
              }}
            />

            <Textarea
              label="Details"
              placeholder="Write the details..."
              withAsterisk
              autosize
              minRows={4}
              {...form.getInputProps('content')}
              styles={{
                input: {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  '&:focus': {
                    borderColor: isDark ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-blue-5)',
                  },
                },
                label: {
                  color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
                }
              }}
            />

            <DateTimePicker
              label="Date and Time"
              placeholder="Pick date and time"
              valueFormat="DD MMM YYYY hh:mm A"
              size="md"
              clearable
              {...form.getInputProps('createdAt')}
              styles={{
                input: {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  '&:focus': {
                    borderColor: isDark ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-blue-5)',
                  },
                },
                label: {
                  color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
                }
              }}
            />

            <TagSelector
              value={form.values.tags}
              onChange={(tags) => {
                form.setFieldValue('tags', tags);
                // Clear tag error when tags are changed
                if (tagError) {
                  dispatch({ type: 'tags/clearError' });
                }
              }}
            />

            <FileInput
              label="Upload Media (Max 4 files)"
              placeholder="Pick files"
              leftSection={<PhotoPlus width={18} />}
              multiple
              accept="image/png,image/jpeg,image/gif,video/mp4,video/quicktime"
              onChange={(files) => {
                if (files) {
                  handleImageUpload(Array.from(files));
                }
              }}
              disabled={uploadingImages || form.values.mediaUrls.length >= 4}
              styles={{
                input: {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  '&:focus': {
                    borderColor: isDark ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-blue-5)',
                  },
                },
                label: {
                  color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
                }
              }}
            />

            {form.values.mediaUrls.length > 0 && (
              <Stack gap="xs">
                <Text size="sm" fw={500} c={isDark ? 'white' : 'var(--mantine-color-dark-9)'}>
                  Media Preview:
                </Text>
                <SimpleGrid cols={2} spacing="sm">
                  {form.values.mediaUrls.map((url, index) => (
                    <Box
                      key={url}
                      style={{
                        position: 'relative',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
                        backdropFilter: 'blur(8px)',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                        borderRadius: 'var(--mantine-radius-md)',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={url}
                        alt={`Media ${index + 1}`}
                        height={200}
                        fit="cover"
                      />
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="sm"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: isDark ? 'rgba(255,0,0,0.8)' : 'rgba(255,0,0,0.9)',
                          backdropFilter: 'blur(4px)',
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <XIcon width={14} />
                      </ActionIcon>
                    </Box>
                  ))}
                </SimpleGrid>
              </Stack>
            )}

            {(logError || tagError || formError) && (
              <Text
                c="red"
                size="sm"
                ta="center"
                style={{
                  padding: '0.5rem',
                  backgroundColor: isDark ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,0,0,0.2)'
                }}
              >
                {typeof logError === 'string' ? logError : (logError as any)?.message || ''}
                {typeof tagError === 'string' ? tagError : (tagError as any)?.message || ''}
                {formError}
              </Text>
            )}

            <Group justify="flex-end" mt="xl">
              <Button
                variant="light"
                onClick={onClose}
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
                type="submit"
                loading={logLoading || tagsLoading || uploadingImages}
                disabled={uploadingImages}
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
                {mode === 'create' ? 'Create' : 'Save'}
              </Button>
            </Group>
          </Stack>
        </form>

        <Modal
          opened={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setCurrentImage(null);
          }}
          title="Crop Image"
          size="xl"
          centered
          zIndex={2000}
          styles={{
            overlay: {
              zIndex: 2000,
              backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            },
            content: {
              zIndex: 2001,
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(16px)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
              boxShadow: isDark
                ? '0 4px 24px rgba(0,0,0,0.5)'
                : '0 4px 16px rgba(0,0,0,0.1)',
            },
            header: {
              backgroundColor: 'transparent',
              color: isDark ? 'white' : 'var(--mantine-color-dark-9)',
            }
          }}
        >
          <Stack>
            {currentImage && (
              <Box
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(8px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 'var(--mantine-radius-md)',
                  overflow: 'hidden',
                }}
              >
                <Cropper
                  ref={cropperRef}
                  src={URL.createObjectURL(currentImage)}
                  style={{ height: 400, width: '100%' }}
                  aspectRatio={16 / 9}
                  guides
                  viewMode={1}
                  autoCropArea={1}
                  background={false}
                  responsive
                  restore={false}
                />
              </Box>
            )}
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => {
                  setCropperOpen(false);
                  setCurrentImage(null);
                }}
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
                onClick={handleCrop}
                loading={uploadingImages}
                styles={{
                  root: {
                    backgroundColor: isDark ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-blue-6)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      backgroundColor: isDark ? 'var(--mantine-color-blue-8)' : 'var(--mantine-color-blue-7)',
                    },
                  }
                }}
              >
                Crop & Upload
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Paper>
    </>
  );
}
