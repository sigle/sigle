import { Card, Text } from "@radix-ui/themes";
import { appConfig } from "@/config";
import { NextLink } from "../Shared/NextLink";

export const GetFamiliarCards = () => {
  return (
    <div className="space-y-5">
      <Text as="div" size="3" weight="bold" color="gray">
        Get familiar with Sigle
      </Text>

      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="surface" size="2" asChild>
          <NextLink href={appConfig.docsUrl} target="_blank">
            <Text as="div" size="3" weight="bold">
              Read the docs
            </Text>
            <Text as="div" color="gray" size="2" mt="1">
              Explore the documentation and learn how to use Sigle and its
              features
            </Text>
          </NextLink>
        </Card>

        <Card variant="surface" size="2" asChild>
          <NextLink href="https://app.sigle.io/feedback" target="_blank">
            <Text as="div" size="3" weight="bold">
              Request a feature
            </Text>
            <Text as="div" color="gray" size="2" mt="1">
              Share your ideas and feedback to help us shape the future of Sigle
            </Text>
          </NextLink>
        </Card>

        <Card variant="surface" size="2" asChild>
          <NextLink href="https://app.sigle.io/discord" target="_blank">
            <Text as="div" size="3" weight="bold">
              Join us on Discord
            </Text>
            <Text as="div" color="gray" size="2" mt="1">
              Connect with other Sigle users and get help from the community
            </Text>
          </NextLink>
        </Card>

        <Card variant="surface" size="2" asChild>
          <NextLink href="https://blog.sigle.io" target="_blank">
            <Text as="div" size="3" weight="bold">
              Read the blog
            </Text>
            <Text as="div" color="gray" size="2" mt="1">
              Stay up to date with the latest Sigle news, announcements and
              updates
            </Text>
          </NextLink>
        </Card>
      </div>
    </div>
  );
};
