import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { Separator, Text, IconButton } from '@radix-ui/themes';
import { slashCommands } from '@/components/editor/extensions/slash-command/commands';
import { ToolbarMenu } from './ToolbarMenu';
import { MobileFloatingMenu } from './ToolbarFloatingMenu';

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [position, setPosition] = useState<number>();
  const [softKeyboardIsOpen, setSoftKeyboardIsOpen] = useState(false);
  const scrollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const image = slashCommands.find((item) => item.title === 'Image');

  useEffect(() => {
    window.visualViewport?.addEventListener('resize', () => {
      // detects if virtual keyboard has opened, however an imperfect solution but the best option for iOS browsers currently as it does not yet support Virtual Keyboard API
      setSoftKeyboardIsOpen(!softKeyboardIsOpen);
      handleSetPosition();
    });
    window.visualViewport?.addEventListener('scroll', handleSetPosition);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleSetPosition);
      window.visualViewport?.removeEventListener('scroll', handleSetPosition);
    };
  }, []);

  const handleSetPosition = () => {
    if (pendingUpdate) {
      return;
    }

    if (scrollRef) {
      window.clearTimeout(scrollRef.current as ReturnType<typeof setTimeout>);

      // debounce update to toolbar position on scroll
      scrollRef.current = setTimeout(() => {
        setPendingUpdate(true);

        requestAnimationFrame(() => {
          setPendingUpdate(false);

          const topOffset = window.visualViewport?.offsetTop || 0;

          if (topOffset >= 0) {
            setPosition(
              Math.max(
                0,
                window.innerHeight -
                  (window.visualViewport?.height || 0) -
                  (window.visualViewport?.offsetTop || 0),
              ),
            );
          }
        });
      }, 150);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 gap-5 fixed bottom-0 z-0 justify-self-start overflow-x-scroll left-0 right-0 bg-gray-1 border-t border-gray-6"
      style={{
        transform: `translateY(-${position}px)`,
        transition: 'transform .25s',
      }}
    >
      <MobileFloatingMenu
        editor={editor}
        triggerDisabled={!softKeyboardIsOpen}
      />
      {editor && (
        <div className="flex gap-5 items-center not-prose">
          <ToolbarMenu editor={editor} />
          <Separator orientation="vertical" size="2" />
          {image && (
            <IconButton
              variant="ghost"
              color="gray"
              onClick={() => image.command({ editor: editor })}
            >
              <image.icon width={20} height={20} />
            </IconButton>
          )}
          <Separator orientation="vertical" size="2" />
          <Text as="p" size="1" color="gray" className="text-nowrap">
            {editor.storage.characterCount.words()} words
          </Text>
        </div>
      )}
    </div>
  );
};
