import Image from 'next/image';

export const Footer = () => {
  return (
    <footer className="py-8 px-4 md:px-16 flex justify-end">
      <a
        className="items-center gap-1 flex text-gray-300"
        href="https://www.sigle.io/"
        target="_blank"
        rel="noopener"
      >
        <div className="text-center text-sm font-semibold leading-tight">
          Powered by Sigle
        </div>
        <Image
          src="/img/sigle-logo.svg"
          alt="Sigle logo"
          height={16}
          width={16}
        />
      </a>
    </footer>
  );
};
