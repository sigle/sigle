// oxlint-disable react/no-array-index-key
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config";

function GitHubMockup() {
  return (
    <div className="mt-6 h-[180px] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-foreground/5 px-3 py-1.5">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-foreground/20" />
          <div className="h-2 w-2 rounded-full bg-foreground/20" />
          <div className="h-2 w-2 rounded-full bg-foreground/20" />
        </div>
        <div className="ml-3 flex flex-1 items-center gap-1.5">
          {[10, 6, 8, 7, 9, 6].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded bg-foreground/15"
              style={{ width: w * 2.5 }}
            />
          ))}
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-1">
          <div className="h-1 w-1 rounded-full bg-foreground/30" />
          <div className="h-1.5 w-6 rounded bg-foreground/20" />
        </div>
        <div className="flex items-center gap-2">
          {[10, 12, 11, 8, 14, 10].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded bg-foreground/15"
              style={{ width: w * 2 }}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="p-2">
        {/* File listing */}
        <div className="rounded border border-border">
          {/* Header row */}
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-2 py-1">
            <div className="h-1.5 w-10 rounded bg-foreground/20" />
            <div className="h-1.5 w-14 rounded bg-foreground/15" />
          </div>

          {/* File rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-b border-border px-2 py-1 last:border-b-0"
            >
              <div className="h-1 w-1 rounded-full bg-foreground/25" />
              <div
                className="h-1.5 rounded bg-foreground/20"
                style={{ width: 28 + (i % 3) * 12 }}
              />
              <div className="ml-auto flex gap-4">
                <div className="h-1.5 w-12 rounded bg-foreground/10" />
                <div className="h-1.5 w-10 rounded bg-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscordMockup() {
  return (
    <div className="mt-6 h-[180px] overflow-hidden rounded-lg bg-[#2b2d31] shadow-sm">
      <div className="flex h-full">
        {/* Server sidebar */}
        <div className="flex w-10 flex-col items-center gap-1.5 bg-[#1e1f22] py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-[#36373d]" />
          ))}
        </div>

        {/* Channels */}
        <div className="w-28 bg-[#2b2d31] p-1.5">
          <div className="mb-2 flex items-center gap-1 px-1">
            <span className="text-[8px] font-semibold text-[#949ba4]">#</span>
            <div className="h-1.5 w-12 rounded bg-[#949ba4]/30" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-0.5 flex items-center gap-1 rounded px-1.5 py-0.5"
            >
              <span className="text-[8px] text-[#949ba4]">#</span>
              <div
                className="h-1.5 rounded bg-[#949ba4]/25"
                style={{ width: 28 + (i % 4) * 8 }}
              />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col bg-[#313338]">
          {/* Header */}
          <div className="flex items-center gap-1.5 border-b border-[#1e1f22] px-2 py-1.5">
            <span className="text-[8px] text-[#949ba4]">#</span>
            <div className="h-1.5 w-12 rounded bg-[#dbdee1]/30" />
          </div>

          {/* Messages area */}
          <div className="flex-1 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-2 flex gap-1.5">
                <div className="h-5 w-5 shrink-0 rounded-full bg-[#5865f2]" />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-8 rounded bg-[#dbdee1]/40" />
                    <div className="h-1 w-6 rounded bg-[#949ba4]/30" />
                  </div>
                  <div className="h-1.5 w-20 rounded bg-[#dbdee1]/20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members sidebar */}
        <div className="hidden w-24 bg-[#2b2d31] p-1.5 lg:block">
          <div className="mb-1.5 px-1">
            <div className="h-1.5 w-12 rounded bg-[#949ba4]/30" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="mb-0.5 flex items-center gap-1.5 rounded px-1 py-0.5"
            >
              <div className="h-4 w-4 rounded-full bg-[#5865f2]" />
              <div
                className="h-1.5 rounded bg-[#dbdee1]/25"
                style={{ width: 28 + (i % 3) * 8 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeCommunitySection() {
  return (
    <section className="mt-10 border-y border-border md:mt-20">
      <div className="grid md:grid-cols-2">
        {/* GitHub panel */}
        <div className="bg-secondary/50 p-8 md:p-12 lg:p-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Engage on GitHub
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            Don&apos;t trust, verify.
            <br />
            Sigle is an open-source platform. Want to contribute to the
            development? Join us and give us a star!
          </p>
          <Button
            variant="outline"
            className="mt-6"
            render={
              <a
                href={appConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to GitHub
                <IconArrowRight className="size-4" />
              </a>
            }
          />

          <GitHubMockup />
        </div>

        {/* Discord panel */}
        <div className="bg-background p-8 md:p-12 lg:p-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Join us on Discord
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            Our community of thousands of amazing people are collaborating to
            help each other build the next writing platform generation.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            render={
              <a
                href={appConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the Discord
                <IconArrowRight className="size-4" />
              </a>
            }
          />
          <DiscordMockup />
        </div>
      </div>
    </section>
  );
}
