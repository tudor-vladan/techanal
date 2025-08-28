// Performance Optimizations Library
// Optimizări de performanță reutilizabile pentru întreaga aplicație

import React, { useCallback, useMemo, useRef, useEffect, useState, lazy, Suspense } from 'react';

// Debounce hook pentru a limita frecvența apelurilor de funcții
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Throttle hook pentru a limita rata de execuție
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

// Virtualization helper pentru liste mari
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
      },
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    onScroll,
  };
}

// Memoization helper pentru obiecte complexe
export function useDeepMemo<T>(value: T, deps: any[]): T {
  const ref = useRef<{ value: T; deps: any[] } | undefined>(undefined);
  
  if (!ref.current || !shallowEqual(ref.current.deps, deps)) {
    ref.current = { value, deps };
  }
  
  return ref.current.value;
}

// Shallow comparison helper
function shallowEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Intersection Observer hook pentru lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { ref: setRef, isIntersecting };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current} in ${timeSinceLastRender.toFixed(2)}ms`);
    }
    
    lastRenderTime.current = now;
  });

  return { renderCount: renderCount.current };
}

// Bundle size optimization helper
export const lazyLoadComponent = (importFunc: () => Promise<any>, fallback?: React.ReactNode) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => {
    const FallbackComponent = fallback || (() => React.createElement('div', { 
      className: 'animate-pulse bg-gray-100 h-32 rounded-lg' 
    }));
    
    return React.createElement(Suspense, { 
      fallback: typeof FallbackComponent === 'function' ? FallbackComponent() : FallbackComponent 
    }, React.createElement(LazyComponent, props));
  };
};

// Memory leak prevention hook
export function useCleanupEffect(cleanup: () => void, deps: any[] = []) {
  useEffect(() => {
    return cleanup;
  }, deps);
}

// Optimized event handler with passive listeners
export function usePassiveEventHandler<T extends Event>(
  handler: (event: T) => void,
  options: AddEventListenerOptions = {}
) {
  return useCallback(
    (event: T) => {
      handler(event);
    },
    [handler]
  );
}

// Performance budget monitoring
export class PerformanceBudget {
  private static instance: PerformanceBudget;
  private budgets: Map<string, number> = new Map();
  private violations: Map<string, number[]> = new Map();

  static getInstance(): PerformanceBudget {
    if (!PerformanceBudget.instance) {
      PerformanceBudget.instance = new PerformanceBudget();
    }
    return PerformanceBudget.instance;
  }

  setBudget(metric: string, threshold: number) {
    this.budgets.set(metric, threshold);
  }

  recordMetric(metric: string, value: number) {
    const threshold = this.budgets.get(metric);
    if (threshold && value > threshold) {
      if (!this.violations.has(metric)) {
        this.violations.set(metric, []);
      }
      this.violations.get(metric)!.push(value);
      
      console.warn(`Performance budget exceeded: ${metric} = ${value}ms (threshold: ${threshold}ms)`);
    }
  }

  getViolations(metric: string): number[] {
    return this.violations.get(metric) || [];
  }

  reset() {
    this.violations.clear();
  }
}

export const performanceBudget = PerformanceBudget.getInstance();
