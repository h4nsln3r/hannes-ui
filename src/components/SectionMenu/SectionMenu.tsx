import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import "./section-menu.scss";

export type SectionMenuLink = {
  id: string;
  label: React.ReactNode;
  href?: string;
};

export type SectionMenuProps = React.HTMLAttributes<HTMLElement> & {
  /** Section ids + labels rendered as nav links. */
  links: SectionMenuLink[];
  /** Logo slot. Click scrolls to `homeSectionId` (or the top of the page). */
  logo?: React.ReactNode;
  /** Optional content on the far right (e.g. language switcher / CTA). */
  rightSlot?: React.ReactNode;
  /** Fixed bar height in px. Defaults to `50`. */
  height?: number;
  /** Mobile breakpoint in px. Below this the mobile sheet is used. Defaults to `768`. */
  mobileBreakpoint?: number;
  /** Section ids that hide the menu (translate-up) when active. */
  hideOnSections?: string[];
  /** Section ids that flip the menu to its light variant when active. */
  lightOnSections?: string[];
  /** Per-section landing offset in px, added on top of the menu height when scrolling. */
  sectionOffsetsPx?: Record<string, number>;
  /** Scroll-spy offset in px. Defaults to `height + 100`. */
  scrollSpyOffsetPx?: number;
  /** Section id to scroll to when the logo is clicked. Defaults to first link id. */
  homeSectionId?: string;
  /** Controlled mobile open state. */
  isOpen?: boolean;
  /** Uncontrolled initial mobile open state. */
  defaultOpen?: boolean;
  /** Notified when the mobile open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Notified when a link is clicked (after scroll start). */
  onLinkClick?: (id: string) => void;
};

const DEFAULT_HEIGHT = 50;
const DEFAULT_BREAKPOINT = 768;

const HamburgerIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </svg>
);

const CloseChevron: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

const useMediaMatches = (query: string) => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [query]);

  return matches;
};

const useScrollSpy = (ids: string[], offset: number) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId("");
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY + offset;
      const first = document.getElementById(ids[0]);

      if (first && scrollPos < first.offsetTop) {
        setActiveId("");
        return;
      }

      const current = ids.find((id) => {
        const el = document.getElementById(id);
        return (
          el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos
        );
      });

      if (current) setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [ids, offset]);

  return activeId;
};

export const SectionMenu: React.FC<SectionMenuProps> = ({
  links,
  logo,
  rightSlot,
  height = DEFAULT_HEIGHT,
  mobileBreakpoint = DEFAULT_BREAKPOINT,
  hideOnSections,
  lightOnSections,
  sectionOffsetsPx,
  scrollSpyOffsetPx,
  homeSectionId,
  isOpen: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onLinkClick,
  className,
  style,
  ...rest
}) => {
  const isMobile = useMediaMatches(`(max-width: ${mobileBreakpoint - 1}px)`);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen != null;
  const isOpen = isControlled ? !!controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const sectionIds = useMemo(() => links.map((l) => l.id), [links]);
  const activeSection = useScrollSpy(sectionIds, scrollSpyOffsetPx ?? height + 100);

  const shouldHide = hideOnSections?.includes(activeSection) ?? false;
  const isLight = lightOnSections?.includes(activeSection) ?? false;

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const extra = sectionOffsetsPx?.[id] ?? 0;
      const y = top - height + extra;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    },
    [height, sectionOffsetsPx],
  );

  const handleLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      scrollToSection(id);
      onLinkClick?.(id);
      if (isMobile) setOpen(false);
    },
    [scrollToSection, onLinkClick, isMobile, setOpen],
  );

  const handleLogoClick = useCallback(() => {
    const id = homeSectionId ?? links[0]?.id;
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        scrollToSection(id);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (isMobile) setOpen(false);
  }, [homeSectionId, links, isMobile, setOpen, scrollToSection]);

  // Lock body scroll while the mobile sheet is open.
  const bodyOverflowRef = useRef<{ html: string; body: string } | null>(null);
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    bodyOverflowRef.current = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      if (bodyOverflowRef.current) {
        html.style.overflow = bodyOverflowRef.current.html;
        body.style.overflow = bodyOverflowRef.current.body;
      }
      bodyOverflowRef.current = null;
    };
  }, [isMobile, isOpen]);

  // Close mobile sheet when crossing back to desktop.
  useEffect(() => {
    if (!isMobile && isOpen) setOpen(false);
  }, [isMobile, isOpen, setOpen]);

  const cssVars: React.CSSProperties = {
    ["--section-menu-height" as never]: `${height}px`,
  };

  return (
    <>
      {isMobile && (
        <button
          type="button"
          aria-label="Stäng meny"
          aria-hidden={!isOpen}
          tabIndex={isOpen ? 0 : -1}
          className={classNames("section-menu__backdrop", {
            "section-menu__backdrop--visible": isOpen,
          })}
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        {...rest}
        style={{ ...cssVars, ...style }}
        className={classNames(
          "section-menu",
          {
            "section-menu--light": isLight,
            "section-menu--no-active": activeSection === "",
            "section-menu--hide": shouldHide,
            "section-menu--mobile-open": isMobile && isOpen,
          },
          className,
        )}
      >
        {logo != null && (
          <div
            className="section-menu__logo"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleLogoClick();
              }
            }}
          >
            {logo}
          </div>
        )}

        <div className="section-menu__controls">
          {rightSlot}
          {isMobile && (
            <button
              type="button"
              className="section-menu__toggle"
              aria-label={isOpen ? "Stäng meny" : "Öppna meny"}
              aria-expanded={isOpen}
              onClick={() => setOpen(!isOpen)}
            >
              {isOpen ? <CloseChevron /> : <HamburgerIcon />}
            </button>
          )}
        </div>

        <div
          className={classNames("section-menu__panel", {
            "section-menu__panel--mobile": isMobile,
            "section-menu__panel--open": isMobile && isOpen,
          })}
          aria-hidden={isMobile && !isOpen}
        >
          <ul className="section-menu__links">
            {links.map((link) => (
              <li key={link.id} className="section-menu__link-item">
                <a
                  href={link.href ?? `#${link.id}`}
                  className={classNames("section-menu__link", {
                    "section-menu__link--active": activeSection === link.id,
                  })}
                  onClick={(event) => handleLinkClick(event, link.id)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};
