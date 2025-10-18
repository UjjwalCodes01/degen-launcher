## ESLint & TypeScript Notes

This project temporarily ignores ESLint during production builds to avoid blocking deployment while some types and rule violations are being cleaned up.

Files with `any` and ESLint warnings/errors include:

- `src/components/ui/moving-border.tsx`
- `src/components/ui/pixelated-canvas.tsx`
- `src/components/ui/link-preview.tsx`
- `src/types/ethereum.d.ts`

Please address the `@typescript-eslint/no-explicit-any` and other ESLint warnings when time permits, then set `eslint.ignoreDuringBuilds` to `false` in `next.config.js` to re-enable strict checks.
