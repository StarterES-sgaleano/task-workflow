import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { Header } from "@/components/layout/header";
import { ToastProvider } from "@/components/providers/toast-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Task Workflow",
  description: "A task management app for solo developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Header cookieStore={cookieStore} />
        <main className="flex-1 p-8">
          <ToastProvider />
          {children}
        </main>
      </body>
    </html>
  );
}
