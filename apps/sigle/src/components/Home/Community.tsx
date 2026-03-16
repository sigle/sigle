// oxlint-disable react/no-array-index-key
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config";

function GitHubMockup() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-foreground/5 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-foreground/20" />
          <div className="size-2.5 rounded-full bg-foreground/20" />
          <div className="size-2.5 rounded-full bg-foreground/20" />
        </div>
        <div className="ml-4 flex flex-1 items-center gap-2">
          <div className="h-2 w-16 rounded-sm bg-foreground/15" />
          <div className="h-2 w-8 rounded-sm bg-foreground/15" />
          <div className="h-2 w-12 rounded-sm bg-foreground/15" />
          <div className="h-2 w-10 rounded-sm bg-foreground/15" />
          <div className="h-2 w-14 rounded-sm bg-foreground/15" />
          <div className="h-2 w-8 rounded-sm bg-foreground/15" />
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-foreground/30" />
          <div className="h-2 w-8 rounded-sm bg-foreground/20" />
        </div>
        <div className="flex items-center gap-4">
          {[12, 16, 14, 10, 18, 12, 14, 16, 10].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-sm bg-foreground/15"
              style={{ width: w * 3 }}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {/* File listing */}
        <div className="rounded-sm border border-border">
          {/* Header row */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-3 py-2">
            <div className="h-2 w-16 rounded-sm bg-foreground/20" />
            <div className="h-2 w-24 rounded-sm bg-foreground/15" />
          </div>

          {/* File rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0"
            >
              <div className="size-1.5 rounded-full bg-foreground/25" />
              <div
                className="h-2 rounded-sm bg-foreground/20"
                style={{ width: 40 + (i % 3) * 20 }}
              />
              <div className="ml-auto flex gap-8">
                <div className="h-2 w-20 rounded-sm bg-foreground/10" />
                <div className="h-2 w-16 rounded-sm bg-foreground/10" />
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
    <div className="mt-6 overflow-hidden rounded-lg bg-[#2b2d31] shadow-sm">
      <div className="flex h-[280px]">
        {/* Server sidebar */}
        <div className="flex w-12 flex-col items-center gap-2 bg-[#1e1f22] py-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="size-8 rounded-full bg-[#36373d]" />
          ))}
        </div>

        {/* Channels */}
        <div className="w-40 bg-[#2b2d31] p-2">
          <div className="mb-3 flex items-center gap-1 px-1">
            <span className="text-[10px] font-semibold text-[#949ba4]">#</span>
            <div className="h-2 w-16 rounded-sm bg-[#949ba4]/30" />
          </div>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="mb-1 flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-[#35373c]"
            >
              <span className="text-[10px] text-[#949ba4]">#</span>
              <div
                className="h-2 rounded-sm bg-[#949ba4]/25"
                style={{ width: 40 + (i % 4) * 12 }}
              />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col bg-[#313338]">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-[#1e1f22] px-3 py-2">
            <span className="text-xs text-[#949ba4]">#</span>
            <div className="h-2 w-16 rounded-sm bg-[#dbdee1]/30" />
          </div>

          {/* Messages area */}
          <div className="flex-1 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-3 flex gap-2">
                <div className="size-8 shrink-0 rounded-full bg-[#5865f2]" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-12 rounded-sm bg-[#dbdee1]/40" />
                    <div className="h-1.5 w-8 rounded-sm bg-[#949ba4]/30" />
                  </div>
                  <div className="h-2 w-32 rounded-sm bg-[#dbdee1]/20" />
                  <div className="h-2 w-24 rounded-sm bg-[#dbdee1]/20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members sidebar */}
        <div className="w-36 bg-[#2b2d31] p-2">
          <div className="mb-2 px-1">
            <div className="h-2 w-16 rounded-sm bg-[#949ba4]/30" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-1 flex items-center gap-2 rounded-sm p-1"
            >
              <div className="size-6 rounded-full bg-[#5865f2]" />
              <div
                className="h-2 rounded-sm bg-[#dbdee1]/25"
                style={{ width: 40 + (i % 3) * 10 }}
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
