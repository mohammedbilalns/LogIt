import { Modal, TextInput, Button, Group, Stack, Textarea, Avatar, Box, ActionIcon, Overlay, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import {  IconCamera } from '@tabler/icons-react';
import { useState, useRef } from 'react';

interface UpdateProfileForm {
    name: string;
    email: string;
    profession: string;
    bio: string;
    profileImage: File | null;
}

interface UpdateProfileModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: UpdateProfileForm) => void;
    initialValues?: Partial<UpdateProfileForm>;
}

export default function UpdateProfileModal({ opened, onClose, onSubmit, initialValues }: UpdateProfileModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<UpdateProfileForm>({
        initialValues: {
            name: initialValues?.name || '',
            email: initialValues?.email || '',
            profession: initialValues?.profession || '',
            bio: initialValues?.bio || '',
            profileImage: null,
        },
        validate: {
            name: (value) => (!value ? 'Name is required' : null),
            email: (value) => {
                if (!value) {
                    return 'Email is required';
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Invalid email format';
                }
                return null;
            },
            profession: (value) => (!value ? 'Profession is required' : null),
            bio: (value) => {
                if (value && value.length > 500) {
                    return 'Bio must be less than 500 characters';
                }
                return null;
            },
        },
    });

    const handleSubmit = (values: UpdateProfileForm) => {
        onSubmit(values);
        form.reset();
        setPreviewUrl(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        form.setFieldValue('profileImage', file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0][0];
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
                        <Box pos="relative" style={{ cursor: 'pointer' }} onClick={handleAvatarClick}>
                            <Avatar
                                src={previewUrl || (typeof initialValues?.profileImage === 'string' ? initialValues.profileImage : null)}
                                size={150}
                                radius="xl"
                                mb="md"
                            >
                                {getInitials(form.values.name)}
                            </Avatar>
                            <Overlay
                                color="#000"
                                backgroundOpacity={0.35}
                                blur={1}
                                radius="xl"
                                style={{ width: '100%', height: '100%', position: 'absolute', top: 0 }}
                            >
                                <Box 
                                    style={{ 
                                        position: 'absolute', 
                                        bottom: 0, 
                                        left: 0, 
                                        right: 0,
                                        padding: '8px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                                    }}
                                >
                                    <ActionIcon
                                        variant="filled"
                                        color="blue"
                                        size="lg"
                                        radius="xl"
                                    >
                                        <IconCamera size={20} />
                                    </ActionIcon>
                                </Box>
                            </Overlay>
                        </Box>
                    </Center>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png,image/jpeg,image/jpg"
                        style={{ display: 'none' }}
                    />

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
                        <Button type="submit">
                            Update Profile
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
