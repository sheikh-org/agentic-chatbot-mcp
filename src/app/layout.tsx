import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agentic Chatbot with VNC',
  description: 'An intelligent chatbot with Google Generative AI and VNC streaming capabilities',
  keywords: ['AI', 'Chatbot', 'VNC', 'Google Generative AI', 'Agentic', 'Real-time'],
  authors: [{ name: 'MiniMax Agent' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}