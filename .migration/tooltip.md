# tooltip

2026-07-16, strategy used: hand migration (engine), verdict: completed successfully.

## Changed

- `apps/custom-domain/src/components/ui/Tooltip.tsx`: Migrated from `@radix-ui/react-tooltip` to `@base-ui/react/tooltip`. Restructured `TooltipContent` to use the Base UI positioner pattern (`Portal > Positioner > Popup`).
- `apps/custom-domain/src/components/Post/ShareSocial.tsx`: Replaced `asChild` with `render` on `TooltipTrigger`. Moved `delayDuration={200}` to `delay={200}` on `TooltipTrigger` and set up controlled trigger states.

Leftover scan is clean: zero radix-ui imports remain in these files.

## Left alone

None.

## Behavior changes

None.

## Verify by hand

- Hover over the social share icons on a post page in the custom-domain app.
- Verify the tooltip pops up after a short delay (200ms) with the correct label.
- Verify it dismisses on mouse leave.
