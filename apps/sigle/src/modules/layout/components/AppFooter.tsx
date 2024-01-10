import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import { IconButton, Text } from '@radix-ui/themes';
import { sigleConfig } from '../../../config';

export const AppFooter = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-center gap-4 border-t border-gray-6 pt-4">
      <div className="flex gap-6">
        <IconButton asChild variant="ghost" color="gray" size="3">
          <a href={sigleConfig.twitterUrl} target="_blank" rel="noreferrer">
            <TwitterLogoIcon />
          </a>
        </IconButton>
        <IconButton asChild variant="ghost" color="gray" size="3">
          <a href={sigleConfig.discordUrl} target="_blank" rel="noreferrer">
            <DiscordLogoIcon />
          </a>
        </IconButton>
        <IconButton asChild variant="ghost" color="gray" size="3">
          <a href={sigleConfig.githubUrl} target="_blank" rel="noreferrer">
            <GitHubLogoIcon />
          </a>
        </IconButton>
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-5 md:flex-row">
        <Text size="1" as="p">
          <a target="_blank" rel="noreferrer" href={sigleConfig.blogUrl}>
            Blog
          </a>
        </Text>
        <Text size="1" as="p">
          <a
            target="_blank"
            rel="noreferrer"
            href={sigleConfig.documentationUrl}
          >
            Documentation
          </a>
        </Text>
        <Text size="1" as="p">
          <a target="_blank" rel="noreferrer" href={sigleConfig.discordUrl}>
            Support
          </a>
        </Text>
        <Text size="1" as="p">
          <a target="_blank" rel="noreferrer" href={sigleConfig.feedbackUrl}>
            Feedback
          </a>
        </Text>
      </div>

      <div className="flex w-full items-center justify-center border-t border-gray-6 py-4">
        <Text size="1" as="p">
          © Sigle {new Date().getFullYear()}
        </Text>
      </div>
    </footer>
  );
};
