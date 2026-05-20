import { useEffect, useMemo, useRef } from "react";

export type UseSectionScrollSnapOptions = {
  /** Disable all snap behaviour without unmounting. */
  disabled?: boolean;
  /** Height of any fixed top bar in px (used as the section anchor offset). Defaults to `50`. */
  menuHeightPx?: number;
  /** Wheel/trackpad distance required for one section step. Defaults to `110`. */
  wheelThresholdPx?: number;
  /** Touch distance required for one section step. Defaults to `60`. */
  touchThresholdPx?: number;
  /** Safety unlock timeout in ms after a snap starts. Defaults to `900`. */
  unlockAfterMs?: number;
  /** Cooldown between wheel snap steps in ms. Defaults to `420`. */
  wheelStepCooldownMs?: number;
  /** Per-section landing offset in px (added on top of `menuHeightPx`). */
  sectionExtraOffsetPx?: Record<string, number>;
  /**
   * CSS selector. If the wheel/touch event originated inside an element matching this selector,
   * snapping is bypassed so users can scroll within nested scroll containers freely.
   */
  bypassSelector?: string;
  /** Min viewport width (px) to enable scrollbar-snap-end behaviour. Defaults to `768`. */
  desktopMinWidthPx?: number;
};

type Direction = 1 | -1;

const SNAP_SUSPEND_ATTR = "data-section-scroll-snap-suspend";

const clampIndex = (index: number, min: number, max: number) =>
  Math.max(min, Math.min(max, index));

const setSnapSuspend = (suspend: boolean) => {
  if (typeof document === "undefined") return;
  if (suspend) {
    document.documentElement.setAttribute(SNAP_SUSPEND_ATTR, "");
  } else {
    document.documentElement.removeAttribute(SNAP_SUSPEND_ATTR);
  }
};

const getSectionIndexFromScroll = (sectionIds: string[], menuHeightPx: number) => {
  const anchorY = window.scrollY + menuHeightPx + 2;

  for (let i = 0; i < sectionIds.length; i++) {
    const id = sectionIds[i];
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (anchorY >= top && anchorY < bottom) return i;
  }

  let best = 0;
  for (let i = 0; i < sectionIds.length; i++) {
    const id = sectionIds[i];
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.offsetTop <= anchorY) best = i;
  }
  return best;
};

const scrollToSectionId = (id: string, menuHeightPx: number, extraOffsetPx: number) => {
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const targetY = Math.max(0, top - menuHeightPx + extraOffsetPx);
  window.scrollTo({ top: targetY, behavior: "smooth" });
  return targetY;
};

const getSnapScrollYForSection = (
  id: string,
  menuHeightPx: number,
  sectionExtraOffsetPx: Record<string, number>,
): number | null => {
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const extra = sectionExtraOffsetPx[id] ?? 0;
  return Math.max(0, top - menuHeightPx + extra);
};

const canStepToAdjacentSection = (
  sectionIds: string[],
  menuHeightPx: number,
  direction: Direction,
) => {
  const currentIndex = getSectionIndexFromScroll(sectionIds, menuHeightPx);
  const nextIndex = clampIndex(currentIndex + direction, 0, sectionIds.length - 1);
  return nextIndex !== currentIndex;
};

/**
 * Attaches a section-by-section scroll snap to the window.
 *
 * - Wheel and trackpad input is accumulated until a threshold and then drives one snap step.
 * - Touch gestures snap on a vertical swipe past `touchThresholdPx`.
 * - Native scrollbar drags on desktop snap to the nearest section at scroll-end.
 * - Keyboard (Arrow / Page / Space) steps between sections.
 */
