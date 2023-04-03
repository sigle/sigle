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
      <div className="relative w-full h-64 md:h-[22rem]">
        <Image
          className="object-cover"
          src={settings.banner}
          alt="Banner"
          sizes="100vw"
          priority
          fill
        />
      </div>
      <div className="relative h-[110px] w-[110px] mt-[-55px] object-cover mx-auto border-[6px] border-white rounded-2xl overflow-hidden md:h-[150px] md:w-[150px] md:mt-[-75px]">
        <Image
          src={settings.avatar}
          alt="Avatar"
          priority
          height={150}
          width={150}
        />
      </div>
      <div className="container">
        <h1 className="text-4xl	font-bold text-center mt-5">{settings.name}</h1>
        <h2 className="text-lg text-center mt-3">{settings.description}</h2>
      </div>
    </div>
  );
};
