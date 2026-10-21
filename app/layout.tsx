import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppConciergeFloat from '@/components/layout/WhatsAppConciergeFloat';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'LYVEN — Premium Streetwear & Custom Printed T-Shirts',
    template: '%s | LYVEN',
  },
  description:
    'LYVEN is an independent streetwear label offering oversized graphic-print T-shirts & custom print studio on heavyweight 240 GSM French Terry cotton. Flat ₹400.',
  keywords: [
    'LYVEN',
    'streetwear',
    'custom t-shirt printing',
    'oversized t-shirts',
    'graphic tees',
    'printed t-shirts',
    'Virat Kohli tee',
    'Indian streetwear',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'LYVEN',
    title: 'LYVEN — Premium Streetwear & Custom Prints',
    description:
      'Fan-merch tees for cricket icons, comic culture & custom prints. 240 GSM French Terry cotton. Flat ₹400.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0B0B0D] font-sans antialiased selection:bg-[#C9A45C] selection:text-[#0B0B0D]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppConciergeFloat />
      </body>
    </html>
  );
}
