import { Container, IconButton, Link } from "@radix-ui/themes";
import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandXFilled,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { appConfig } from "@/config";

export const Footer = () => {
  return (
    <footer>
      <Container className="px-4">
        <Separator />
        <div className="flex flex-col items-center justify-between py-7 md:flex-row">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Sigle
              </p>
              <IconButton variant="ghost" color="gray" asChild>
                <a href={appConfig.twitterUrl} target="_blank" rel="noreferrer">
                  <IconBrandXFilled size={16} />
                </a>
              </IconButton>
              <IconButton variant="ghost" color="gray" asChild>
                <a href={appConfig.discordUrl} target="_blank" rel="noreferrer">
                  <IconBrandDiscordFilled size={16} />
                </a>
              </IconButton>
              <IconButton variant="ghost" color="gray" asChild>
                <a href={appConfig.githubUrl} target="_blank" rel="noreferrer">
                  <IconBrandGithubFilled size={16} />
                </a>
              </IconButton>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
            <li>
              <Link
                size="2"
                color="gray"
                href={appConfig.docsUrl}
                target="_blank"
              >
                Docs
              </Link>
            </li>
            <li>
              <Link
                size="2"
                color="gray"
                href="https://blog.sigle.io"
                target="_blank"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                size="2"
                color="gray"
                href={appConfig.discordUrl}
                target="_blank"
              >
                Support
              </Link>
            </li>
            <li>
              <Link
                size="2"
                color="gray"
                href="https://app.sigle.io/feedback"
                target="_blank"
              >
                Feedback
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
};
