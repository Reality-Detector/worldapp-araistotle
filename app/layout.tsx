import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MiniKitProvider from "@/components/minikit-provider";
import dynamic from "next/dynamic";
import NextAuthProvider from "@/components/next-auth-provider";
import { CreditProvider } from "@/components/CreditProvider";
import FactCheckProvider from '@/components/FactCheckProvider/factcheck-context';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Facticity.AI",
  description: "World’s best multilingual multimedia fact-checker. Enter a claim, text, audio, or video link and cross-check it instantly against trusted sources for truth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ErudaProvider = dynamic(
    () => import("../components/Eruda").then((c) => c.ErudaProvider),
    {
      ssr: false,
    }
  );
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <CreditProvider>
            <ErudaProvider>
              <MiniKitProvider>
                <FactCheckProvider>
                  {children}
                </FactCheckProvider>
              </MiniKitProvider>
            </ErudaProvider>
          </CreditProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
