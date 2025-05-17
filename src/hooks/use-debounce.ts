'use client';

import { useEffect, useRef, useCallback } from 'react';

type Timer = ReturnType<typeof setTimeout>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;
type DebouncedFunction<T extends AnyFunction> = (...args: Parameters<T>) => void;

/**
 * Hook to debounce a function call
 * @param fn Function to debounce
 * @param delay Delay in ms
 * @returns Debounced function
 */
export function useDebounce<T extends AnyFunction>(fn: T, delay: number): DebouncedFunction<T> {
  const timerRef = useRef<Timer | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay],
  );
}
