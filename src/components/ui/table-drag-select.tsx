'use client';

import React, {
  forwardRef,
  useRef,
  useState,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { TableCell } from './table';
import { cn } from '@/lib/utils';

class DOMVector {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly magnitudeX: number,
    readonly magnitudeY: number,
  ) {
    this.x = x;
    this.y = y;
    this.magnitudeX = magnitudeX;
    this.magnitudeY = magnitudeY;
  }

  getDiagonalLength(): number {
    return Math.sqrt(Math.pow(this.magnitudeX, 2) + Math.pow(this.magnitudeY, 2));
  }

  toDOMRect(): DOMRect {
    return new DOMRect(
      Math.min(this.x, this.x + this.magnitudeX),
      Math.min(this.y, this.y + this.magnitudeY),
      Math.abs(this.magnitudeX),
      Math.abs(this.magnitudeY),
    );
  }

  toTerminalPoint(): DOMPoint {
    return new DOMPoint(this.x + this.magnitudeX, this.y + this.magnitudeY);
  }

  add(vector: DOMVector): DOMVector {
    return new DOMVector(
      this.x + vector.x,
      this.y + vector.y,
      this.magnitudeX + vector.magnitudeX,
      this.magnitudeY + vector.magnitudeY,
    );
  }

  clamp(vector: DOMRect): DOMVector {
    return new DOMVector(
      this.x,
      this.y,
      Math.min(vector.width - this.x, this.magnitudeX),
      Math.min(vector.height - this.y, this.magnitudeY),
    );
  }
}

function intersect(rect1: DOMRect, rect2: DOMRect): boolean {
  if (rect1.right < rect2.left || rect2.right < rect1.left) return false;

  if (rect1.bottom < rect2.top || rect2.bottom < rect1.top) return false;

  return true;
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function shallowEqual(x: Record<string, boolean>, y: Record<string, boolean>) {
  return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every((key) => x[key] === y[key]);
}

const SelectedItemContext = createContext<Record<string, boolean>>({});
const DragStateContext = createContext<{
  isDragging: boolean;
  finalDragPosition: { x: number; y: number } | null;
}>({
  isDragging: false,
  finalDragPosition: null,
});

interface DragSelectProps {
  children?: ReactNode;
  onSelectedItemsChange: (selectedItems: string[]) => void;
}

export function DragSelectTableContainer({ children, onSelectedItemsChange }: DragSelectProps) {
  const {
    isDragging,
    selectionRect,
    selectedItems,
    containerRef,
    finalDragPosition,
    onScroll,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useDragSelect();

  const handlePointerUp: React.PointerEventHandler = useCallback(
    (...args) => {
      onPointerUp(...args);
      onSelectedItemsChange(
        Object.entries(selectedItems)
          .filter(([, val]) => val)
          .map(([key]) => key),
      );
    },
    [onPointerUp, onSelectedItemsChange, selectedItems],
  );

  const selectionRectangleStyle = useMemo(
    () => ({
      top: selectionRect?.y,
      left: selectionRect?.x,
      width: selectionRect?.width,
      height: selectionRect?.height,
    }),
    [selectionRect],
  );

  return (
    <div
      className="relative w-full overflow-auto"
      ref={containerRef}
      onScroll={onScroll}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={handlePointerUp}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <SelectedItemContext.Provider value={selectedItems}>
        <DragStateContext.Provider value={{ isDragging, finalDragPosition }}>{children}</DragStateContext.Provider>
      </SelectedItemContext.Provider>
      {selectionRect && isDragging && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 dark:border-blue-400 dark:bg-blue-400/20 pointer-events-none z-50"
          style={selectionRectangleStyle}
        />
      )}
    </div>
  );
}

export function useDragSelectItem(id: string) {
  const selectedItems = useContext(SelectedItemContext);
  const { isDragging } = useContext(DragStateContext);
  const isSelected = useMemo(() => selectedItems[id], [selectedItems, id]);

  return { isSelected, isDragging };
}

export function useDragSelectState() {
  return useContext(DragStateContext);
}

export const DragSelectTableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ id, ...props }, ref) => {
    const { isSelected, isDragging } = useDragSelectItem(id!);

    return (
      <TableCell
        {...props}
        data-item={id}
        className={cn(
          props.className,
          'transition-all duration-200 ease-in-out',
          isDragging && !isSelected && 'opacity-30',
          isSelected && 'bg-blue-50/50 dark:bg-blue-950/50 ring-1 ring-blue-200 dark:ring-blue-800',
        )}
        ref={ref}
      />
    );
  },
);

DragSelectTableCell.displayName = 'DragSelectTableCell';

