import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unimpossible | AI Systems That Work",
  description: "We build AI systems that work. Autonomous agents. Real code. Delivered by people who've shipped. Fractional AI CTO services for UK hospitality and SMEs.",
  keywords: "AI consultancy UK, autonomous AI agents, fractional AI CTO, hospitality AI, AI project delivery",
  openGraph: {
    title: "Unimpossible | AI Systems That Work",
    description: "We build AI systems that work. Meet our 13-agent autonomous team.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unimpossible | AI Systems That Work",
    description: "Autonomous agents. Real code. Delivered by people who've shipped.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-neutral-100`}>
        <Navbar />
        <main className="min-h-screen bg-[#0a0a0a]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
