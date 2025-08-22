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

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const session = await auth();

    return (
      <html lang="ar" dir="rtl">
        <body className={inter.className}>
          <div className="flex min-h-screen">
            {session?.user && <Sidebar />}
            <main className="flex-1 flex flex-col">
              {session?.user && <Navbar />}
              <div className="p-8">
                {children}
              </div>
            </main>
          </div>
        </body>
      </html>
    );
  } catch (error) {
    console.error("Failed to load layout:", error);
    return (
      <html lang="ar" dir="rtl">
        <body className={inter.className}>
          <div className="flex min-h-screen">
            <main className="flex-1 flex flex-col">
              <div className="p-8">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">خطأ في التطبيق</h1>
                  <p className="text-red-500">حدث خطأ أثناء تحميل التطبيق. يرجى المحاولة مرة أخرى.</p>
                </div>
              </div>
            </main>
          </div>
        </body>
      </html>
    );
  }
}
