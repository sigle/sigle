import { IconArrowUpRight } from "@tabler/icons-react";
import { appConfig } from "@/config";

const PANELS = [
  {
    title: "Engage on GitHub",
    description:
      "Don't trust, verify. Sigle is open source: read the code, contribute to the development, or give us a star.",
    action: "Go to GitHub",
    href: appConfig.githubUrl,
  },
  {
    title: "Join us on Discord",
    description:
      "A community of writers and builders helping each other shape the next generation of writing platforms.",
    action: "Join the Discord",
    href: appConfig.discordUrl,
  },
];

export const HomeCommunitySection = () => (
  <section className="mx-auto mt-24 max-w-5xl px-4 md:mt-32">
    <div className="grid gap-10 border-t border-border pt-10 md:grid-cols-2 md:gap-8">
      {PANELS.map((panel) => (
        <div key={panel.title} className="flex flex-col items-start">
          <h2 className="headline text-3xl">{panel.title}</h2>
          <p className="mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
            {panel.description}
          </p>
          <a
            href={panel.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            {panel.action}
            <IconArrowUpRight size={14} />
          </a>
        </div>
      ))}
    </div>
  </section>
);
