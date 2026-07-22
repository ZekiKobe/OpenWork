/**
 * Smooth scroll utility function
 * @param elementId - The ID of the element to scroll to
 * @param offset - Optional offset from the top
 */
export const smoothScrollTo = (elementId: string, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return;
  }

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

/**
 * Scroll to top of the page with smooth animation
 */
export const scrollToTop = (behavior: 'smooth' | 'auto' = 'smooth'): void => {
  window.scrollTo({
    top: 0,
    behavior
  });
};

/**
 * Scroll to bottom of the page with smooth animation
 */
export const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth'): void => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior
  });
};

/**
 * Scroll to a specific position with smooth animation
 * @param position - The position to scroll to (in pixels from top)
 */
export const scrollToPosition = (position: number, behavior: 'smooth' | 'auto' = 'smooth'): void => {
  window.scrollTo({
    top: position,
    behavior
  });
};

/**
 * Initialize smooth scroll behavior globally
 */
export const initSmoothScroll = (): void => {
  if (typeof window !== 'undefined') {
    // Add smooth scroll behavior to html element
    document.documentElement.style.scrollBehavior = 'smooth';
  }
};

/**
 * Scroll reveal utility using Intersection Observer
 * @param element - The element to observe
 * @param callback - Callback function when element is in view
 * @param threshold - Visibility threshold (0-1)
 */
export const observeScrollReveal = (
  element: HTMLElement,
  callback: () => void,
  threshold: number = 0.1
): IntersectionObserver => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold,
      rootMargin: '0px 0px -100px 0px',
    }
  );

  observer.observe(element);
  return observer;
};