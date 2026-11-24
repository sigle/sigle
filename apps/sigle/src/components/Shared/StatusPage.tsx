import { LogoImage } from "@/images/Logo";

interface StatusPageProps {
  /** Shown in mono above the title, such as "404". */
  label: string;
  title: string;
  description: React.ReactNode;
  /** The buttons under the description. */
  children: React.ReactNode;
  /** Replaces the bar with the logo, such as with the site header. */
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/** A full page for an error or a missing page, in the style of the home page. */
export const StatusPage = ({
  label,
  title,
  description,
  children,
  header = (
    <header className="flex h-(--header-height) items-center border-b border-border px-4 md:px-[60px]">
      {/* A plain link reloads the app, so it starts again from a clean state. */}
      <a href="/" aria-label="Sigle home">
        <LogoImage height={28} />
      </a>
    </header>
  ),
  footer,
}: StatusPageProps) => (
  <div className="flex min-h-svh flex-col">
    {header}
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-24">
      <p className="font-mono text-sm text-muted-foreground">{label}</p>
      <h1 className="mt-3 headline text-4xl text-balance md:text-5xl">
        {title}
      </h1>
      <div className="mt-4 text-pretty text-muted-foreground">
        {description}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>
    </main>
    {footer}
  </div>
);
