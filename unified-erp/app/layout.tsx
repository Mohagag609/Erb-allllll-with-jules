import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unified ERP",
  description: "Unified Real Estate & Treasury ERP",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = process.env.ENABLE_AUTH === 'false' ? null : await auth();

  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {(process.env.ENABLE_AUTH === 'false' || session?.user) && <Sidebar />}
          <main className="flex-1 flex flex-col">
            {(process.env.ENABLE_AUTH === 'false' || session?.user) && <Navbar />}
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
