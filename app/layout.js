import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import HistoryProvider from "@/components/HistoryProvider";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "OmniTool — Creative Utility Dashboard",
  description: "A playful toolkit for developers and creators",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full font-body bg-bg text-text">
        <HistoryProvider>
          <Navbar />
          <main className="pt-28 pb-16 px-5 max-w-6xl mx-auto">
            {children}
          </main>
        </HistoryProvider>
      </body>
    </html>
  );
}
