import Image from 'next/image';
import { SiteSettings } from '@/types';

interface HeroProps {
  settings: SiteSettings;
  newsletter?: { id: string };
}

export const Hero = ({ settings, newsletter }: HeroProps) => {
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
      {newsletter && (
        <form className="container mt-5 flex max-w-md flex-row items-center justify-center">
          <input
            className="h-10 w-full rounded-l-lg border border-gray-300 bg-transparent px-4 text-sm focus:border-gray-400 focus:ring-0"
            aria-label="Enter your email to subscribe"
            name="email_address"
            placeholder="Enter your email"
            required
            type="email"
          />
          <button
            className="h-10 rounded-r-lg bg-gray-950 px-5 text-sm text-white"
            type="submit"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
};
