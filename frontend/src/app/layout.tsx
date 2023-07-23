import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Inter } from 'next/font/google';
import cn from 'classnames';

export const metadata = {
  title: 'icodeit Full stack playground',
  description: 'Full stack playground',
};

const inter = Inter({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body
        className={cn(
          inter.className,
          'flex flex-col min-h-screen w-full h-full'
        )}
      >
        <Toaster position='bottom-center' gutter={20} />
        {children}
        <div id='modals' />
      </body>
    </html>
  );
}
