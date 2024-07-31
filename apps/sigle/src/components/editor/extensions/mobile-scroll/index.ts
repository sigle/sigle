// Inspired by https://github.com/kongdivin/prosemirror-scroll2cursor
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const options: {
  scrollerElement?: HTMLElement;
  computeScrollTop?: () => number;
  delay?: number;
  debugMode?: boolean;
} = {};
const DEFAULT_DELAY = 10;
const DEFAULT_OFFSET_BOTTOM = 80;
const DEFAULT_OFFEST_TOP = 0;
const DEFAULT_SCROLL_DISTANCE = 56;
let timeoutScroll: ReturnType<typeof setTimeout>;

const MobileScroll = Extension.create({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('mobile-scroll'),
        props: {
          handleScrollToSelection(view) {
            const offsetBottom = DEFAULT_OFFSET_BOTTOM;
            const offsetTop = DEFAULT_OFFEST_TOP;
            const scrollDistance = DEFAULT_SCROLL_DISTANCE;
            const scrollerHeight = window.innerHeight;

            if (scrollerHeight <= offsetBottom + offsetTop + scrollDistance) {
              return false;
            }

            timeoutScroll && clearTimeout(timeoutScroll);
            timeoutScroll = setTimeout(function () {
              const top =
                view.coordsAtPos(view.state.selection.$head.pos).top -
                (options?.scrollerElement?.getBoundingClientRect().top ?? 0);

              const scrollTop = options?.computeScrollTop
                ? options.computeScrollTop()
                : (options?.scrollerElement?.scrollTop ??
                  (window.pageYOffset ||
                    document.documentElement.scrollTop ||
                    document.body.scrollTop) ??
                  -1);

              if (scrollTop === -1) {
                options?.debugMode &&
                  console.error('The plugin could not determine scrollTop');
                return;
              }

              const offBottom = top + offsetBottom - scrollerHeight;
              if (offBottom > 0) {
                scrollTo(0, scrollTop + offBottom + scrollDistance);
                return;
              }

              const offTop = top - offsetTop;
              if (offTop < 0) {
                scrollTo(0, scrollTop + offTop - scrollDistance);
              }
            }, options?.delay ?? DEFAULT_DELAY);

            return true;
          },
        },
      }),
    ];
  },
});

export { MobileScroll as TipTapMobileScroll };