export function useDragSelect() {
  const [isDragging, setIsDragging] = useState(false);
  const [finalDragPosition, setFinalDragPosition] = useState<{ x: number; y: number } | null>(null);

  const [dragVector, setDragVector] = useState<DOMVector | null>(null);
  const [scrollVector, setScrollVector] = useState<DOMVector | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSelectedItems = useCallback(
    (dragVector: DOMVector, scrollVector: DOMVector) => {
      if (containerRef.current == null) return;
      const next: Record<string, boolean> = {};
      const containerRect = containerRef.current.getBoundingClientRect();
      containerRef.current.querySelectorAll('[data-item]').forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (containerRef.current == null) return;

        const itemRect = el.getBoundingClientRect();
        const translatedItemRect = new DOMRect(
          itemRect.x - containerRect.x + containerRef.current.scrollLeft,
          itemRect.y - containerRect.y + containerRef.current.scrollTop,
          itemRect.width,
          itemRect.height,
        );

        if (!intersect(dragVector.add(scrollVector).toDOMRect(), translatedItemRect)) return;

        if (el.dataset.item && typeof el.dataset.item === 'string') {
          next[el.dataset.item] = true;
        }
      });
      if (!shallowEqual(next, selectedItems)) {
        setSelectedItems(next);
      }
    },
    [selectedItems],
  );

  useEffect(() => {
    if (!isDragging || containerRef.current == null) return;

    let handle = requestAnimationFrame(scrollTheLad);

    return () => cancelAnimationFrame(handle);

    function scrollTheLad() {
      if (containerRef.current == null || dragVector == null) return;

      const currentPointer = dragVector.toTerminalPoint();
      const containerRect = containerRef.current.getBoundingClientRect();

      const shouldScrollRight = containerRect.width - currentPointer.x < 20;
      const shouldScrollLeft = currentPointer.x < 20;
      const shouldScrollDown = containerRect.height - currentPointer.y < 20;
      const shouldScrollUp = currentPointer.y < 20;

      const left = shouldScrollRight
        ? clamp(20 - containerRect.width + currentPointer.x, 0, 20)
        : shouldScrollLeft
          ? -1 * clamp(20 - currentPointer.x, 0, 20)
          : undefined;

      const top = shouldScrollDown
        ? clamp(20 - containerRect.height + currentPointer.y, 0, 20)
        : shouldScrollUp
          ? -1 * clamp(20 - currentPointer.y, 0, 20)
          : undefined;

      if (top === undefined && left === undefined) {
        handle = requestAnimationFrame(scrollTheLad);
        return;
      }

      containerRef.current.scrollBy({
        left,
        top,
      });

      handle = requestAnimationFrame(scrollTheLad);
    }
  }, [isDragging, dragVector, updateSelectedItems]);

  const selectionRect = useMemo(
    () =>
      dragVector && scrollVector && containerRef.current
        ? dragVector
            .add(scrollVector)
            .clamp(new DOMRect(0, 0, containerRef.current.scrollWidth, containerRef.current.scrollHeight))
            .toDOMRect()
        : null,
    [dragVector, scrollVector],
  );

  const onScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (dragVector == null || scrollVector == null) return;

      const { scrollLeft, scrollTop } = e.currentTarget;

      const nextScrollVector = new DOMVector(
        scrollVector.x,
        scrollVector.y,
        scrollLeft - scrollVector.x,
        scrollTop - scrollVector.y,
      );

      setScrollVector(nextScrollVector);
      updateSelectedItems(dragVector, nextScrollVector);
    },
    [dragVector, scrollVector, updateSelectedItems],
  );

  const onPointerDown: React.PointerEventHandler = useCallback((e) => {
    if (e.button !== 0) return;
    // If drag is initiated in data-no-drag-select div, don't start dragging
    if (e.target instanceof HTMLElement && e.target.closest('[data-no-drag-select]')) return;

    // Only allow drag initiation when starting over a drag cell (element with data-item)
    if (!(e.target instanceof HTMLElement) || !e.target.closest('[data-item]')) return;

    // Clear previous selection when starting a new drag
    setSelectedItems({});
    setFinalDragPosition(null);

    const containerRect = e.currentTarget.getBoundingClientRect();
    setDragVector(new DOMVector(e.clientX - containerRect.x, e.clientY - containerRect.y, 0, 0));
    setScrollVector(new DOMVector(e.currentTarget.scrollLeft, e.currentTarget.scrollTop, 0, 0));

    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove: React.PointerEventHandler = useCallback(
    (e) => {
      if (dragVector == null || scrollVector == null) return;
      // If drag is initiated in data-no-drag-select div, don't start dragging
      if (e.target instanceof HTMLElement && e.target.closest('[data-no-drag-select]')) return;

      const containerRect = e.currentTarget.getBoundingClientRect();

      const nextDragVector = new DOMVector(
        dragVector.x,
        dragVector.y,
        e.clientX - containerRect.x - dragVector.x,
        e.clientY - containerRect.y - dragVector.y,
      );
      const selection = document.getSelection();
      const elementFromPoint = document.elementFromPoint(e.clientX, e.clientY);

      if (!isDragging && nextDragVector.getDiagonalLength() < 10) return;
      if (!selection?.isCollapsed && selection?.focusNode?.textContent === elementFromPoint?.textContent) {
        setDragVector(null);
        return;
      }

      setIsDragging(true);

      selection?.removeAllRanges();

      setDragVector(nextDragVector);
      updateSelectedItems(nextDragVector, scrollVector);
    },
    [dragVector, isDragging, scrollVector, updateSelectedItems],
  );

  const onPointerUp: React.PointerEventHandler = useCallback(
    (e) => {
      // If drag is initiated in data-no-drag-select div, don't start dragging
      if (e.target instanceof HTMLElement && e.target.closest('[data-no-drag-select]')) return;

      if (!isDragging) {
        setSelectedItems({});
        setDragVector(null);
        setScrollVector(null);
        setFinalDragPosition(null);
      } else {
        setFinalDragPosition({ x: e.clientX, y: e.clientY });
        setDragVector(null);
        setScrollVector(null);
        setIsDragging(false);
      }
    },
    [isDragging],
  );

  const onKeyDown: React.KeyboardEventHandler = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedItems({});
      setDragVector(null);
      setScrollVector(null);
      setIsDragging(false);
      setFinalDragPosition(null);
    }
  }, []);

  return {
    isDragging,
    selectionRect,
    selectedItems,
    containerRef,
    finalDragPosition,
    onKeyDown,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onScroll,
  };
}
