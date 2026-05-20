import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionMenu } from "@components/SectionMenu";
import "@components/SectionMenu/section-menu.scss";

const SECTIONS: Array<{
  id: string;
  title: string;
  body: string;
  bg: string;
  fg: string;
}> = [
  {
    id: "hero",
    title: "Hero",
    body: "Toppen av sidan. Scrolla för att se menyn växla mellan ljus- och mörkläge.",
    bg: "#ff4a00",
    fg: "#1a0e08",
  },
  {
    id: "live",
    title: "Live",
    body: "Mörkare sektion — menyn slår om till `light`-varianten.",
    bg: "#0d1117",
    fg: "#f6f7fb",
  },
  {
    id: "music",
    title: "Music",
    body: "En ljus sektion igen. Underlinen växlar färg automatiskt.",
    bg: "#f4efe7",
    fg: "#1a1a1a",
  },
  {
    id: "about",
    title: "About",
    body: "En till mörk sektion. Mobilen visar en helskärms-sheet vid hamburger-klick.",
    bg: "#101820",
    fg: "#f6f7fb",
  },
  {
    id: "contact",
    title: "Contact",
    body: "I exemplet är `contact` med i `hideOnSections` så menyn glider upp.",
    bg: "#e8e2d5",
    fg: "#1a1a1a",
  },
];

const Logo = () => (
  <span
    style={{
      fontWeight: 800,
      fontSize: 22,
      letterSpacing: "0.06em",
      color: "currentColor",
      lineHeight: 1,
    }}
  >
    h.ui
  </span>
);

const links = SECTIONS.filter((s) => s.id !== "hero").map((section) => ({
  id: section.id,
  label: section.title,
}));

const Page = () => (
  <main style={{ paddingTop: 50 }}>
    {SECTIONS.map((section) => (
      <section
        key={section.id}
        id={section.id}
        style={{
          minHeight: "100vh",
          background: section.bg,
          color: section.fg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "5rem clamp(1rem, 5vw, 4rem)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          {section.title}
        </h1>
        <p
          style={{
            marginTop: "1.25rem",
            maxWidth: 540,
            fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
            lineHeight: 1.6,
            opacity: 0.85,
          }}
        >
          {section.body}
        </p>
      </section>
    ))}
  </main>
);

const meta = {
  title: "Components/SectionMenu",
  component: SectionMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SectionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: <Logo />,
    links,
    homeSectionId: "hero",
    lightOnSections: ["live", "about"],
    hideOnSections: ["contact"],
  },
  render: (args) => (
    <>
      <SectionMenu {...args} />
      <Page />
    </>
  ),
};

export const WithRightSlot: Story = {
  args: {
    ...Default.args,
    rightSlot: (
      <a
        href="#contact"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.4rem 0.9rem",
          borderRadius: 999,
          background: "currentColor",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <span style={{ color: "var(--section-menu-bg, #fff)", mixBlendMode: "difference" }}>
          Boka
        </span>
      </a>
    ),
  },
  render: Default.render,
};

export const AlwaysLight: Story = {
  args: {
    ...Default.args,
    lightOnSections: SECTIONS.map((s) => s.id),
  },
  render: (args) => (
    <>
      <SectionMenu {...args} />
      <main style={{ paddingTop: 50 }}>
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{
              minHeight: "100vh",
              background: "#0b0d10",
              color: "#f6f7fb",
              display: "grid",
              placeItems: "center",
              padding: "4rem 1.5rem",
            }}
          >
            <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", margin: 0 }}>{section.title}</h2>
          </section>
        ))}
      </main>
    </>
  ),
};
