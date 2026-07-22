import { useEffect } from 'react';

export const DEFAULT_PAGE_TITLE = 'OpenWork';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | OpenWork` : DEFAULT_PAGE_TITLE;
    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title]);
}
