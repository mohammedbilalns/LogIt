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
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, isNotEmpty } from '@mantine/form';
import { IconPhotoPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => dispatch(uploadImage(file)).unwrap());
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Update form with new media URLs
      form.setFieldValue('mediaUrls', [...form.values.mediaUrls, ...uploadedUrls]);
      
      // Create preview URLs for new images
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
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
  };

  const handleRemoveImage = (index: number) => {
    const newMediaUrls = [...form.values.mediaUrls];
    newMediaUrls.splice(index, 1);
    form.setFieldValue('mediaUrls', newMediaUrls);
    
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
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

        {(form.values.mediaUrls.length > 0 || previewUrls.length > 0) && (
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
    </form>
  );
}
  