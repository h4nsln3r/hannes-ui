import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";

const VIEW_W = 1000;
const VIEW_H = 780;

/** Screen opening in viewBox units — `x=150 y=196 w=700 h=442`. */
const SCREEN_VB = { x: 150, y: 196, w: 700, h: 442 };

/** Transform origin at screen center (percent of TV box). */
const SCREEN_ORIGIN_PCT = {
  x: ((SCREEN_VB.x + SCREEN_VB.w / 2) / VIEW_W) * 100,
  y: ((SCREEN_VB.y + SCREEN_VB.h / 2) / VIEW_H) * 100,
};

/** Inset “phosphor” area — matches the inner screen opening in the SVG. */
const SCREEN_INSET = {
  leftPct: (SCREEN_VB.x / VIEW_W) * 100,
  topPct: (SCREEN_VB.y / VIEW_H) * 100,
  widthPct: (SCREEN_VB.w / VIEW_W) * 100,
  heightPct: (SCREEN_VB.h / VIEW_H) * 100,
  radiusPx: "clamp(14px, 2.75vw, 28px)",
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export type CrtTvHeroScrollIntoConfig = {
  /**
   * Extra scroll length after the first viewport (`min-height` = `100dvh` + this).
   * Scroll progress 0→1 over that range drives the zoom into the screen.
   */
  scrollRangeVh?: number;
};

export type CrtTvHeroProps = {
  /** Outer width; numbers are treated as px. Defaults to a fluid full-width hero. */
  width?: React.CSSProperties["width"];
  /** Outer height; numbers are treated as px. When omitted, height follows the SVG aspect ratio. */
  height?: React.CSSProperties["height"];
  className?: string;
  children?: React.ReactNode;
  /**
   * When set, wraps the TV in a tall section with sticky viewport: scrolling zooms
   * the chassis so the CRT screen grows to fill the window (fly into the display).
   */
  scrollInto?: boolean | CrtTvHeroScrollIntoConfig;
};

type FrameProps = Omit<CrtTvHeroProps, "scrollInto">;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CrtTvHeroFrame = forwardRef<HTMLDivElement, FrameProps>(function CrtTvHeroFrame(
  { width, height, className, children },
  ref,
) {
  const sizeStyle: React.CSSProperties = {
    ...(width != null
      ? { width: typeof width === "number" ? `${width}px` : width }
      : {}),
    ...(height != null
      ? { height: typeof height === "number" ? `${height}px` : height }
      : {}),
  };

  return (
    <div
      ref={ref}
      className={classNames("relative mx-auto w-full max-w-6xl", className)}
      style={sizeStyle}
      data-crt-tv-hero
    >
      <svg
        className="block h-auto w-full text-[0.875rem] drop-shadow-[0_28px_60px_rgba(0,0,0,0.45)]"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="crt-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f3c39" />
            <stop offset="52%" stopColor="#2f2c29" />
            <stop offset="100%" stopColor="#262320" />
          </linearGradient>
          <linearGradient id="crt-body-shine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
            <stop offset="18%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="crt-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141312" />
            <stop offset="100%" stopColor="#0b0a09" />
          </linearGradient>
          <linearGradient id="crt-bezel-edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <radialGradient id="crt-screen-bloom" cx="50%" cy="42%" r="68%">
            <stop offset="0%" stopColor="rgba(120,180,255,0.09)" />
            <stop offset="55%" stopColor="rgba(40,60,90,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="crt-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        <ellipse cx="500" cy="718" rx="200" ry="14" fill="rgba(0,0,0,0.22)" />

        <g filter="url(#crt-soft-shadow)">
          <rect x="68" y="148" width="864" height="598" rx="46" fill="url(#crt-body)" />
          <rect x="68" y="148" width="864" height="120" rx="46" fill="url(#crt-body-shine)" />
          <rect
            x="138"
            y="182"
            width="724"
            height="470"
            rx="34"
            fill="url(#crt-bezel)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <rect
            x="142"
            y="186"
            width="716"
            height="462"
            rx="30"
            fill="none"
            stroke="url(#crt-bezel-edge)"
            strokeWidth="1.25"
            opacity="0.85"
          />
        </g>

        <rect
          x="150"
          y="196"
          width="700"
          height="442"
          rx="26"
          fill="url(#crt-screen-bloom)"
          opacity="0.9"
        />

        <g strokeLinecap="round">
          <path
            d="M 500 148 Q 502 120 500 108"
            fill="none"
            stroke="#1f1d1b"
            strokeWidth="6"
          />
          <path
            d="M 500 108 L 418 38"
            fill="none"
            stroke="#3a3634"
            strokeWidth="4.5"
          />
          <path
            d="M 500 108 L 582 38"
            fill="none"
            stroke="#3a3634"
            strokeWidth="4.5"
          />
          <circle cx="418" cy="38" r="7" fill="#2a2827" stroke="#45413f" strokeWidth="1.5" />
          <circle cx="582" cy="38" r="7" fill="#2a2827" stroke="#45413f" strokeWidth="1.5" />
        </g>

        <g opacity="0.92">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="86"
              y={226 + i * 42}
              width="28"
              height="14"
              rx="5"
              fill="#1b1a18"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.75"
            />
          ))}
          <rect x="86" y="442" width="28" height="20" rx="6" fill="#141312" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
        </g>

        <g>
          <circle cx="904" cy="292" r="34" fill="#201f1d" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx="904" cy="292" r="22" fill="#161514" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="904" cy="292" r="9" fill="#0f0e0d" />
          <circle cx="904" cy="388" r="26" fill="#201f1d" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx="904" cy="388" r="14" fill="#141312" />
          <circle cx="904" cy="388" r="6" fill="#0b0a09" />
        </g>

        <g opacity="0.55" stroke="#0b0a09" strokeWidth="1.25">
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M 360 ${640 + i * 5.5} H 640`} />
          ))}
        </g>

        <circle cx="500" cy="658" r="3.5" fill="#1fb6a6" opacity="0.85" />
        <circle cx="500" cy="658" r="1.6" fill="#b7fff4" opacity="0.6" />
      </svg>

      <div
        className="pointer-events-none absolute z-0"
        style={{
          left: `${SCREEN_INSET.leftPct}%`,
          top: `${SCREEN_INSET.topPct}%`,
          width: `${SCREEN_INSET.widthPct}%`,
          height: `${SCREEN_INSET.heightPct}%`,
          borderRadius: SCREEN_INSET.radiusPx,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 80px rgba(0,0,0,0.55), inset 0 18px 48px rgba(255,255,255,0.04)",
        }}
      />

      <div
        data-crt-screen
        className="absolute z-10 flex flex-col justify-center overflow-hidden bg-[#060708] text-zinc-100 antialiased selection:bg-cyan-500/30"
        style={{
          left: `${SCREEN_INSET.leftPct}%`,
          top: `${SCREEN_INSET.topPct}%`,
          width: `${SCREEN_INSET.widthPct}%`,
          height: `${SCREEN_INSET.heightPct}%`,
          borderRadius: SCREEN_INSET.radiusPx,
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.055] mix-blend-soft-light bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.5)_0px,rgba(255,255,255,0.5)_1px,transparent_1px,transparent_3px)]" />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative z-30 h-full min-h-0 w-full overflow-auto px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12">
          <div className="pointer-events-auto">{children}</div>
        </div>
      </div>
    </div>
  );
});

function CrtTvHeroScrollInto({
  scrollRangeVh = 130,
  className,
  ...frameProps
}: FrameProps & { scrollRangeVh: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState({ scale: 1, rotateX: 0 });

  const minHeight = useMemo(
    () => `calc(100dvh + ${Math.max(40, scrollRangeVh)}vh)`,
    [scrollRangeVh],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const tv = tvRef.current;
    if (!section || !tv) {
      return;
    }

    let raf = 0;

    const tick = () => {
      raf = 0;
      if (prefersReducedMotion()) {
        setMotion({ scale: 1, rotateX: 0 });
        return;
      }

      const rect = section.getBoundingClientRect();
      const total = Math.max(section.offsetHeight - window.innerHeight, 1);
      const raw = clamp(-rect.top / total, 0, 1);
      const p = easeOutCubic(raw);

      const W = Math.max(tv.offsetWidth, 1);
      const sw = W * (SCREEN_VB.w / VIEW_W);
      const sh = W * (SCREEN_VB.h / VIEW_W);
      const cover = Math.max(window.innerWidth / sw, window.innerHeight / sh);
      const scale = 1 + (cover - 1) * p;
      const rotateX = -6 * (1 - p) * 0.35;

      setMotion({ scale, rotateX });
    };

    const schedule = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    tick();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(section);
    ro.observe(tv);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [scrollRangeVh]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ minHeight }}
      data-crt-scroll-section
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#07080c]">
        <div
          className="relative mx-auto w-full px-4 sm:px-6"
          style={{
            perspective: "min(1400px, 120vw)",
            perspectiveOrigin: "50% 45%",
          }}
        >
          <div
            className="mx-auto w-full will-change-transform"
            style={{
              transform: `scale(${motion.scale}) rotateX(${motion.rotateX}deg)`,
              transformOrigin: `${SCREEN_ORIGIN_PCT.x}% ${SCREEN_ORIGIN_PCT.y}%`,
              transformStyle: "preserve-3d",
            }}
          >
            <CrtTvHeroFrame ref={tvRef} {...frameProps} className={className} />
          </div>
        </div>
      </div>
    </section>
  );
}

export const CrtTvHero: React.FC<CrtTvHeroProps> = ({ scrollInto, ...props }) => {
  if (scrollInto) {
    const range =
      typeof scrollInto === "object" && scrollInto.scrollRangeVh != null
        ? scrollInto.scrollRangeVh
        : 130;
    return <CrtTvHeroScrollInto {...props} scrollRangeVh={range} />;
  }
  return <CrtTvHeroFrame {...props} />;
};
