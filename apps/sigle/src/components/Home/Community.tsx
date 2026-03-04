import { Button, Heading, Text } from "@radix-ui/themes";
import { IconArrowRight } from "@tabler/icons-react";

export const HomeCommunity = () => {
  return (
    <section className="mt-20 border-gray-6 border-t">
      <div className="grid md:grid-cols-2">
        {/* GitHub Section */}
        <div className="border-gray-6 border-b md:border-b-0 md:border-r px-4 md:px-20 py-10 flex flex-col gap-5">
          <Heading as="h3" size="4">
            Engage on Github
          </Heading>
          <Text as="p" size="3">
            Don't trust, verify.
            <br />
            Sigle is an open-source platform. You want to contribute to the
            development? Join us and give us a star!
          </Text>
          <div>
            <Button
              variant="outline"
              color="gray"
              highContrast
              className="group"
              asChild
            >
              <a
                href="https://app.sigle.io/github"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Github{" "}
                <IconArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>

          {/* <div className="mt-10 rounded-md overflow-hidden border">
            <div className="bg-zinc-900 p-2 flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-zinc-500"></div>
              <div className="h-3 w-24 rounded-sm bg-zinc-500"></div>
              <div className="h-3 w-16 rounded-sm bg-zinc-500"></div>
              <div className="h-3 w-12 rounded-sm bg-zinc-500"></div>
              <div className="h-3 w-14 rounded-sm bg-zinc-500"></div>
              <div className="h-3 w-10 rounded-sm bg-zinc-500"></div>
            </div>
            <div className="bg-white p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
                <div className="h-2 w-32 rounded-sm bg-zinc-300"></div>
              </div>
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="h-2 w-2 rounded-full bg-zinc-300 mt-1"></div>
                    <div className="h-2 w-48 rounded-sm bg-zinc-300"></div>
                    <div className="h-2 w-32 rounded-sm bg-zinc-300"></div>
                    <div className="h-2 w-16 rounded-sm bg-zinc-300"></div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>

        {/* Discord Section */}
        <div className="px-4 md:px-20 py-10 flex flex-col gap-5">
          <Heading as="h3" size="4">
            Join us on Discord
          </Heading>
          <Text as="p" size="3">
            Our community of thousands of amazing people are collaborating to
            help each other build the next writing platform generation.
          </Text>
          <div>
            <Button
              variant="outline"
              color="gray"
              highContrast
              className="group"
              asChild
            >
              <a
                href="https://app.sigle.io/discord"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the Discord{" "}
                <IconArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
          {/* <div className="mt-10 rounded-md overflow-hidden border">
            <div className="bg-zinc-900 p-2 flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-zinc-500"></div>
              <div className="h-3 w-24 rounded-sm bg-zinc-500"></div>
              <div className="h-3 w-16 rounded-sm bg-zinc-500"></div>
            </div>
            <div className="bg-zinc-800 p-4 flex">
              <div className="w-1/3 space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-600"></div>
                    <div className="h-3 w-16 rounded-sm bg-zinc-600"></div>
                  </div>
                ))}
              </div>
              <div className="w-2/3 space-y-6 pl-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-zinc-600"></div>
                      <div className="h-3 w-24 rounded-sm bg-zinc-600"></div>
                    </div>
                    <div className="h-3 w-full rounded-sm bg-zinc-600"></div>
                    <div className="h-3 w-full rounded-sm bg-zinc-600"></div>
                  </div>
                ))}
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-zinc-400 rounded-md"></div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};
