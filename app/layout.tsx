import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MiniKitProvider from "@/components/minikit-provider";
import dynamic from "next/dynamic";
import NextAuthProvider from "@/components/next-auth-provider";
import { CreditProvider } from "@/components/CreditProvider";
import FactCheckProvider from '@/components/FactCheckProvider/factcheck-context';
import { DM_Mono, Rubik, Sora } from "next/font/google";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-display",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

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
    <html lang="en" className={`${rubik.className} ${sora.className} ${dmMono.className}`}>
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
