import Image from 'next/image';

interface HeroProps {
  settings: {
    name: string;
    description: string;
    avatar: string;
    banner: string;
  };
}

export const Hero = ({ settings }: HeroProps) => {
  return (
    <div>
      <div className="relative h-64 w-full md:h-[22rem]">
        <Image
          className="object-cover"
          src={settings.banner}
          alt="Banner"
          sizes="100vw"
          priority
          fill
        />
      </div>
      <div className="relative mx-auto mt-[-55px] h-[110px] w-[110px] overflow-hidden rounded-2xl border-[6px] border-white bg-white object-cover md:mt-[-75px] md:h-[150px] md:w-[150px]">
        <Image
          src={settings.avatar}
          alt="Avatar"
          priority
          height={150}
          width={150}
        />
      </div>
      <div className="container">
        <h1 className="mt-5 text-center text-4xl font-bold">{settings.name}</h1>
        <h2 className="mt-3 text-center text-lg">{settings.description}</h2>
      </div>
    </div>
  );
};
