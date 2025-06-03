import { Modal, TextInput, Button, Group, Stack, Textarea, Avatar, Box, Center, ActionIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPhoto } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { uploadImage } from '@/store/slices/uploadSlice';
import { notifications } from '@mantine/notifications';

interface UpdateProfileForm {
    name: string;
    email: string;
    profession: string;
    bio: string;
    profileImage: File | string | null;
}

interface UpdateProfileModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: UpdateProfileForm) => void;
    initialValues?: Partial<UpdateProfileForm>;
}

export default function UpdateProfileModal({ opened, onClose, onSubmit, initialValues }: UpdateProfileModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<any>(null);
    const { loading: uploadLoading } = useSelector((state: RootState) => state.upload);
    const { user } = useSelector((state: RootState) => state.auth);

    const form = useForm<UpdateProfileForm>({
        initialValues: {
            name: initialValues?.name || '',
            email: initialValues?.email || '',
            profession: initialValues?.profession || '',
            bio: initialValues?.bio || '',
            profileImage: initialValues?.profileImage || null,
        },
        validate: {
            name: (value) => (!value.trim() ? 'Name is required' : null),
            email: (value) => {
                if (!value.trim()) {
                    return 'Email is required';
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Invalid email format';
                }
                return null;
            },
            profession: (value) =>{
                if(!value.trim()){
                    return 'Profession is required'
                }
                if(value.trim().length >50 || value.trim().length <10){
                    return "Profession must be between 10 - 50 characters"
                }
            } , 
            bio: (value) => {
                if (value && value.length > 500) {
                    return 'Bio must be less than 500 characters';
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (user) {
            form.setValues({
                name: user.name || '',
                email: user.email || '',
                profession: user.profession || '',
                bio: user.bio || '',
                profileImage: user.profileImage || null,
            });
            setPreviewUrl(user.profileImage || null);
        }
    }, [user]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                notifications.show({
                    title: 'Error',
                    message: 'Please select an image file',
                    color: 'red'
                });
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                notifications.show({
                    title: 'Error',
                    message: 'Image size should be less than 5MB',
                    color: 'red'
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
                const cropperInstance = cropperRef.current.cropper;
                if (!cropperInstance) {
                    throw new Error('Cropper instance not found');
                }

                const canvas = cropperInstance.getCroppedCanvas({
                    maxWidth: 800,
                    maxHeight: 800,
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
                    }, 'image/jpeg', 0.9);
                });

                // Create file from blob
                const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });

                const uploadedUrl = await dispatch(uploadImage(file)).unwrap();
                form.setFieldValue('profileImage', uploadedUrl);
                setPreviewUrl(uploadedUrl);
                notifications.show({
                    title: 'Success',
                    message: 'Profile image uploaded successfully',
                    color: 'green'
                });
            } catch (error: any) {
                notifications.show({
                    title: 'Error',
                    message: error.message || 'Failed to upload image',
                    color: 'red'
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
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to update profile',
                color: 'red'
            });
        }
    };

    const getInitials = (name?: string) => {
        if (!name) {
            return '?';
        }
        const parts = name.split(' ');
        if (parts.length === 1) {
            return parts[0][0];
        }
        return parts[0][0] + parts[parts.length - 1][0];
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Modal 
            opened={opened} 
            onClose={onClose}
            title="Update Profile" 
            centered
            size="md"
            zIndex={2000}
            styles={{
                overlay: {
                    zIndex: 2000
                },
                content: {
                    zIndex: 2001
                }
            }}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Center>
                        <Box 
                            pos="relative" 
                            style={{ cursor: 'pointer' }} 
                            onClick={handleAvatarClick}
                        >
                            <Avatar
                                src={previewUrl || (typeof form.values.profileImage === 'string' ? form.values.profileImage : null)}
                                size={150}
                                radius="xl"
                                mb="md"
                            >
                                {getInitials(form.values.name)}
                            </Avatar>
                            <ActionIcon
                                className="edit-icon"
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
                                <IconPhoto size={20} />
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

                    {showCropper && (
                        <Modal
                            opened={showCropper}
                            onClose={() => setShowCropper(false)}
                            title="Crop Image"
                            size="lg"
                            zIndex={3000}
                            styles={{
                                overlay: {
                                    zIndex: 3000
                                },
                                content: {
                                    zIndex: 3001
                                }
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
                    )}

                    <TextInput
                        label="Name"
                        placeholder="Enter your name"
                        {...form.getInputProps('name')}
                    />
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        {...form.getInputProps('email')}
                    />
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
    );
}
