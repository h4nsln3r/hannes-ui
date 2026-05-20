import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionScrollSnap } from "@components/SectionScrollSnap";
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
    id: "intro",
    title: "Intro",
    body: "Scrolla med musen, trackpaden eller piltangenterna — sidan snäpper en sektion åt gången.",
    bg: "#ff4a00",
    fg: "#1a0e08",
  },
  {
    id: "philosophy",
    title: "Filosofi",
    body: "Trackpad-input ackumuleras tills tröskeln nås, sedan tas exakt ett steg. Inga oönskade hopp.",
    bg: "#0d1117",
    fg: "#f6f7fb",
  },
  {
    id: "details",
    title: "Detaljer",
    body: "Tangentbordet (Arrow, Page, Space, Enter) hoppar också mellan sektioner.",
    bg: "#f4efe7",
    fg: "#1a1a1a",
  },
  {
    id: "outro",
    title: "Outro",
    body: "Scrollbaren snäppar till närmaste sektion när du släpper på desktop.",
    bg: "#101820",
    fg: "#f6f7fb",
  },
];

const meta = {
  title: "Components/SectionScrollSnap",
  component: SectionScrollSnap,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SectionScrollSnap>;

export default meta;
type Story = StoryObj<typeof meta>;

const SnapPage = ({
  withMenu,
  sectionExtraOffsetPx,
}: {
  withMenu: boolean;
  sectionExtraOffsetPx?: Record<string, number>;
}) => (
  <>
    {withMenu && (
      <SectionMenu
        logo={<strong style={{ letterSpacing: "0.08em" }}>SNAP</strong>}
        links={SECTIONS.map((s) => ({ id: s.id, label: s.title }))}
        homeSectionId="intro"
        lightOnSections={["philosophy", "outro"]}
      />
    )}
    <SectionScrollSnap
      sectionIds={SECTIONS.map((s) => s.id)}
      menuHeightPx={withMenu ? 50 : 0}
      sectionExtraOffsetPx={sectionExtraOffsetPx}
    />
    <main style={{ paddingTop: withMenu ? 50 : 0 }}>
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
          <span
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              opacity: 0.7,
            }}
          >
            #{section.id}
          </span>
          <h1
            style={{
              margin: "1rem 0 0",
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
  </>
);

export const StandaloneSnap: Story = {
  args: {
    sectionIds: SECTIONS.map((s) => s.id),
  },
  render: () => <SnapPage withMenu={false} />,
};

export const WithSectionMenu: Story = {
  args: {
    sectionIds: SECTIONS.map((s) => s.id),
    menuHeightPx: 50,
  },
  render: () => <SnapPage withMenu />,
};

export const WithPerSectionOffsets: Story = {
  args: {
    sectionIds: SECTIONS.map((s) => s.id),
    menuHeightPx: 50,
    sectionExtraOffsetPx: { philosophy: 24, outro: -16 },
  },
  render: () => (
    <SnapPage withMenu sectionExtraOffsetPx={{ philosophy: 24, outro: -16 }} />
  ),
};
