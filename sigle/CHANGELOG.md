# @sigle/app

## 1.2.0

### Minor Changes

- 90aa0ed: Improve the view when editor is loading.
- 33eea68: Header is visible when scrolling up so users are able to save, publish and access settings at any time when writing.
- cc136d7: Added dark theme support, you can find the dark theme toggle in the dropdown menu.
- f00586a: Add new dashboard layout
- d16f74d: Adjust style of dropdown menu.
- 16ab92d: Add clarity highlighting for code blocks.
- 3b57667: Replace hover card with dropdown menu in header.

  Move theme switch into dropdown.

  Move blog link into dropdown.

- a834174: Add buttons to allow users to share articles on social media.
- 34eec36: Add page for registering a username (layout only).
- ef35f44: Trying to quit or close the editor page with unsaved changes will now prompt a warning.
- 85fde42: Redesign story cards for desktop and mobile.
- db19118: Add dark mode support with feature flag enabled.
- 8fe8252: Update the content shown when the list of blog posts are empty.

### Patch Changes

- 0322c20: Fix code blocks not displaying with the correct styling on dark mode.
- 28a967f: Remove underline on hover showing on links outside of the public story.
- b17cd8c: Add clearer interactive states for dropdown items.
- a771420: Fix incorrect text colors on dark mode in dialog modal and settings page.
- c1eabf3: Fix the github icon pointing to twitter while logged out.
- 3c6fd11: Fix issue with share widgets incorrectly displaying author and article url.
- baaa19a: Update title color on public story cards.
- 7d57960: Fix creation date for stories not working after the new editor release.
- c0614bb: Fix editor header appearing over settings dialog.
- 256cba1: Add a header to the blog page.
- 464dd64: Use button component for header dropdown trigger.
- a622863: Fix issues with text color on dark mode for twitter preview cards and settings menu inputs.

## 1.1.1

### Patch Changes

- dc163d3: Add missing Link shortcut.
- da6d41a: Fix hints layout issue.
- 91b23dd: Fix an issue when uploading large images/gifs in the editor and changing the focus before the upload is finished.

## 1.1.0

### Minor Changes

- 46a0a95: New editor is live! See https://app.sigle.io/sigleapp.id.blockstack/zsoVIi3V6CE55-ygCdjVG to see what's new.

## 1.0.0

### Major Changes

- d7ac262: First major version to have concistent versionning after this release.

## 0.4.0

### Minor Changes

- 52ed980: Add dialog with editor shortcuts and hints.
- 7c5cdb3: Add hover card to allow users to logout on published story page.
- ce7e030: Add footer to login page.

### Patch Changes

- 1a4d94c: Fix horizontal scroll appearing on mobile screen sizes.
- 8bc7a11: Create feature flag for the Hiro wallet integration.
- 2660d62: Fix language issue when displaying code blocks.

## 0.3.0

### Minor Changes

- 407f2f9: Experimental editor: sanitize HTML.
- 578ba84: Add a word count to the editor.
- 067c1c4: Experimental editor: improve cover image behavior.
- 1f38066: Redesign public story page.
  Update app header for logged out users.

### Patch Changes

- 2928b7b: Experimental Editor: save flag in local storage.
- 60d1596: Add interactive styling to back arrow.
- 505d9f6: Redesign the editor settings modal.
- 4d83892: Migrate styles from styled components to Stitches.
- 69b9b64: Fix word count showing on published story page.

## 0.2.0

### Minor Changes

- 832fbd4: Experimental editor: import old stories into the new editor.

### Patch Changes

- cac9e57: Fix css injection order creating an issue with buttons that have background color.
- a0efe0b: Remove Help page and replace help link in dashboard with the feedback link.
- 39f97d0: Experimental editor: only allow paragraphs in blockquote blocks.

## 0.1.1

### Patch Changes

- 723da11: Experimental editor: public rendering of the new articles.

## 0.1.0

### Minor Changes

- c457229: Experimental editor: new content style.

### Patch Changes

- ea45711: Migrate GitHub repository to the sigle organisation.
- 4e773c5: Experimental editor: add strikethrough support.
- 4e773c5: Experimental editor: add underline support.

## 0.0.1

### Patch Changes

- 83ba5b0: First version published via changesets.
