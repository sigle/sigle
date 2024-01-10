import { Text } from '@radix-ui/themes';
import Image from 'next/image';
import { cn } from '@/lib/cn';

export const CarouselItem = ({
  description,
  image,
  active,
}: {
  description: React.ReactNode;
  image: string;
  active: boolean;
}) => {
  return (
    <div
      className={cn('space-y-4', {
        block: active === true,
        hidden: active === false,
      })}
    >
      <Text color="gray">{description}</Text>
      <div className="shadow-sm rounded-md relative z-0 mx-auto max-w-[600px] overflow-hidden">
        <Image
          width={600}
          height={350}
          src={image}
          alt="hint"
          layout="responsive"
          objectFit="cover"
        />
      </div>
    </div>
  );
};
