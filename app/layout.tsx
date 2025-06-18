// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: "Elona Tech",
  description: "Elona Tech is a community-driven project to create a modern, web-based version of the classic RPG Elona.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
