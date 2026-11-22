import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandXFilled,
} from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { appConfig } from "@/config";

export const Footer = () => {
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4">
        <Separator />
        <div className="flex flex-col items-center justify-between py-7 md:flex-row">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Sigle
              </p>
              <a
                href={appConfig.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <IconBrandXFilled className="text-muted-foreground" size={16} />
              </a>
              <a
                href={appConfig.discordUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <IconBrandDiscordFilled
                  className="text-muted-foreground"
                  size={16}
                />
              </a>
              <a
                href={appConfig.githubUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <IconBrandGithubFilled
                  className="text-muted-foreground"
                  size={16}
                />
              </a>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
            <li>
              <a
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                href={appConfig.docsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Docs
              </a>
            </li>
            <li>
              <a
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                href="https://blog.sigle.io"
                target="_blank"
                rel="noreferrer"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                href={appConfig.discordUrl}
                target="_blank"
                rel="noreferrer"
              >
                Support
              </a>
            </li>
            <li>
              <a
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                href="https://app.sigle.io/feedback"
                target="_blank"
                rel="noreferrer"
              >
                Feedback
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
