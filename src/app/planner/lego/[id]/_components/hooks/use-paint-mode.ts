import { useState, useCallback, useRef, useEffect } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

export type PlannerMode = 'pointer' | 'paint' | 'erase' | 'inspect';

interface UsePaintModeProps {
  mode: PlannerMode;
  onPaintingFinished: (cellsToRepaint: string[], paintProjectId: string | null) => Promise<void>;
}

export function usePaintMode({ mode, onPaintingFinished }: UsePaintModeProps) {
  const [selectedProjectId, setSelectedProjectId] = useQueryState('paintProject', parseAsString);
  const [paintedCells, setPaintedCells] = useState<Set<string>>(new Set());
  const paintingRef = useRef(false);

  const handleProjectSelect = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
    },
    [setSelectedProjectId],
  );

  const canPaint = mode === 'paint' && !!selectedProjectId;
  const canErase = mode === 'erase';
  useEffect(() => {
    if (mode !== 'paint') {
      setSelectedProjectId(null);
    }
  }, [mode, setSelectedProjectId]);

  const startPainting = useCallback(() => {
    paintingRef.current = canPaint || canErase;
  }, [canErase, canPaint]);

  const paint = useCallback(
    (id: string) => {
      if (paintingRef.current && !paintedCells.has(id)) {
        paintedCells.add(id);
        setPaintedCells(new Set(paintedCells.values()));
      }
    },
    [paintedCells],
  );
  const stopPainting = useCallback(async () => {
    if (paintingRef.current) {
      paintingRef.current = false;
      await onPaintingFinished(Array.from(paintedCells), selectedProjectId);
      setPaintedCells(new Set());
    }
  }, [onPaintingFinished, paintedCells, selectedProjectId]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (paintingRef.current) {
        stopPainting();
      }
    };

    document.body.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.removeEventListener('mouseup', handleMouseUp);
    };
  }, [stopPainting]);

  return {
    mode: mode as PlannerMode,
    paintProjectId: selectedProjectId || undefined,
    paintedCells,
    handleProjectSelect,
    startPainting,
    paint,
    stopPainting,
  };
}
