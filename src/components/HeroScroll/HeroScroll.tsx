import React, { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import "./hero-scroll.scss";

export type HeroScrollLayer = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  backgroundColor?: string;
  align?: "left" | "center" | "right";
};

export type HeroScrollProps = React.HTMLAttributes<HTMLElement> & {
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  backgroundColor?: string;
  layers: HeroScrollLayer[];
  layerHeightVh?: number;
  scrollEffort?: number;
  layerGap?: number;
  /** Extra scroll depth (in `layerHeightVh` units) after the layer timeline; the sticky panel fades out so nothing is visible. */
  exitBlankEffort?: number;
  /** When true, scroll advances in discrete steps per layer while the sticky hero is active. */
  snapSections?: boolean;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const HeroScroll: React.FC<HeroScrollProps> = ({
  title,
  subtitle,
  backgroundImageUrl,
  backgroundColor = "#05070b",
  layers,
  layerHeightVh = 100,
  scrollEffort = 3.1,
  layerGap = 0.75,
  exitBlankEffort = 1.35,
  snapSections = true,
  className,
  style,
  ...props
}) => {
  const rootRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const safeLayers = useMemo(() => layers.slice(0, Math.max(1, layers.length)), [layers]);
  const snapLockUntilRef = useRef(0);

  const { spacingFactor, totalUnits, contentFraction } = useMemo(() => {
    const effortVal = Math.max(1, scrollEffort);
    const gapVal = Math.max(0, layerGap);
    const spacing = 1 + gapVal;
    const layerUnits = safeLayers.length * effortVal * spacing;
    const blankUnits = Math.max(0.05, exitBlankEffort);
    const units = Math.max(2, layerUnits + blankUnits);
    return {
      spacingFactor: spacing,
      totalUnits: units,
      contentFraction: layerUnits / units,
    };
  }, [scrollEffort, layerGap, exitBlankEffort, safeLayers.length]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) {
      return;
    }

    let animationFrame = 0;

    const updateProgress = () => {
      const rect = element.getBoundingClientRect();
      const totalScrollableDistance = Math.max(element.offsetHeight - window.innerHeight, 1);
      const currentScroll = clamp(-rect.top / totalScrollableDistance);
      setProgress(currentScroll);
    };

    const onScroll = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (!snapSections) {
      return;
    }

    const element = rootRef.current;
    if (!element) {
      return;
    }

    const layerCount = safeLayers.length;

    const getScrollMetrics = () => {
      const rect = element.getBoundingClientRect();
      const total = Math.max(element.offsetHeight - window.innerHeight, 1);
      const sectionDocTop = rect.top + window.scrollY;
      const progressNow = clamp(-rect.top / total);
      return { rect, total, sectionDocTop, progressNow };
    };

    const prefersReducedMotion = () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lastSnapIndex = layerCount;

    const scrollToSnapIndex = (index: number) => {
      const { total, sectionDocTop } = getScrollMetrics();
      const clamped = clamp(Math.round(index), 0, lastSnapIndex);
      const targetProgress =
        clamped >= layerCount ? 1 : (clamped / layerCount) * contentFraction;
      const targetY = sectionDocTop + targetProgress * total;
      window.scrollTo({
        top: targetY,
        behavior: prefersReducedMotion() ? "instant" : "smooth",
      });
    };

    const nearestSnapIndex = (progressNow: number) => {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < layerCount; i++) {
        const p = (i / layerCount) * contentFraction;
        const dist = Math.abs(progressNow - p);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      const distEnd = Math.abs(progressNow - 1);
      if (distEnd < bestDist) {
        return lastSnapIndex;
      }
      return bestIdx;
    };

    const snapProgressForIndex = (snapIdx: number) =>
      snapIdx >= layerCount ? 1 : (snapIdx / layerCount) * contentFraction;

    const onWheel = (event: WheelEvent) => {
      const { rect, total, progressNow } = getScrollMetrics();
      const stickyActive =
        rect.top <= 0.5 && rect.bottom >= window.innerHeight - 0.5 && total > 1;

      if (!stickyActive) {
        return;
      }

      const idx = nearestSnapIndex(progressNow);

      if (event.deltaY > 0 && idx >= lastSnapIndex) {
        return;
      }

      if (event.deltaY < 0 && idx <= 0) {
        return;
      }

      if (Date.now() < snapLockUntilRef.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIdx = clamp(idx + direction, 0, lastSnapIndex);

      snapLockUntilRef.current = Date.now() + (prefersReducedMotion() ? 80 : 520);
      scrollToSnapIndex(nextIdx);
    };

    const onScrollEnd = () => {
      const { rect, total, progressNow } = getScrollMetrics();
      const stickyActive =
        rect.top <= 0.5 && rect.bottom >= window.innerHeight - 0.5 && total > 1;

      if (!stickyActive) {
        return;
      }

      const idx = nearestSnapIndex(progressNow);
      const snapProgress = snapProgressForIndex(idx);
      if (Math.abs(progressNow - snapProgress) > 0.02) {
        scrollToSnapIndex(idx);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scrollend", onScrollEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, [snapSections, safeLayers.length, contentFraction]);

  const totalHeight = totalUnits * layerHeightVh;
  const effectiveProgress =
    contentFraction > 0 ? clamp(progress / contentFraction, 0, 1) : 0;
  const baseLayerProgress = effectiveProgress * safeLayers.length;
  const timelineProgress = baseLayerProgress * spacingFactor;
  const fadeDenominator = Math.max(1 - contentFraction, 1e-6);
  const stickyOpacity =
    progress <= contentFraction ? 1 : clamp(1 - (progress - contentFraction) / fadeDenominator);
  const titleOpacity = clamp(1 - baseLayerProgress * 0.82);

  return (
    <section
      ref={rootRef}
      className={classNames("hero-scroll", className)}
      style={{ minHeight: `${totalHeight}vh`, ...style }}
      {...props}
    >
      <div
        className="hero-scroll__sticky"
        style={{
          opacity: stickyOpacity,
          backgroundColor,
          backgroundImage: backgroundImageUrl
            ? `linear-gradient(180deg, rgba(3,4,8,0.4), rgba(3,4,8,0.82)), url("${backgroundImageUrl}")`
            : undefined,
        }}
      >
        <header className="hero-scroll__title-wrap" style={{ opacity: titleOpacity }}>
          <h1 className="hero-scroll__title">{title}</h1>
          {subtitle ? <p className="hero-scroll__subtitle">{subtitle}</p> : null}
        </header>

        {safeLayers.map((layer, index) => {
          const layerPosition = index * spacingFactor - timelineProgress;
          const layerOpacity = clamp(1 - Math.abs(layerPosition) * 0.68);
          const layerTranslateY = layerPosition * 16;
          const layerScale = clamp(1 - Math.abs(layerPosition) * 0.08, 0.86, 1);

          return (
            <article
              key={layer.id}
              className={classNames("hero-scroll__layer", {
                "hero-scroll__layer--left": layer.align === "left",
                "hero-scroll__layer--center": !layer.align || layer.align === "center",
                "hero-scroll__layer--right": layer.align === "right",
              })}
              style={{
                opacity: layerOpacity,
                transform: `translate3d(0, ${layerTranslateY}%, 0) scale(${layerScale})`,
                backgroundColor: layer.backgroundColor,
                backgroundImage: layer.imageUrl
                  ? `linear-gradient(180deg, rgba(9,10,14,0.2), rgba(9,10,14,0.65)), url("${layer.imageUrl}")`
                  : undefined,
              }}
            >
              <div className="hero-scroll__layer-content">
                <h2 className="hero-scroll__layer-title">{layer.title}</h2>
                {layer.description ? (
                  <p className="hero-scroll__layer-description">{layer.description}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
