import { useState } from 'react';
import { ApiError } from '../../../external/api';
import { useSendStoryTest } from '../../../hooks/stories';
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

interface SendTestEmailProps {
  story: Story;
}

export const SendTestEmail = ({ story }: SendTestEmailProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [emails, setEmails] = useState<string>('');

  const { mutate: sendStoryTest, isLoading: isLoadingSendStoryTest } =
    useSendStoryTest({
      onError: (error: Error | ApiError) => {
        let errorMessage = error.message;
        if (error instanceof ApiError && error.body.message) {
          errorMessage = error.body.message;
        }
        setError(errorMessage);
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
      id: story.id,
      storyTitle: story.title,
      storyContent: story.content,
      storyCoverImage: story.coverImage ?? null,
      emails,
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
