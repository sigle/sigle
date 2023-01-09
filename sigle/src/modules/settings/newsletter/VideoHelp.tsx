import { sigleConfig } from '../../../config';
import { Flex, Typography } from '../../../ui';

export const VideoHelp = () => {
  return (
    <Flex
      css={{ mt: '$5' }}
      direction={{ '@initial': 'column', '@md': 'row' }}
      gap="5"
    >
      <div>
        <Typography css={{ fontWeight: 600 }} size="h4">
          Not sure what to do? We got you!
        </Typography>
        <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
          We've created this tutorial to help you set your newsletter up using
          Sigle and Mailjet.
          <br />
          <br />
          If you're still having trouble, feel free to reach out to us on{' '}
          <a href={sigleConfig.discordUrl} target="_blank" rel="noreferrer">
            Discord
          </a>
          .
        </Typography>
      </div>
      <iframe
        id="ytplayer"
        src="https://www.youtube.com/embed/EAfqx5lx8Ic"
        allowFullScreen={true}
      ></iframe>
    </Flex>
  );
};
