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
- CJS build (`dist/index.cjs`)
- TypeScript declarations (`dist/index.d.ts`)
- Compiled styles (`dist/styles.css`)
