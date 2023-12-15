import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  SunIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import { Button, Flex, IconButton } from '@radix-ui/themes';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { sigleConfig } from '@/config';

export const HeaderLoggedOut = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  return (
    <>
      <Button size="2" variant="ghost" color="gray" highContrast asChild>
        <Link href="/explore">Explore</Link>
      </Button>
      <Flex gap="6" align="center">
        <IconButton size="2" variant="ghost" color="gray" asChild>
          <a href={sigleConfig.twitterUrl} target="_blank" rel="noreferrer">
            <TwitterLogoIcon />
          </a>
        </IconButton>
        <IconButton size="2" variant="ghost" color="gray" asChild>
          <a href={sigleConfig.discordUrl} target="_blank" rel="noreferrer">
            <DiscordLogoIcon />
          </a>
        </IconButton>
        <IconButton size="2" variant="ghost" color="gray" asChild>
          <a href={sigleConfig.githubUrl} target="_blank" rel="noreferrer">
            <GitHubLogoIcon />
          </a>
        </IconButton>
      </Flex>
      <Button size="2" color="gray" highContrast asChild>
        <Link href="/login">Enter App</Link>
      </Button>
      <IconButton size="2" variant="ghost" color="gray" onClick={toggleTheme}>
        <SunIcon />
      </IconButton>
    </>
  );
};
