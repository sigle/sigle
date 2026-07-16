# sheet

2026-07-16, strategy used: hand migration (engine), verdict: completed successfully.

## Changed

- `apps/custom-domain/src/components/ui/Sheet.tsx`: Migrated from `@radix-ui/react-dialog` to `@base-ui/react/dialog`. Replaced `SheetPrimitive.Overlay` with `DialogPrimitive.Backdrop`, and `SheetPrimitive.Content` with `DialogPrimitive.Popup`. Updated `data-[state=open]` and `data-[state=closed]` states to `data-open` and `data-closed` states.
- `apps/custom-domain/src/components/Layout/Header.tsx`: Replaced `SheetTrigger`'s `asChild` prop with `render={<button>...</button>}` to match Base UI trigger API.

Leftover scan is clean: zero radix-ui imports remain in these files.

## Left alone

None.

## Behavior changes

None.

## Verify by hand

- Open the mobile menu on the custom-domain app.
- Verify the sheet backdrop renders and slides in correctly from the top.
- Verify the sheet closes cleanly when clicking the backdrop, pressing escape, or clicking the close button.
