import { IconBolt } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const BetaFeedbackButton = () => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="secondary" className="fixed right-4 bottom-4">
            <IconBolt size={16} /> Feedback
          </Button>
        }
      />
      <PopoverContent className="w-96">
        <p className="p-2">
          🚀 Welcome to the Sigle testnet! Please share your feedback in the{" "}
          <a
            href="https://discord.com/channels/794883671730683934/1347591198944002058"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            #beta-sbtc
          </a>{" "}
          channel on Discord.
        </p>
      </PopoverContent>
    </Popover>
  );
};
