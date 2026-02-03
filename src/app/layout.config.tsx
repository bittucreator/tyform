import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image src="/logo.svg" alt="Tyform Logo" width={24} height={24} className="inline-block" />
        <span className="font-semibold text-lg">Tyform</span>
      </>
    ),
  },
  githubUrl: 'https://x.com/tyforms',
};
