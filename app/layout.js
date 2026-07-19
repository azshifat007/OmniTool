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
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:outline-none">
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="pt-28 pb-16 px-5 max-w-6xl mx-auto">
            {children}
          </main>
          <footer className="border-t border-border bg-surface/50 mt-8">
            <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-bold">O</span>
                <span className="font-heading text-sm font-semibold text-text-secondary">OmniTool</span>
              </div>
              <p className="text-xs text-text-tertiary text-center">
                All processing happens locally in your browser. Nothing leaves your machine.
              </p>
              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <span>267+ tools</span>
                <span className="w-1 h-1 rounded-full bg-text-tertiary/40" />
                <span>100% free</span>
              </div>
            </div>
          </footer>
        </HistoryProvider>
      </body>
    </html>
  );
}
