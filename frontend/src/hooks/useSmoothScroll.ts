import { useCallback } from 'react';
import { smoothScrollTo, scrollToTop, scrollToBottom, scrollToPosition } from '../utils/smoothScroll';

export const useSmoothScroll = () => {
  const scrollTo = useCallback((elementId: string, offset: number = 0) => {
    smoothScrollTo(elementId, offset);
  }, []);

  const toTop = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    scrollToTop(behavior);
  }, []);

  const toBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    scrollToBottom(behavior);
  }, []);

  const toPosition = useCallback((position: number, behavior: 'smooth' | 'auto' = 'smooth') => {
    scrollToPosition(position, behavior);
  }, []);

  return {
    scrollTo,
    toTop,
    toBottom,
    toPosition
  };
};