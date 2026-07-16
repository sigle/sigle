# Project Migration: Radix UI to Base UI

All Radix UI dependencies and wrappers have been successfully migrated to `@base-ui/react`.

## Dependency Summary

- Removed `@radix-ui/react-dialog` from `apps/custom-domain/package.json`.
- Removed `@radix-ui/react-tooltip` from `apps/custom-domain/package.json`.
- Added `@base-ui/react@1.4.1` to `apps/custom-domain/package.json`.

## Migrated Components

- [sheet.md](file:///Users/leo/dev/sigle/sigle/.migration/sheet.md): Migrated `Sheet.tsx` to `@base-ui/react/dialog` and updated consumers.
- [tooltip.md](file:///Users/leo/dev/sigle/sigle/.migration/tooltip.md): Migrated `Tooltip.tsx` to `@base-ui/react/tooltip` and updated consumers.

## Verification

- `pnpm vp check` passed successfully.
- `pnpm build` completed successfully with zero compilation or type issues.

0 wrappers remain on Radix.
