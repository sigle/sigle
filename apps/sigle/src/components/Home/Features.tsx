import { Container, Heading, Text } from "@radix-ui/themes";

export const HomeFeatures = () => {
  return (
    <Container size="4" className="px-4">
      <section className="grid grid-cols-1 gap-x-6 md:grid-cols-3">
        <div className="flex flex-col items-center gap-4 rounded-3 bg-gray-2 p-6 text-center">
          <Heading as="h3" size="4">
            ⛓️ Write on-chain
          </Heading>
          <Text as="p" color="gray" size="3" className="text-balance">
            Inscribe your words as <Text weight="medium">Ordinals</Text> make
            them live forever.
          </Text>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-3 bg-gray-2 p-6 text-center">
          <Heading as="h3" size="4">
            💰 Earn Bitcoin
          </Heading>
          <Text as="p" color="gray" size="3" className="text-balance">
            Turn readers into collectors with direct{" "}
            <Text weight="medium">sBTC</Text> payments to your wallet.
          </Text>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-3 bg-gray-2 p-6 text-center">
          <Heading as="h3" size="4">
            ⚡ Full Control
          </Heading>
          <Text as="p" color="gray" size="3" className="text-balance">
            Your content, your rules. Build anything with our{" "}
            <Text weight="medium">API, SDKs, and developer tools</Text>.
          </Text>
        </div>
      </section>
    </Container>
  );
};
