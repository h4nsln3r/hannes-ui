# hannes-ui

Modern React component library built with TypeScript and SCSS, designed to work smoothly in Next.js applications.

## Install

```bash
npm install hannes-ui
```

## Usage in Next.js

Import global styles once (for example in `app/layout.tsx` or `pages/_app.tsx`):

```ts
import "hannes-ui/styles.css";
```

Then use components:

```tsx
import { Button } from "hannes-ui";

export default function Example() {
  return <Button label="Save" variant="solid" />;
}
```

## Development

```bash
npm install
npm run storybook
```

## Build package

```bash
npm run build
```

This creates:
- ESM build (`dist/index.js`)
- TypeScript declarations (`dist/index.d.ts`)
- Compiled styles (`dist/styles.css`)

## Publish Storybook (free) with GitHub Pages

This repository includes a workflow that deploys Storybook to GitHub Pages on every push to `main`.

1. Push this project to GitHub
2. In GitHub, open `Settings -> Pages`
3. Set `Source` to `GitHub Actions`
4. Push to `main` (or run workflow manually in `Actions`)

After deploy, Storybook is available at:

`https://<your-github-username>.github.io/<repo-name>/`
