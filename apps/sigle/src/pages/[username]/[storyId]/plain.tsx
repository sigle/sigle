import { Story } from '@/types';
import { getStoryFile } from '@/utils';
import { Container, Heading, Text } from '@radix-ui/themes';
import {
  BnsGetNameInfoResponse,
  NamesApi,
} from '@stacks/blockchain-api-client';
import { resolveZoneFileToProfile } from '@stacks/profile';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

const fetchPublicStory = async (
  bucketUrl: string,
  storyId: string,
): Promise<{ file: Story; statusCode: false | number }> => {
  let file;
  let statusCode: false | number = false;
  const data = await fetch(`${bucketUrl}${storyId}.json`);
  if (data.status === 200) {
    file = await data.json();
  } else {
    statusCode = data.status;
  }
  return { file, statusCode };
};

export default function Plain() {
  const router = useRouter();
  const { username, storyId } = router.query as {
    username: string;
    storyId: string;
  };

  const { data: plainStory } = useQuery(
    ['plain-story', username, storyId],
    async () => {
      const appUrl = 'https://app.sigle.io';

      let nameInfo: BnsGetNameInfoResponse | null = null;
      const stacksNamesApi = new NamesApi();
      nameInfo = await stacksNamesApi.getNameInfo({ name: username });

      const userProfile = await resolveZoneFileToProfile(
        nameInfo.zonefile,
        nameInfo.address,
      );

      const bucketUrl = userProfile?.apps?.[appUrl];
      const file = await fetchPublicStory(bucketUrl, storyId);

      const dataa = await getStoryFile(storyId);
      console.log(dataa);

      return file.file;
    },
  );

  const { data: decryptedStory } = useQuery(
    ['decrypted-story', storyId],
    async () => {
      const data = await getStoryFile(storyId);
      return data;
    },
  );

  return (
    <Container>
      <Heading>Plain</Heading>
      <Text size="1">{JSON.stringify(plainStory)}</Text>

      <Heading className="mt-10">Decrypted</Heading>
      <Text size="1">{JSON.stringify(decryptedStory)}</Text>
    </Container>
  );
}
