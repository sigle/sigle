import { Text } from '@radix-ui/themes';
import Image from 'next/image';

export const FullScreenLoading = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Image
        src="/static/img/logo.png"
        alt="Logo Sigle"
        width={250}
        height={92}
        priority
      />
      <Text weight="medium">Loading ...</Text>
    </div>
  );
};
