import { Button, Popover } from "@radix-ui/themes";
import { IconBolt } from "@tabler/icons-react";

export const BetaFeedbackButton = () => {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="soft" className="fixed bottom-4 right-4">
          <IconBolt size={16} />
          Beta Feedback
        </Button>
      </Popover.Trigger>
      <Popover.Content width="360px">
        <div className="flex flex-col gap-3">
          🚀 Welcome to the Sigle testnet! Please share your feedback with us on
          Discord.
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
