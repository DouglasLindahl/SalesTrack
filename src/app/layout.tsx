"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import "./globals.css";

// Import fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      const session = supabase.auth.getSession();
      if (session) {
        if ((await session).data.session == null) {
          router.push("/login");
        }
      }
    };
    setIsSuccess(true);
    checkUserSession();
  }, [router]);

  if (!isSuccess) {
    return (
      <html>
        <head>
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body>
          <p>Loading...</p>;
        </body>
      </html>
    );
  }

  // Only render the children after the session check passes
  return (
    <html>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <div className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
        </div>
      </body>
    </html>
  );
}
