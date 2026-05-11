import type { Meta, StoryObj } from "@storybook/react-vite";
import { CrtTvHero } from "@components/CrtTvHero";

const meta = {
  title: "Components/CrtTvHero",
  component: CrtTvHero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "studio",
      values: [
        { name: "studio", value: "#0c0d10" },
        { name: "paper", value: "#ece8df" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 px-4 py-12 sm:px-8 sm:py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CrtTvHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingHero: Story = {
  args: {
    className: "lg:max-w-7xl",
    children: (
      <div className="flex h-full min-h-[240px] flex-col justify-center gap-5 text-center sm:min-h-[280px] sm:text-left">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300/80">
          Signal locked · 1998–present
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          Build the future.
          <span className="block text-zinc-300">Dress it in the past.</span>
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-zinc-400 sm:mx-0 sm:text-base">
          A premium hero frame that scales cleanly, keeps focus on your message, and leaves room for
          cinematic scroll and zoom later on.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-lg shadow-black/30 transition hover:bg-zinc-100"
          >
            Start free
          </button>
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-sm transition hover:bg-white/10"
          >
            Watch channel 2
          </button>
        </div>
      </div>
    ),
  },
};

export const CustomSize: Story = {
  args: {
    width: 560,
    height: undefined,
    className: "max-w-none",
    children: (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
        <span className="text-xs uppercase tracking-widest text-zinc-500">Fixed width</span>
        <p className="text-lg font-medium text-white">560px chassis</p>
      </div>
    ),
  },
};

export const ScreenOnlyTypography: Story = {
  args: {
    children: (
      <div className="flex h-full min-h-[220px] flex-col justify-end pb-2">
        <blockquote className="text-balance text-lg font-light leading-snug text-zinc-200 md:text-xl">
          “Design is the silent ambassador of your brand.”
        </blockquote>
        <cite className="mt-4 block text-sm not-italic text-zinc-500">— Paul Rand</cite>
      </div>
    ),
  },
};

export const ScrollIntoTheScreen: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-[320vh] bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
        <div className="px-4 pt-6 text-center sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Scrolla nedåt · åk in i skärmen
          </p>
        </div>
        <Story />
        <section className="mx-auto max-w-xl px-6 py-24 text-center text-zinc-500">
          <p className="text-sm leading-relaxed">
            Efter zoom-sekvensen fortsätter sidan som vanligt — lägg nästa sektion här.
          </p>
        </section>
      </div>
    ),
  ],
  args: {
    scrollInto: { scrollRangeVh: 140 },
    className: "lg:max-w-7xl",
    children: (
      <div className="flex min-h-[min(52vh,420px)] flex-col justify-center gap-5 text-center sm:min-h-[min(48vh,380px)] sm:text-left">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300/80">
          Du är nästan inne
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          Fortsätt scrolla.
          <span className="block text-zinc-300">Skärmen blir hela vyn.</span>
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-zinc-400 sm:mx-0 sm:text-base">
          Sticky viewport + skalning mot skärmens centrum. Ramen försvinner utanför kanten medan du “flyger in” i
          CRT-ytan.
        </p>
      </div>
    ),
  },
};
