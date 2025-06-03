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
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, isNotEmpty } from '@mantine/form';
import { IconPhotoPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
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
import TagSelector from './TagSelector';
import { notifications } from '@mantine/notifications';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface LogEditorFormProps {
  mode: 'create' | 'edit';
  logId?: string;
  onClose: () => void;
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
  initialValues,
}: LogEditorFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading: logLoading } = useSelector((state: RootState) => state.logs);
  const { loading: tagsLoading } = useSelector((state: RootState) => state.tags);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const cropperRef = useRef<any>(null);

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
      title: isNotEmpty('Log title cannot be empty'),
      content: isNotEmpty('Log content cannot be empty'),
      mediaFiles: (files) =>
        files && files.length > 4 ? 'You can upload up to 4 images/videos.' : null,
    },
  });

  useEffect(() => {
    dispatch(fetchTags());
    if (mode === 'edit' && logId) {
      dispatch(fetchLog(logId));
    }
    return () => {
      dispatch(clearCurrentLog());
    };
  }, [dispatch, mode, logId]);

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    
    // For the first image, open cropper
    if (files.length === 1) {
      setCurrentImage(files[0]);
      setCropperOpen(true);
    } else {
      // For multiple files, upload directly
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
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to upload images',
          color: 'red',
        });
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

      // Get the cropped canvas
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

      // Create a File object from the blob
      const croppedFile = new File([blob], currentImage.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Upload the cropped image
      const uploadedUrl = await dispatch(uploadImage(croppedFile)).unwrap();
      
      form.setFieldValue('mediaUrls', [...form.values.mediaUrls, uploadedUrl]);
      
      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Crop error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to upload image',
        color: 'red',
      });
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
        await dispatch(createLog({
          ...values,
        })).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Log created successfully',
          color: 'green',
        });
      } else if (mode === 'edit' && logId) {
        await dispatch(updateLog({
          id: logId,
          ...values,
        })).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Log updated successfully',
          color: 'green',
        });
      }
      onClose();
      navigate('/logs');
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to save log. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Title order={2}>{mode === 'create' ? 'Create New Log' : 'Edit Log'}</Title>

        <TextInput
          label="Title"
          placeholder="Log Title"
          withAsterisk
          {...form.getInputProps('title')}
        />

        <Textarea
          label="Details"
          placeholder="Write the details..."
          withAsterisk
          autosize
          minRows={4}
          {...form.getInputProps('content')}
        />

        <DateTimePicker
          label="Date and Time"
          placeholder="Pick date and time"
          valueFormat="DD MMM YYYY hh:mm A"
          size="md"
          clearable
          {...form.getInputProps('createdAt')}
        />

        <TagSelector
          value={form.values.tags}
          onChange={(tags) => form.setFieldValue('tags', tags)}
        />

        <FileInput
          label="Upload Media (Max 4 files)"
          placeholder="Pick files"
          leftSection={<IconPhotoPlus size={18} />}
          multiple
          accept="image/png,image/jpeg,image/gif,video/mp4,video/quicktime"
          onChange={(files) => {
            if (files) {
              handleImageUpload(Array.from(files));
            }
          }}
          disabled={uploadingImages || form.values.mediaUrls.length >= 4}
        />

        {form.values.mediaUrls.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Media Preview:
            </Text>
            <SimpleGrid cols={2} spacing="sm">
              {form.values.mediaUrls.map((url, index) => (
                <div key={url} style={{ position: 'relative' }}>
                  <Image
                    src={url}
                    alt={`Media ${index + 1}`}
                    height={200}
                    fit="cover"
                    radius="sm"
                  />
                  <ActionIcon
                    color="red"
                    variant="filled"
                    size="sm"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </div>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={logLoading || tagsLoading || uploadingImages}
            disabled={uploadingImages}
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </Group>
      </Stack>

      <Modal
        opened={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setCurrentImage(null);
        }}
        title="Crop Image"
        size="xl"
      >
        <Stack>
          {currentImage && (
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
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => {
              setCropperOpen(false);
              setCurrentImage(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCrop} loading={uploadingImages}>
              Crop & Upload
            </Button>
          </Group>
        </Stack>
      </Modal>
    </form>
  );
}
  