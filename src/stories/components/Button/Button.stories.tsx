import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@components/Button";
import "@components/Button/Button.scss";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: { control: "select", options: ["solid", "transparent"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Click me", variant: "solid" },
};

export const Transparent: Story = {
  args: { label: "Click me", variant: "transparent" },
};

export const Disabled: Story = {
  args: { label: "Can't click", disabled: true },
};

export const Loading: Story = {
  args: { label: "Loading", loading: true },
};
