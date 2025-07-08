import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Textarea,
  Avatar,
  Box,
  Center,
  ActionIcon,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { PhotoIcon } from '../icons/PhotoIcon';
import { useState, useRef, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/infrastructure/store';
import { uploadImage } from '@/infrastructure/store/slices/uploadSlice';
import { notifications } from '@mantine/notifications';

interface UpdateProfileForm {
  name: string;
  profession: string;
  bio: string;
  profileImage: File | string | null;
}

interface UpdateProfileModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: UpdateProfileForm) => void;
}

export default function UpdateProfileModal({
  opened,
  onClose,
  onSubmit,
}: UpdateProfileModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);
  const { loading: uploadLoading } = useSelector((state: RootState) => state.upload);
  const { user } = useSelector((state: RootState) => state.auth);

  const form = useForm<UpdateProfileForm>({
    initialValues: {
      name: user?.name || '',
      profession: user?.profession || '',
      bio: user?.bio || '',
      profileImage: user?.profileImage || null,
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must not exceed 50 characters';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Name can only contain letters and spaces';
        return null;
      },
      profession: (value) => {
        if (value && value.trim().length > 100) return 'Profession must not exceed 100 characters';
        return null;
      },
      bio: (value) => {
        if (value && value.length > 500) return 'Bio must not exceed 500 characters';
        return null;
      },
      profileImage: (value) => {
        if (value && typeof value === 'string' && !value.startsWith('http')) {
          return 'Profile image must be a valid URL';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (user && opened) {
      form.setValues({
        name: user.name || '',
        profession: user.profession || '',
        bio: user.bio || '',
        profileImage: user.profileImage || null,
      });
      setPreviewUrl(user.profileImage || null);
    }
  }, [user, opened]);

  useEffect(() => {
    if (!opened) {
      setPreviewUrl(null);
      setShowCropper(false);
    }
  }, [opened]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        notifications.show({
          title: 'Error',
          message: 'Please select an image file',
          color: 'red',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        notifications.show({
          title: 'Error',
          message: 'Image size should be less than 5MB',
          color: 'red',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = async () => {
    if (cropperRef.current) {
      try {
        const canvas = cropperRef.current.cropper.getCroppedCanvas({
          maxWidth: 800,
          maxHeight: 800,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert canvas to blob'));
          }, 'image/jpeg', 0.9);
        });

        const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
        const uploadedUrl = await dispatch(uploadImage(file)).unwrap();
        form.setFieldValue('profileImage', uploadedUrl);
        setPreviewUrl(uploadedUrl);
        notifications.show({
          title: 'Success',
          message: 'Profile image uploaded successfully',
          color: 'green',
        });
      } catch (error: unknown) {
        notifications.show({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to upload image',
          color: 'red',
        });
      }
    }
    setShowCropper(false);
  };

  const handleSubmit = async (values: UpdateProfileForm) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (error: any) {
      // Handle backend validation errors (if they come as field errors)
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          form.setFieldError(key, backendErrors[key]);
        });
      } else if (typeof error === 'string') {
        // Handle string error messages from rejectWithValue
        notifications.show({
          title: 'Error',
          message: error,
          color: 'red',
        });
      } else if (error?.response?.data?.message) {
        // Handle Axios error objects (fallback)
        notifications.show({
          title: 'Error',
          message: error.response.data.message,
          color: 'red',
        });
      } else {
        // Fallback to generic error
        notifications.show({
          title: 'Error',
          message: 'Failed to update profile',
          color: 'red',
        });
      }
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0];
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Update Profile"
        centered
        size="md"
        overlayProps={{
          blur: 6,
          backgroundOpacity: 0.35,
          color: '#000',
          zIndex: 3000,
        }}
        zIndex={3100}
        styles={{
          content: {
            borderRadius: rem(16),
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)',
          },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Center>
              <Box pos="relative" style={{ cursor: 'pointer' }} onClick={handleAvatarClick}>
                <Avatar
                  src={
                    previewUrl ||
                    (typeof form.values.profileImage === 'string' ? form.values.profileImage : null)
                  }
                  size={150}
                  radius="xl"
                  mb="md"
                >
                  {getInitials(form.values.name)}
                </Avatar>
                <ActionIcon
                  variant="filled"
                  color="blue"
                  size="lg"
                  radius="xl"
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <PhotoIcon width={20} />
                </ActionIcon>
              </Box>
            </Center>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg"
              style={{ display: 'none' }}
            />

            <TextInput label="Name" placeholder="Enter your name" {...form.getInputProps('name')} />
            <TextInput
              label="Profession"
              placeholder="Enter your profession"
              {...form.getInputProps('profession')}
            />
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself"
              autosize
              minRows={3}
              maxRows={6}
              {...form.getInputProps('bio')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={uploadLoading}>
                Update Profile
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Cropper Modal */}
      <Modal
        opened={showCropper}
        onClose={() => setShowCropper(false)}
        title="Crop Image"
        size="lg"
        overlayProps={{
          blur: 6,
          backgroundOpacity: 0.35,
          color: '#000',
          zIndex: 3200,
        }}
        zIndex={3300}
        styles={{
          content: {
            borderRadius: rem(16),
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)',
          },
        }}
      >
        <Box style={{ height: 400 }}>
          <Cropper
            ref={cropperRef}
            src={previewUrl || ''}
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}
            guides
            viewMode={1}
            autoCropArea={1}
            background={false}
            responsive
            restore={false}
          />
        </Box>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setShowCropper(false)}>
            Cancel
          </Button>
          <Button onClick={handleCrop} loading={uploadLoading}>
            Crop & Upload
          </Button>
        </Group>
      </Modal>
    </>
  );
}
