import { useState } from 'react';
import { Story } from '../../../types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Box,
  Button,
  FormTextarea,
  Typography,
} from '../../../ui';
import { useStoriesControllerSendTest } from '@/__generated__/sigle-api';

interface SendTestEmailProps {
  story: Story;
}

export const SendTestEmail = ({ story }: SendTestEmailProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [emails, setEmails] = useState<string>('');

  const { mutate: sendStoryTest, isLoading: isLoadingSendStoryTest } =
    useStoriesControllerSendTest({
      onError: (error) => {
        setError(error?.message || 'An error occurred');
      },
      onSuccess: () => {
        setSuccess(true);
      },
    });

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (isLoadingSendStoryTest) {
      return;
    }
    setError(null);
    setSuccess(false);

    sendStoryTest({
      body: {
        id: story.id,
        storyTitle: story.title,
        storyContent: story.content,
        storyCoverImage: story.coverImage ?? null,
        emails,
      },
    });
  };

  return (
    <Accordion collapsible type="single">
      <AccordionItem value="item-1">
        <AccordionTrigger>Send a test email</AccordionTrigger>
        <AccordionContent>
          <Box
            as="form"
            css={{
              display: 'flex',
              flexDirection: 'column',
            }}
            onSubmit={handleSubmitForm}
          >
            <FormTextarea
              placeholder="Send up to 5 emails separated by commas"
              rows={4}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              css={{
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
                '&:focus': {
                  boxShadow: 'none',
                },
              }}
            />
            <Button css={{ mt: '$3' }} disabled={isLoadingSendStoryTest}>
              Send test email
            </Button>
            {error && (
              <Typography
                size="subheading"
                css={{ color: '$orange11', mt: '$2' }}
              >
                {error}
              </Typography>
            )}
            {success && (
              <Typography size="subheading" css={{ mt: '$2' }}>
                Email sent successfully, please check your inbox.
              </Typography>
            )}
          </Box>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
