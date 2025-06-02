export const getCursorStyle = (mode: 'pointer' | 'paint' | 'erase'): string => {
  switch (mode) {
    case 'paint':
      return 'cursor-crosshair';
    case 'erase':
      return 'cursor-not-allowed';
    case 'pointer':
    default:
      return 'cursor-default';
  }
};

// Custom CSS cursor for paint mode with paintbrush icon
export const getPaintCursorCSS = (isDark = false): string => {
  // Use theme-appropriate colors
  const strokeColor = isDark ? '#ffffff' : '#000000';
  const shadowColor = isDark ? '#000000' : '#ffffff';

  const paintbrushCursor = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Shadow for better visibility -->
      <g stroke="${shadowColor}" stroke-width="3" opacity="0.3">
        <path d="m14.622 17.897-10.68-2.913"/>
        <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/>
        <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/>
      </g>
      <!-- Main icon -->
      <g stroke="${strokeColor}" stroke-width="2">
        <path d="m14.622 17.897-10.68-2.913"/>
        <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/>
        <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/>
      </g>
    </svg>
  `)}`;

  return `url("${paintbrushCursor}") 12 12, crosshair`;
};

// Custom CSS cursor for erase mode
export const getEraseCursorCSS = (isDark = false): string => {
  // Use theme-appropriate colors
  const strokeColor = isDark ? '#ef4444' : '#dc2626'; // Red that works in both themes
  const shadowColor = isDark ? '#000000' : '#ffffff';

  const eraserCursor = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Shadow for better visibility -->
      <g stroke="${shadowColor}" stroke-width="3" opacity="0.3">
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
        <path d="M22 21H7"/>
        <path d="m5 11 9 9"/>
      </g>
      <!-- Main icon -->
      <g stroke="${strokeColor}" stroke-width="2">
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
        <path d="M22 21H7"/>
        <path d="m5 11 9 9"/>
      </g>
    </svg>
  `)}`;

  return `url("${eraserCursor}") 12 12, not-allowed`;
};

// Helper function to detect dark mode
export const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for dark class on html or body
  const htmlElement = document.documentElement;
  const bodyElement = document.body;

  return (
    htmlElement.classList.contains('dark') ||
    bodyElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
};

// Convenience functions that auto-detect theme
export const getThemeAwarePaintCursor = (): string => {
  return getPaintCursorCSS(isDarkMode());
};

export const getThemeAwareEraseCursor = (): string => {
  return getEraseCursorCSS(isDarkMode());
};
