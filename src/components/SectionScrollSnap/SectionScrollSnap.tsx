import React from "react";
import {
  useSectionScrollSnap,
  type UseSectionScrollSnapOptions,
} from "./useSectionScrollSnap";

export type SectionScrollSnapProps = UseSectionScrollSnapOptions & {
  /** Ordered section ids (matching DOM ids) that the snap should step between. */
  sectionIds: string[];
  /** Render-through children. The component is purely behavioural and does not render markup. */
  children?: React.ReactNode;
};

/**
 * Behavioural wrapper that turns native page scroll into section-by-section snapping.
 *
 * It does not render any DOM of its own — the actual sections live elsewhere on the page
 * and are referenced by `id`. Place this component once near the root of your route.
 *
 * ```tsx
 * <SectionScrollSnap sectionIds={["hero", "about", "work", "contact"]} menuHeightPx={64}>
 *   <Layout />
 * </SectionScrollSnap>
 * ```
 */
export const SectionScrollSnap: React.FC<SectionScrollSnapProps> = ({
  sectionIds,
  children,
  ...options
}) => {
  useSectionScrollSnap(sectionIds, options);
  return <>{children ?? null}</>;
};
