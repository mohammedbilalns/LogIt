import { TextInput, PasswordInput, TextInputProps, PasswordInputProps } from '@mantine/core';

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      radius="md"
      size="md"
      withAsterisk
      {...props}
    />
  );
}

export function PasswordField(props: PasswordInputProps) {
  return (
    <PasswordInput
      radius="md"
      size="md"
      withAsterisk
      {...props}
    />
  );
} 