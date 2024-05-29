# @sigle/app

## 1.8.0

### Minor Changes

- 2b4c09c: Add redirection shortlinks, eg: /github, /gamma etc.
- fc904ca: New mobile drawer menu.
- fbdf1bb: Auto-generate react-query hooks from server openapi spec.
- 4b79196: Create migration flow for the old legacy accounts.
- e822f67: Remove "Blockstack connect" (legacy login) from the app.
- d1b9877: Improve contributing workflow and onboarding documents. Introduce a new Docker Compose file to easily run all the services locally.
- 97d8e57: Move sigle to apps folder in the monorepo.
- 9f5fbcf: Use next/font to optimise the font loading process.
- fec6a40: Change register username page to point users to buy a new .btc username as the subdomains registration is currently not working.
- 15f6e3f: Upgrade from node 18 to node 20.

### Patch Changes

- 078514a: New route that handles a new story creation.
- e61fadb: Fix error 500 when Hiro API block the request.
- ce273c6: Use new design system Dialog component.
- 945c13c: Use new design system Tooltip component.
- 3635954: Add Tailwind to the sigle instead of relying on the @sigle/tailwind-style package.
- ad6ab06: Use route handlers for shortlinks.
- 918b8db: Use new design system ScrollArea component.
- d01e288: Upgrade Stacks packages and update Hiro wallet references to Leather wallet.
- 9f5fbcf: Create an optimised docker image with layers to run the E2E tests locally.
- df61278: Set public stories meta robots as nofollow to avoid spammers to use Sigle as a backlink.
- fc904ca: Use new design system Switch component.
- 0cdc950: Use new design system HoverCard component.
- 476714a: Fix canonical url creating duplicated user content with custom domain.
- 3727425: Remove next.js page extension in files.
- 352d81f: Migrate app header to new design system.
- 26d2c46: New eslint rule to configure import order.
- fcc10f1: Lazy load the story list in the dashboard to do less calls to Gaia and avoid getting rate limited.
- 568b93e: Refactor app header component.
- 85d5b8e: Use new design system Tab component.
- 9f73ece: Upgrade next.js to v14.
- c47af3a: Fix to better handle the case where a user has a free subdomain and a .btc domain linked to the same address.
- ccb83fa: Lazy load images in story cards to do less calls to Gaia and avoid getting rate limited.
- 90464f6: Change chrome e2e flags to make tests more consistants.
- 8c2555d: Use new design system RadioGroup component.
- 992bd61: Setup @radix-ui/themes configuration for the new design system.
- cba2dd7: Update Stacks.js deps to fix a wallet select issue when logging in.
- 8a5feec: Add sonner instead of react-toastify for the toast components.
- 5f4b7c2: Migrate to sentry 8.
- d82a66c: Use new design system DropdownMenu component.

## 1.7.0

### Minor Changes

- 70bc06f: Add ability to select the mailjet list where you send emails to.
- 1b4307e: Remove whitelist for newsletter.
- 6a0094c: Add ability to select the sender address where emails are sent from.
- 1b6f792: Setup E2E tests to catch visual regressions.

### Patch Changes

- 823ff8c: Add Enterprise plan.
- 0e2e852: Allow x.com links in the twitter embeds.
- 614ad4f: Fix Vercel bundle issue by excluding swc from outputs.
- ff85fa9: Refactor editor BubbleMenu component.
- ce3d0d9: Upgrade next.js to 13.4.
- 81518f0: e2e: public story page
- 81d0f83: Simplify local env setup by using .env.development file.
- 5f4bf2d: Add newsletter item back to settings.
- 1c96e7a: Protect custom domain page for user with subscriptions.

## 1.6.0

### Minor Changes

- 20a3bab: Create new newsletter page to manage settings.
- fb985c8: Add private data and newsletter page in the settings.
- e47a331: Change subscription NFT logic.
- b5bfa7f: Add subscribe button and modal to profile page and profile card.
- 4fdcb82: Add login modal prompt when a logged out user tries to follow someone on the explore, public profile and public story pages.
- 3b8e2b8: Add option for writer to include CTA button in their stories.
- 6751b95: User can now send test emails before publishing a story.
- c9ea43a: Add newsletter card at the bottom of the public story page.
  Add Form Control Group component.
- 3a1150b: Add settings page to manate current user email.
- 1d502b5: Allow users to add a canonical link to their stories via the editor settings.
- 3a1150b: Prefill user email when subscribing if user has email set.

### Patch Changes

