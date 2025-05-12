import { appConfig } from "@/config";
import { Container, IconButton, Link, Separator, Text } from "@radix-ui/themes";
import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandXFilled,
} from "@tabler/icons-react";

export const Footer = () => {
  return (
    <footer>
      <Container className="px-4">
        <Separator size="4" color="gray" />
        <div className="flex flex-col items-center justify-between py-7 md:flex-row">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-4">
              <Text size="2" color="gray">
                © {new Date().getFullYear()} Sigle
              </Text>
              <IconButton variant="ghost" color="gray" asChild>
                <a
                  href="https://app.sigle.io/twitter"
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconBrandXFilled size={16} />
                </a>
              </IconButton>
              <IconButton variant="ghost" color="gray" asChild>
                <a
                  href="https://app.sigle.io/discord"
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconBrandDiscordFilled size={16} />
                </a>
              </IconButton>
              <IconButton variant="ghost" color="gray" asChild>
                <a
                  href="https://app.sigle.io/github"
                  target="_blank"
                  rel="noreferrer"
                >
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
                href="https://app.sigle.io/discord"
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
