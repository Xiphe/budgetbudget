import React, { useState, useEffect, useMemo } from 'react';

export default function ScrollBarWidthProvider({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [elm, setElm] = useState<HTMLDivElement | null>(null);
  const [scrollBarStyles, setScrollBarStyles] = useState({});
  const observer = useMemo(
    () =>
      new ResizeObserver(([{ target }]) => {
        requestAnimationFrame(() => {
          const { width, height } = target.getBoundingClientRect();

          setScrollBarStyles({
            '--scrollbar-x': `${200 - width}px`,
            '--scrollbar-y': `${200 - height}px`,
          });
        });
      }),
    [setScrollBarStyles],
  );
  useEffect(() => {
    if (elm === null) {
      return;
    }

    observer.observe(elm);

    return () => {
      observer.unobserve(elm);
    };
  }, [elm, observer]);
  return (
    <div {...props} style={{ ...style, ...scrollBarStyles }}>
      <div style={{ width: 0, height: 0, overflow: 'hidden' }}>
        <div style={{ width: '200px', height: '200px', overflow: 'scroll' }}>
          <div style={{ width: '100%', height: '100%' }} ref={setElm} />
        </div>
      </div>
      {children}
    </div>
  );
}
