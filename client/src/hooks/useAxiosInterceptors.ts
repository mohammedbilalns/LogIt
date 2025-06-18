import { useEffect, useRef } from 'react';
import { setupAxiosInterceptors } from '@/api/axios';
import { store } from '@/store';

export function useAxiosInterceptors() {
  useEffect(() => {
    setupAxiosInterceptors(store);
  }, []);
}
