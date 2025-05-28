import React from 'react';

interface CurrentTimeMarkerProps {
  markerPosition: number;
  showArrow?: boolean;
}

export function CurrentTimeMarker({ markerPosition, showArrow = false }: CurrentTimeMarkerProps) {
  return (
    <>
      {/* Subtle vertical line */}
      <div
        className="absolute top-0 w-0.5 h-full bg-gradient-to-b from-amber-400 to-amber-600 opacity-60 z-10"
        style={{ left: `${markerPosition}%` }}
      />
      {/* Arrow indicator at top */}
      {showArrow && (
        <div
          className="absolute top-0 w-0 h-0 z-20"
          style={{
            left: `${markerPosition}%`,
            transform: 'translateX(-50%)',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '6px solid #f59e0b',
          }}
        />
      )}
    </>
  );
}
