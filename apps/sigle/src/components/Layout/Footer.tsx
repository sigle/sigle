import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandXFilled,
} from "@tabler/icons-react";
import { appConfig } from "@/config";

const LINKS = [
  { label: "Docs", href: appConfig.docsUrl },
  { label: "Blog", href: appConfig.blogUrl },
  { label: "Support", href: appConfig.discordUrl },
  { label: "Feedback", href: appConfig.feedbackUrl },
];

const SOCIALS = [
  { label: "Sigle on X", href: appConfig.twitterUrl, icon: IconBrandXFilled },
  {
    label: "Sigle on Discord",
    href: appConfig.discordUrl,
    icon: IconBrandDiscordFilled,
  },
  {
    label: "Sigle on GitHub",
    href: appConfig.githubUrl,
    icon: IconBrandGithubFilled,
  },
];

export const Footer = () => {
  return (
    <footer className="mx-auto max-w-5xl px-4">
      <div className="flex flex-col gap-5 border-t border-border pt-8 pb-20 md:flex-row md:items-center md:justify-between md:pb-8">
        <p className="font-mono text-xs text-muted-foreground">
          {/* oxlint-disable-next-line react/purity -- rendered by server components only */}
          © {new Date().getFullYear()} Sigle
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="block text-muted-foreground transition-colors hover:text-foreground"
                >
                  <social.icon size={16} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
