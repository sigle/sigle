import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="flex justify-end px-4 py-8 md:px-16">
      <a
        className="flex items-center gap-1 text-gray-300"
        href="https://www.sigle.io/"
        target="_blank"
        rel="noreferrer"
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
