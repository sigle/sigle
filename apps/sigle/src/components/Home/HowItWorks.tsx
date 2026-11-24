const STEPS = [
  {
    title: "Distraction-free writing",
    description:
      "Just you and the page. No sidebars, no feeds, no notifications, only a quiet editor that stays out of the way while you write.",
  },
  {
    title: "Permanent on Arweave",
    description:
      "Servers shut down; your writing shouldn't. Every published story is archived permanently on Arweave, with an RSS feed.",
  },
  {
    title: "Timestamped on Bitcoin",
    description:
      "Every post automatically receives a free OpenTimestamps (.ots) proof anchored to a Bitcoin block. Verifiable proof of exactly when you wrote it.",
  },
];

export const HomeHowItWorks = () => (
  <section className="mx-auto max-w-5xl px-4">
    <ol className="grid gap-10 border-t border-border pt-10 md:grid-cols-3 md:gap-8">
      {STEPS.map((step, index) => (
        <li key={step.title}>
          <span className="font-mono text-sm text-muted-foreground">
            0{index + 1}
          </span>
          <h2 className="mt-3 headline text-2xl">{step.title}</h2>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  </section>
);