- f422cb4: Fix BNS without profile not being detected.
- 5c1ca77: Upgrade to pnpm 8.
- 3d9cab2: Connect to the publish workflow REST routes.
- 4ffeb6d: Use new Hiro API endpoint.
- 5fff7a1: Fix incorrect signing state persisting on cancel and when a user goes back to change account.
- e1d7424: Prepare new publish flow dialog.
- 5b63bdf: Add temporary themed button for halloween festivities.
- 789c660: Fix issue when user has both .id.blockstack and .btc
- 0886170: Show Mailjet dashboard button once newsletter is configured.
- 44c80ba: Add sender email UI.
- 82b177b: Fix cover image not showing in story list.
- c5d3cd8: Fix invalid BNS not properly detected when zonfile value was not set.
- 8961a96: Connect subscribe form to backend.
- 340daae: Upgrade to next 13.2.
- 73b9249: Update newsletter plan information.
- 061d90f: Add and serve email assets.
- 81ce771: Upgrade TipTap to v2 stable version.
- 6c9de54: Enable email capture for Sigle blog.
- b4169bc: Redirect sigleapp.id.blockstack to sigle.btc.
- 05b58e7: Add a message on the plans page for legacy users.
- 7f3cf17: Update normal buttons and icon buttons with new variants and styles.
  Resize button instances across the app.
- 5b23ad2: Logic to only send a newsletter once.
- 71fb013: Fix keyboard shorcuts closing the subscribe modal instead of submitting the form.
- 97f0cca: Editor: convert common text patterns with the correct typographic character.

## 1.5.0

### Minor Changes

- 72227af: Add twitter extension to the editor.
- 252f151: Add bubble menu to mobile toolbar.
- 5b4d49a: Updates floating menu items font size.
  Adds label for basic commands section.
  Adds plain text item to menu.
  Reorders menu items.
- 91f7cea: Improve the experience of drag and drop for story cover image.
- 98f14ed: Update editor placeholder text on mobile.
- 58607f4: Add drag and drop to the editor. You can now upload one to many images directly.
- 09ed2ce: Update user card styles to be more responsive on mobile views.

### Patch Changes

- 010410e: Fix SSR issue when rendering the editor.
- a6c5f0c: Fix sharing post on Twitter with special chars.
- bd280d7: Add horizontal scroll on compare plans table for mobile views.
- f57ba15: Fix Plain Text node not activating on mobile.
- 2093d2f: Fix cover images exceeding width of the page on mobile.
  Make editor header full width of the container.
- 195be81: Fix issue with mobile header logo not navigating back to drafts when on a different route.
- 57da686: Fix follow counter not updating after follow or unfollow action.
- 7663f70: Fix missing box shadow for floating menu on light mode.
- 454bede: Add missing accordion menu to tablet views.
- ca66a8b: Fix issue with interactive styles still showing on images in public stories.
- e0ba667: Update plus icon styling.
- 7e03000: Fix ssr issue where articles where not rendered properly.
- 6aa23a5: Make profile page responsive on mobile.
- e8591d5: Add card for pen run contest.
- a9c081a: Add boring avatar as a fallback option when sharing a profile page without a PFP set by the user.
  Encode image URL to display images with special characters correctly.
- c103bf0: Fix editor toolbar scroll issue on mobile.
- 92c8820: Update tooltip styles.
  Update subparagraph line height value.
- 24e60ba: Add prompt to explore and find writers if a user has no content on their feed.
  Update style of page heading.
- d0b0aeb: Update word count font size.
  Update title placeholder color.

## 1.4.0

### Minor Changes

- 696ef4f: Display The Explorer Guild creator + badge on the profile page of a user.
- a43d4ed: Redesign the header dropdown menu.
  Add profile page to the dashboard.
- c004528: Add social following system, you can follow other users and see their posts in your feed.
- f17096d: Add explore page to discover writers using the platform.
- ad2f94f: Add edit button to profile page.
- 1c8f8dc: Improve the login flow by including steps with progress indicators.
- 9fdc428: Make editor header responsive for mobile view.
- 9312e2f: Improve the editor placeholder behavior to give more context.
- 8e5e096: Improve editor slash command, scroll with keyboard navigation, press escape to close.
- 361ae92: Add mobile header with drag-to-close functionality.
- 5a41079: Show card displaying user information when hovering their name or avatar on the article page.
- 4320ab3: Add RSS auto-discovery for all the blogs. So browser and RSS readers can automatically find the RSS feed of the blog.
- 4217167: Add following and follower tabs to the profile page.

