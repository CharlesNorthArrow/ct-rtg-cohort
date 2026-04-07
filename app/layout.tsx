import type { Metadata } from 'next';
import { Nunito, Open_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Reading Ready? — RTG Cohort Map",
  description:
    "Tracking Connecticut's youngest learners from Kindergarten Entry (2020–21) through 3rd Grade ELA (2024–25).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${openSans.variable}`}>
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.11.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script
          src="https://api.mapbox.com/mapbox-gl-js/v3.11.0/mapbox-gl.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
