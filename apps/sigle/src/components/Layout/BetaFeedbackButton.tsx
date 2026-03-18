import { Popover } from "@radix-ui/themes";
import { IconBolt } from "@tabler/icons-react";
import { Button } from "../ui/button";

export const BetaFeedbackButton = () => {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="secondary" className="fixed right-4 bottom-4">
          <IconBolt size={16} /> Feedback
        </Button>
      </Popover.Trigger>
      <Popover.Content width="360px">
        <div>
          🚀 Welcome to the Sigle testnet! Please share your feedback in the{" "}
          <a
            href="https://discord.com/channels/794883671730683934/1347591198944002058"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            #beta-sbtc
          </a>{" "}
          channel on Discord.
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
