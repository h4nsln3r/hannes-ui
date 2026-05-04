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
  scrollEffort = 1.8,
  layerGap = 0.75,
  className,
  style,
  ...props
}) => {
  const rootRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const safeLayers = useMemo(() => layers.slice(0, Math.max(1, layers.length)), [layers]);

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

  const effort = Math.max(1, scrollEffort);
  const gap = Math.max(0, layerGap);
  const baseLayerProgress = progress * safeLayers.length;
  const spacingFactor = 1 + gap;
  const timelineProgress = baseLayerProgress * spacingFactor;
  const totalHeight = Math.max(2, safeLayers.length * effort * spacingFactor + 1) * layerHeightVh;
  const titleOpacity = clamp(1 - baseLayerProgress * 1.3);

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
          const layerOpacity = clamp(1 - Math.abs(layerPosition) * 1.15);
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
