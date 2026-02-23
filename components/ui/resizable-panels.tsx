'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ResizablePanelGroupProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  className?: string;
}

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

interface ResizableHandleProps {
  className?: string;
  onDragStart?: () => void;
}

export const ResizablePanelGroup: React.FC<ResizablePanelGroupProps> = ({
  children,
  direction,
  className = '',
}) => {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} h-full w-full overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultSize = 50,
  className = '',
}) => {
  const [size, setSize] = useState(defaultSize);

  return (
    <div
      style={{ flex: `0 0 ${size}%` }}
      className={`overflow-auto ${className}`}
    >
      {children}
    </div>
  );
};

export const ResizableHandle: React.FC<ResizableHandleProps> = ({
  className = '',
}) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div
      ref={handleRef}
      className={`group w-1 hover:w-1.5 bg-border hover:bg-primary transition-all duration-200 cursor-col-resize select-none ${className}`}
      onMouseDown={() => setIsDragging(true)}
    />
  );
};
