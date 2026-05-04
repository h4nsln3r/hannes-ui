import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeroScroll } from "@components/HeroScroll";
import "@components/HeroScroll/hero-scroll.scss";

const meta = {
  title: "Components/HeroScroll",
  component: HeroScroll,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HeroScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "We Are Movement",
    subtitle: "A cinematic hero with layered scroll storytelling.",
    scrollEffort: 2.2,
    layerGap: 0.95,
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80",
    layers: [
      {
        id: "l1",
        title: "Direct Access to Private Travel",
        description:
          "Fly beyond boundaries with operations designed around your schedule and comfort.",
        align: "left",
      },
      {
        id: "l2",
        title: "Precision and Excellence",
        description:
          "Each flight combines strict operational quality with premium onboard service.",
        align: "center",
        backgroundColor: "rgba(11, 20, 38, 0.82)",
      },
      {
        id: "l3",
        title: "Global Reach, Personal Touch",
        description:
          "Scale your story with multiple layers and smooth transitions while scrolling.",
        align: "right",
        imageUrl:
          "https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1600&q=80",
      },
    ],
  },
};