export function useSectionScrollSnap(
  sectionIds: string[],
  options?: UseSectionScrollSnapOptions,
) {
  const {
    disabled = false,
    menuHeightPx = 50,
    wheelThresholdPx = 110,
    touchThresholdPx = 60,
    unlockAfterMs = 900,
    wheelStepCooldownMs = 420,
    sectionExtraOffsetPx,
    bypassSelector,
    desktopMinWidthPx = 768,
  } = options ?? {};

  const sectionKey = useMemo(() => sectionIds.join("|"), [sectionIds]);
  const offsetsKey = useMemo(
    () =>
      sectionExtraOffsetPx
        ? Object.entries(sectionExtraOffsetPx)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join("|")
        : "",
    [sectionExtraOffsetPx],
  );

  const wheelAccumRef = useRef(0);
  const lastWheelDirectionRef = useRef<Direction | null>(null);
  const wheelBlockUntilRef = useRef(0);
  const lockedRef = useRef(false);
  const unlockRafRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchLastYRef = useRef<number | null>(null);
  const touchTargetElRef = useRef<HTMLElement | null>(null);

  const lastWheelAtRef = useRef(0);
  const prevScrollYRef = useRef<number | null>(null);
  const lastNativeScrollDirRef = useRef<Direction | null>(null);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;
    if (sectionIds.length < 2) return;

    const desktopMql = window.matchMedia(`(min-width: ${desktopMinWidthPx}px)`);
    const supportsScrollEnd = "onscrollend" in window;
    const offsets = sectionExtraOffsetPx ?? {};

    const matchesBypass = (target: EventTarget | null) => {
      if (!bypassSelector) return false;
      const el = target as HTMLElement | null;
      return !!el?.closest?.(bypassSelector);
    };

    const onUnlockIfNeeded = (targetY: number) => {
      const startedAt = performance.now();
      const tick = () => {
        if (!lockedRef.current) return;
        const stillCloseEnough = Math.abs(window.scrollY - targetY) < 2;
        const timedOut = performance.now() - startedAt > unlockAfterMs;
        if (stillCloseEnough || timedOut) {
          lockedRef.current = false;
          setSnapSuspend(false);
          wheelAccumRef.current = 0;
          lastWheelDirectionRef.current = null;
          wheelBlockUntilRef.current = Math.max(
            wheelBlockUntilRef.current,
            performance.now() + wheelStepCooldownMs,
          );
          unlockRafRef.current = null;
          return;
        }
        unlockRafRef.current = requestAnimationFrame(tick);
      };
      unlockRafRef.current = requestAnimationFrame(tick);
    };

    const onDesktopScrollbarSnapEnd = () => {
      if (!desktopMql.matches) return;
      if (lockedRef.current) return;

      const WHEEL_SUPPRESS_MS = 450;
      if (performance.now() - lastWheelAtRef.current < WHEEL_SUPPRESS_MS) return;

      const points = sectionIds
        .map((id) => {
          const y = getSnapScrollYForSection(id, menuHeightPx, offsets);
          return y === null ? null : { id, y };
        })
        .filter((p): p is { id: string; y: number } => p !== null)
        .sort((a, b) => a.y - b.y);

      if (points.length === 0) return;

      const y = window.scrollY;
      const TOL = 4;

      if (points.some((p) => Math.abs(y - p.y) <= TOL)) return;

      for (let i = 0; i < points.length - 1; i++) {
        const lo = points[i].y;
        const hi = points[i + 1].y;
        if (y > lo + TOL && y < hi - TOL) {
          const dir = lastNativeScrollDirRef.current;
          const targetY =
            dir === 1 ? hi : dir === -1 ? lo : y - lo <= hi - y ? lo : hi;
          if (Math.abs(y - targetY) < TOL) return;

          lockedRef.current = true;
          setSnapSuspend(true);
          window.scrollTo({ top: targetY, behavior: "smooth" });
          onUnlockIfNeeded(targetY);
          return;
        }
      }

      let nearest = points[0].y;
      let nearestDist = Math.abs(y - nearest);
      for (const p of points) {
        const d = Math.abs(y - p.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = p.y;
        }
      }
      if (nearestDist < TOL) return;

      lockedRef.current = true;
      setSnapSuspend(true);
      window.scrollTo({ top: nearest, behavior: "smooth" });
      onUnlockIfNeeded(nearest);
    };

    let scrollEndDebounce: number | null = null;
    const clearScrollEndDebounce = () => {
      if (scrollEndDebounce !== null) {
        window.clearTimeout(scrollEndDebounce);
        scrollEndDebounce = null;
      }
    };

    const onNativeScrollTrackDirection = () => {
      if (!desktopMql.matches) return;

      const sy = window.scrollY;
      if (lockedRef.current) {
        prevScrollYRef.current = sy;
        return;
      }

      const prev = prevScrollYRef.current;
      if (prev !== null && Math.abs(sy - prev) >= 1) {
        lastNativeScrollDirRef.current = sy > prev ? 1 : -1;
      }
      prevScrollYRef.current = sy;
    };

    const scheduleScrollEndFallback = () => {
      if (!desktopMql.matches || lockedRef.current) return;
      clearScrollEndDebounce();
      scrollEndDebounce = window.setTimeout(() => {
        scrollEndDebounce = null;
        onDesktopScrollbarSnapEnd();
      }, 130);
    };

    prevScrollYRef.current = window.scrollY;

    const onScrollBundle = () => {
      onNativeScrollTrackDirection();
      if (!supportsScrollEnd) scheduleScrollEndFallback();
    };

    window.addEventListener("scroll", onScrollBundle, { passive: true });
    if (supportsScrollEnd) {
      window.addEventListener("scrollend", onDesktopScrollbarSnapEnd as EventListener);
    }

    const tryStep = (direction: Direction) => {
      if (lockedRef.current) return;

      const currentIndex = getSectionIndexFromScroll(sectionIds, menuHeightPx);
      const nextIndex = clampIndex(currentIndex + direction, 0, sectionIds.length - 1);
      if (nextIndex === currentIndex) return;
      const nextId = sectionIds[nextIndex];
      if (!nextId) return;

      lockedRef.current = true;
      setSnapSuspend(true);
      const extraOffset = offsets[nextId] ?? 0;
      const targetY = scrollToSectionId(nextId, menuHeightPx, extraOffset);
      if (targetY == null) {
        lockedRef.current = false;
        setSnapSuspend(false);
        wheelAccumRef.current = 0;
        return;
      }
      onUnlockIfNeeded(targetY);
    };

    const onWheel = (e: WheelEvent) => {
      lastWheelAtRef.current = performance.now();

      if (matchesBypass(e.target)) return;

      if (lockedRef.current) {
        e.preventDefault();
        return;
      }

      if (performance.now() < wheelBlockUntilRef.current) {
        e.preventDefault();
        return;
      }

      const deltaY = e.deltaY ?? 0;
      if (deltaY === 0) return;
      const direction: Direction = deltaY > 0 ? 1 : -1;

      const isDiscreteWheel =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE ||
        e.deltaMode === WheelEvent.DOM_DELTA_PAGE;

      if (isDiscreteWheel) {
        if (!canStepToAdjacentSection(sectionIds, menuHeightPx, direction)) return;
        e.preventDefault();
        wheelAccumRef.current = 0;
        lastWheelDirectionRef.current = null;
        tryStep(direction);
        wheelBlockUntilRef.current = Math.max(
          wheelBlockUntilRef.current,
          performance.now() + wheelStepCooldownMs,
        );
        return;
      }

      if (!canStepToAdjacentSection(sectionIds, menuHeightPx, direction)) {
        wheelAccumRef.current = 0;
        lastWheelDirectionRef.current = null;
        return;
      }
      e.preventDefault();

      if (
        lastWheelDirectionRef.current != null &&
        lastWheelDirectionRef.current !== direction
      ) {
        wheelAccumRef.current = 0;
      }
      lastWheelDirectionRef.current = direction;

      wheelAccumRef.current += deltaY;

      if (Math.abs(wheelAccumRef.current) < wheelThresholdPx) return;

      const stepDirection: Direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      lastWheelDirectionRef.current = null;
      tryStep(stepDirection);
      wheelBlockUntilRef.current = Math.max(
        wheelBlockUntilRef.current,
        performance.now() + wheelStepCooldownMs,
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (lockedRef.current) return;
      const key = e.key;
      const wantsNext =
        key === "ArrowDown" || key === "PageDown" || key === " " || key === "Enter";
      const wantsPrev = key === "ArrowUp" || key === "PageUp";
      if (!wantsNext && !wantsPrev) return;
      e.preventDefault();
      tryStep(wantsNext ? 1 : -1);
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.changedTouches?.[0];
      if (!touch) return;
      touchStartYRef.current = touch.clientY;
      touchLastYRef.current = touch.clientY;
      touchTargetElRef.current = e.target as HTMLElement | null;
    };

    const onTouchMove = (e: TouchEvent) => {
      const targetEl = touchTargetElRef.current ?? (e.target as HTMLElement | null);
      if (matchesBypass(targetEl)) return;

      const startY = touchStartYRef.current;
      const touch = e.changedTouches?.[0];
      if (startY == null || !touch) return;

      e.preventDefault();

      if (lockedRef.current) return;

      const deltaY = startY - touch.clientY;
      touchLastYRef.current = touch.clientY;
      if (Math.abs(deltaY) < touchThresholdPx) return;

      const direction: Direction = deltaY > 0 ? 1 : -1;
      if (!canStepToAdjacentSection(sectionIds, menuHeightPx, direction)) {
        touchStartYRef.current = touch.clientY;
        return;
      }
      tryStep(direction);
      touchStartYRef.current = touch.clientY;
    };

    const onTouchEnd = () => {
      touchStartYRef.current = null;
      touchLastYRef.current = null;
      touchTargetElRef.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollBundle as EventListener);
      clearScrollEndDebounce();
      if (supportsScrollEnd) {
        window.removeEventListener(
          "scrollend",
          onDesktopScrollbarSnapEnd as EventListener,
        );
      }
      window.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart as EventListener);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("touchend", onTouchEnd as EventListener);
      if (unlockRafRef.current != null) cancelAnimationFrame(unlockRafRef.current);
      lockedRef.current = false;
      setSnapSuspend(false);
      wheelAccumRef.current = 0;
      lastWheelDirectionRef.current = null;
      wheelBlockUntilRef.current = 0;
      unlockRafRef.current = null;
      touchStartYRef.current = null;
      touchLastYRef.current = null;
      touchTargetElRef.current = null;
    };
    // sectionKey/offsetsKey already encode their inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    disabled,
    sectionKey,
    offsetsKey,
    menuHeightPx,
    wheelThresholdPx,
    touchThresholdPx,
    unlockAfterMs,
    wheelStepCooldownMs,
    bypassSelector,
    desktopMinWidthPx,
  ]);
}
