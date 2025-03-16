import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BizBooks - Simple Business Accounting',
  description: 'Manage your business finances with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
