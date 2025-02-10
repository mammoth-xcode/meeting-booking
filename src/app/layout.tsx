import { getServerSession } from 'next-auth'
import SessionProvider from './components/SessionProvider'  // get client session from components.

import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import Footer from './components/Footer'

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// const notoSansThai = localFont({
//   src: "./fonts/NotoSansThai.ttf",
//   variable: "--font-noto-sans",
//   weight: "100 900",
// });

// Google Font.
import { Noto_Sans_Thai, Noto_Sans_Thai_Looped, Thasadith } from "next/font/google";
// Setup project font.

// const thasadith = Thasadith({
//   subsets: ["latin"],
//   weight: ["700"],
//   display: 'swap',
// });

const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin"],
  weight: ["400"],
  display: 'swap',
});
// Selected font.
const selectedFont = notoSansThai;

export const metadata: Metadata = {
  title: "Meeting Room Booking System",
  description: "Meeting Room Booking System",
  // icons: "https://res.public.onecdn.static.microsoft/owamail/20241004002.14/resources/images/favicons/mail-seen.ico",
  icons: "./images/admin.ico",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // server side session.
  const session = await getServerSession()

  return (
    <html lang="en" className={selectedFont.className}>
      <body
        className={selectedFont.className + " bg-[white]"}
      >
        <SessionProvider session={session}>
          
          {/* place Toast at top of children first. , Toaster richColors /> */}
          <Toaster />

          {/* children */}
          {children}

          {/* footer */}
          {/* <Footer /> */}
          
        </SessionProvider>
      </body>
    </html>
  );
}
