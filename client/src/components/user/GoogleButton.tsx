import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import React from 'react';
import { store } from '@/store';
import { googleAuth } from '@slices/authSlice';

interface GoogleButtonProps {
  style?: React.CSSProperties;
}

export function GoogleButton({ style }: GoogleButtonProps) {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      store.dispatch(googleAuth(credentialResponse.credential));
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <div style={style}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
        
      />
    </div>
  );
} 