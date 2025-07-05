"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  className?: string;
}

// Intersection Observer for animations
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasIntersected(true);
        } else {
          setIsIntersecting(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return { ref, isIntersecting, hasIntersected };
}

// Smooth scroll hook
export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return { scrollToElement, scrollToTop };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0,
  });

  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.now();
    setMetrics((prev) => ({ ...prev, loadTime }));

    // Monitor FPS
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics((prev) => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Monitor memory usage (if available)
    const measureMemory = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 5000);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
}

// Animated element component
interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: string;
  delay?: number;
  className?: string;
  threshold?: number;
}

export function AnimatedElement({
  children,
  animation = "fade-in-up",
  delay = 0,
  className,
  threshold = 0.1,
}: AnimatedElementProps) {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        hasIntersected && `animate-${animation}`,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Virtual scroll container
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualScroll({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main performance optimizer component
export function PerformanceOptimizer({
  children,
  className,
}: PerformanceOptimizerProps) {
  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    // Optimize for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add("reduce-motion");
    }

    // Preload critical resources
    const preloadLinks = [
      { rel: "preload", href: "/api/auth/callback", as: "fetch" },
    ];

    preloadLinks.forEach(({ rel, href, as }) => {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (as) link.setAttribute("as", as);
      document.head.appendChild(link);
    });

    return () => {
      document.documentElement.style.scrollBehavior = "";
      document.documentElement.classList.remove("reduce-motion");
    };
  }, []);

  return <div className={className}>{children}</div>;
}
