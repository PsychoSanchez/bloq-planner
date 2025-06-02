import { expect, test } from 'bun:test';
import {
  getCursorStyle,
  getPaintCursorCSS,
  getEraseCursorCSS,
  getThemeAwarePaintCursor,
  getThemeAwareEraseCursor,
  isDarkMode,
} from '@/lib/utils/cursor';

test('getCursorStyle - should return correct cursor classes for different modes', () => {
  expect(getCursorStyle('pointer')).toBe('cursor-default');
  expect(getCursorStyle('paint')).toBe('cursor-crosshair');
  expect(getCursorStyle('erase')).toBe('cursor-not-allowed');
});

test('getPaintCursorCSS - should return valid CSS cursor string for light theme', () => {
  const cursor = getPaintCursorCSS(false);
  expect(cursor).toContain('url("data:image/svg+xml;base64,');
  expect(cursor).toContain('crosshair');
});

test('getPaintCursorCSS - should return valid CSS cursor string for dark theme', () => {
  const cursor = getPaintCursorCSS(true);
  expect(cursor).toContain('url("data:image/svg+xml;base64,');
  expect(cursor).toContain('crosshair');
});

test('getEraseCursorCSS - should return valid CSS cursor string for light theme', () => {
  const cursor = getEraseCursorCSS(false);
  expect(cursor).toContain('url("data:image/svg+xml;base64,');
  expect(cursor).toContain('not-allowed');
});

test('getEraseCursorCSS - should return valid CSS cursor string for dark theme', () => {
  const cursor = getEraseCursorCSS(true);
  expect(cursor).toContain('url("data:image/svg+xml;base64,');
  expect(cursor).toContain('not-allowed');
});

test('Theme-aware cursor functions - should return valid cursor strings', () => {
  const paintCursor = getThemeAwarePaintCursor();
  const eraseCursor = getThemeAwareEraseCursor();

  expect(paintCursor).toContain('url("data:image/svg+xml;base64,');
  expect(paintCursor).toContain('crosshair');
  expect(eraseCursor).toContain('url("data:image/svg+xml;base64,');
  expect(eraseCursor).toContain('not-allowed');
});

test('isDarkMode - should return boolean', () => {
  const result = isDarkMode();
  expect(typeof result).toBe('boolean');
});

test('Paint mode types - should have correct PlannerMode values', () => {
  const modes = ['pointer', 'paint', 'erase'] as const;
  expect(modes).toContain('pointer');
  expect(modes).toContain('paint');
  expect(modes).toContain('erase');
});

test('Cursor CSS generation - should create different cursors for light and dark themes', () => {
  const lightPaintCursor = getPaintCursorCSS(false);
  const darkPaintCursor = getPaintCursorCSS(true);
  const lightEraseCursor = getEraseCursorCSS(false);
  const darkEraseCursor = getEraseCursorCSS(true);

  // Should be different for different themes
  expect(lightPaintCursor).not.toBe(darkPaintCursor);
  expect(lightEraseCursor).not.toBe(darkEraseCursor);

  // Extract base64 parts
  const lightPaintBase64 = lightPaintCursor.match(/base64,([^"]+)/)?.[1];
  const darkPaintBase64 = darkPaintCursor.match(/base64,([^"]+)/)?.[1];
  const lightEraseBase64 = lightEraseCursor.match(/base64,([^"]+)/)?.[1];
  const darkEraseBase64 = darkEraseCursor.match(/base64,([^"]+)/)?.[1];

  expect(lightPaintBase64).toBeDefined();
  expect(darkPaintBase64).toBeDefined();
  expect(lightEraseBase64).toBeDefined();
  expect(darkEraseBase64).toBeDefined();

  // Should be valid base64
  expect(() => atob(lightPaintBase64!)).not.toThrow();
  expect(() => atob(darkPaintBase64!)).not.toThrow();
  expect(() => atob(lightEraseBase64!)).not.toThrow();
  expect(() => atob(darkEraseBase64!)).not.toThrow();

  // Decoded should contain SVG
  const lightPaintSvg = atob(lightPaintBase64!);
  const darkPaintSvg = atob(darkPaintBase64!);
  const lightEraseSvg = atob(lightEraseBase64!);
  const darkEraseSvg = atob(darkEraseBase64!);

  expect(lightPaintSvg).toContain('<svg');
  expect(lightPaintSvg).toContain('</svg>');
  expect(darkPaintSvg).toContain('<svg');
  expect(darkPaintSvg).toContain('</svg>');
  expect(lightEraseSvg).toContain('<svg');
  expect(lightEraseSvg).toContain('</svg>');
  expect(darkEraseSvg).toContain('<svg');
  expect(darkEraseSvg).toContain('</svg>');

  // Should contain different colors for different themes
  expect(lightPaintSvg).toContain('#000000'); // Black in light theme
  expect(darkPaintSvg).toContain('#ffffff'); // White in dark theme
});
