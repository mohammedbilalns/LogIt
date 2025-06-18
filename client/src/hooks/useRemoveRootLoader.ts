import { useEffect } from 'react';

export function useRemoveRootLoader(shouldRemove: boolean) {
  useEffect(() => {
    if (shouldRemove) {
      const rootLoader = document.getElementById('root-loader');
      rootLoader?.remove();
    }
  }, [shouldRemove]);
}
