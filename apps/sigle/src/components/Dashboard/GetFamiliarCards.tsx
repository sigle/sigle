import { appConfig } from "@/config";
import { NextLink } from "../Shared/NextLink";

export const GetFamiliarCards = () => {
  return (
    <div className="space-y-5">
      <p className="font-bold">Get familiar with Sigle</p>

      <div className="grid gap-4 md:grid-cols-2">
        <NextLink
          href={appConfig.docsUrl}
          target="_blank"
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-foreground/20"
        >
          <p className="font-bold">Read the docs</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore the documentation and learn how to use Sigle and its
            features
          </p>
        </NextLink>

        <NextLink
          href="https://app.sigle.io/feedback"
          target="_blank"
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-foreground/20"
        >
          <p className="font-bold">Request a feature</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your ideas and feedback to help us shape the future of Sigle
          </p>
        </NextLink>

        <NextLink
          href="https://app.sigle.io/discord"
          target="_blank"
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-foreground/20"
        >
          <p className="font-bold">Join us on Discord</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect with other Sigle users and get help from the community
          </p>
        </NextLink>

        <NextLink
          href="https://blog.sigle.io"
          target="_blank"
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-foreground/20"
        >
          <p className="font-bold">Read the blog</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay up to date with the latest Sigle news, announcements and
            updates
          </p>
        </NextLink>
      </div>
    </div>
  );
};
