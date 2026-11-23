import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QUESTIONS = [
  {
    question: "What happens to my posts if Sigle shuts down?",
    answer:
      "They stay online. The full text of every published post is stored on Arweave, signed by your wallet and timestamped on Bitcoin. Anyone can read it from an Arweave gateway and verify that you wrote it, without going through Sigle.",
  },
  {
    question: "Do I need crypto or a .btc name?",
    answer:
      "You need a Stacks wallet, such as Leather or Xverse, but no tokens: signing in and publishing only ask your wallet to sign a message, so there are no fees. A .btc name is optional, and you can publish under your wallet address. The one exception is Pro, which is unlocked by holding an Explorer Guild NFT.",
  },
  {
    question: "Can I edit or delete a post after publishing?",
    answer:
      "You can edit a post (which publishes a fresh revision) or unpublish/hide it from your Sigle blog at any time. However, because Arweave is a permanent archive, any previously published version remains on the Arweave network, so only hit publish when you're ready for a post to be public.",
  },
  {
    question: "What happened to my old Sigle posts stored on Gaia?",
    answer:
      "When Stacks retired Gaia storage, we archived existing public Sigle blogs so writers wouldn't lose their work. Connect your original Stacks wallet to download a free .zip backup of your posts or import them straight into the new Sigle as drafts.",
  },
];

export const HomeFaq = () => (
  <section className="mx-auto mt-24 max-w-5xl px-4 md:mt-32">
    <h2 className="mb-6 headline text-3xl">Questions</h2>

    <Accordion className="border-t border-border">
      {QUESTIONS.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          className="border-b border-border"
        >
          <AccordionTrigger className="py-5 text-base hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="max-w-2xl pb-5 text-pretty text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);
