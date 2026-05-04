import { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => {
    const basePath = process.env.STORYBOOK_BASE_PATH;

    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...(viteConfig.resolve?.alias ?? {}),
        "@components": new URL("../src/components/", import.meta.url).pathname,
      },
    };

    if (basePath) {
      viteConfig.base = basePath.endsWith("/") ? basePath : `${basePath}/`;
    }

    return viteConfig;
  },
};

export default config;
