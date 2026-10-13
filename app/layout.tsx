import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import './flip-reveal.css';
import { Providers } from './providers';

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Doyess Film',
  description:
    'Cine, estadísticas y descubrimiento algorítmico para tu biblioteca personal.',
  icons: {
    icon: '/doyess-logo.svg',
    shortcut: '/doyess-logo.svg',
    apple: '/doyess-logo.svg',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
