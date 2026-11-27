import { IconArrowUpRight } from "@tabler/icons-react";
import { appConfig } from "@/config";

const LINKS = [
  {
    title: "Read the docs",
    description: "Learn how Sigle works and how to use its features.",
    href: appConfig.docsUrl,
  },
  {
    title: "Request a feature",
    description: "Share your ideas to help shape what comes next.",
    href: appConfig.feedbackUrl,
  },
  {
    title: "Join us on Discord",
    description: "Meet other writers and get help from the community.",
    href: appConfig.discordUrl,
  },
  {
    title: "Read the blog",
    description: "News, announcements and product updates.",
    href: appConfig.blogUrl,
  },
];

export const GetFamiliarCards = () => (
  <section>
    <h3 className="headline text-2xl">Get familiar with Sigle</h3>

    <ul className="mt-4 grid border-t border-border md:grid-cols-2 md:gap-x-8">
      {LINKS.map((link) => (
        <li key={link.title} className="border-b border-border">
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start justify-between gap-4 py-4"
          >
            <span>
              <span className="block text-sm font-medium underline-offset-4 group-hover:underline">
                {link.title}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {link.description}
              </span>
            </span>
            <IconArrowUpRight
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground transition group-hover:text-foreground"
            />
          </a>
        </li>
      ))}
    </ul>
  </section>
);
