import { useEffect, useRef } from 'react';
import { setupAxiosInterceptors } from '@/infrastructure/api/axios';
import { store } from '@/infrastructure/store';

export function useAxiosInterceptors() {
  useEffect(() => {
    setupAxiosInterceptors(store);
  }, []);
}