### Patch Changes

- 0db7bcd: Fix issue with the profile tab not navigating to profile page.
- fceff6f: Upgrade next-themes to 0.2.0.
- e2a7843: Upgrade radix packages to v1.
- 1df1356: Fix vercel preview env.
- 0d1ae50: Fix profile image not centered on profile page.
- 074786f: Add infinite loading to explore page.
- 94326a6: Enable react strict mode.
- b6c609b: Upgrade react to v18.
- 41c1a3f: Generate openapi typescript client for type safe calls to the Sigle api.
- dfae2fc: Update react-query to v4.
- 1cf7a95: Upgrade tiptap packages.
- c7a1ccc: Update typography styles for mobile and tablet views.

## 1.3.0

### Minor Changes

- 6764f3b: Add analytics, you can now track how your content performs.
- 47eff66: New settings layout and first version of the plan page.
- dea06e3: Allow users to add their website link and twitter handle in the settings, to be shown on the new profile pages.
- 1cb8aa1: Enable Hiro wallet login for everyone and change login for new login flow, step 1.
- 3c0b423: Redesign the story cards on the public profile page.
- fa801a0: Update profile image upload component in settings.
  Update App header to include a pfp next to username in the dropdown trigger.
  Update public story to have pfp alongside username and date.
- 84bf1ac: Redesign the public profile page by adding a new stories tab and a copyable stx address to bio.
- 1fe1fc1: Custom SEO when sharing profile pages.

### Patch Changes

- e8cdf22: (Beta) Compare plans page with table including features and tiers.
- cfee6cc: (Beta) Create the analytics referrer API.
- e20417c: Create new Typography UI component.
- a13149f: Fix a react ssr hydratation issue when using feature flags.
- fc5c542: Fix issue when selecting all in the stats view.
- e1a904a: Upgrade stacks.js dependencies to v4.3.0.
- 134aa5a: Update the delay duration of the Tooltip on the Compare Plans page.
- e087b2c: Fix the dialog trigger no longer appearing on the editor.
- cdf1e4d: Fix invalid website issue in the settings when saving.
- e84890e: (Beta) Create the analytics historical API.
- bdc959e: Fix chart issue when values are close by changing the curve.
- 9ccdf5a: (Beta) Fix height issues with referrers frame.
- b2a8c4c: Fix image not updating properly when saving.
- 693a6f9: (Beta) Allow user to sign a message to authenticate requests sent to the server.
- 725ac37: Remove babel and styled components and use swc as a compiler.
- 2459689: (Beta) Show real analytics data.
- 53a16fc: Return user stacks info for the user public pages.
- 03eda89: Add steps to the login page for signing the message.
- 6e6fe0d: (Beta) Users can now decide to login with the Hiro web wallet.
- 269dc65: (Beta) Replace error component in analytics with design system component.
- f49423b: Move `Write a story` CTA to sidebar menu.
- 3883a37: (Beta) Create analytics story performance API.
- ce01fde: (Beta) Creator plus plan page in the plans.
- 5305860: (Beta) Add compare plans page containing a modal where users can link their NFTs to access the creator plus plan.
- bf2bb5a: Migrate analytics API to server.
- 0a16488: (Beta) Add tabbable graph views to display views and visits stats for a user's blog.
- a91dcd2: Update settings form components.
- 6f9a2ce: (Beta) Add locked view for if a user doesn't have an Explorer Guild NFT in their wallet.
- 0fcf76a: Display custom username in the header and on stories, or fallback to default username.
- 124ff13: Show error for Blockstack connect without usernames.
- ccc1bd4: (Beta) Display total views and visitors for the different time periods.
- 119f119: Refactor pages testing structure.
- 2b1c0ca: Improve Stacks next.js config to remove polyfills from bundle size.
- c0a5720: (Beta) Create UI with dummy data for referrers on analytics page.
- ffbe6c2: Fix message signature broken by new Hiro release.
- 826a78e: Fix source of the issue with editor header appearing over settings dialog.
- b739e8c: Fix validation when website field is empty in the settings.
- 808c04e: (Beta) Add analytics page for individual stories.
  (Beta) Replace placeholder data with data coming from API for story views and referrers.
- 566e76b: Fix image issue in the rss feed.
- 50753f2: Fix header width on profile page.
- 88348ca: (Beta) Add analytics page containing a paginated frame for published stories.
- f6e01e8: Update SEO meta tags.
- 1f1d696: Detect and show guide when BNS missconfiguration is detected.

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
