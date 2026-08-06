import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import HistoryProvider from "@/components/HistoryProvider";
import ThemeProvider from "@/components/ThemeProvider";
import tools from "@/lib/tools";

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Instrument_Sans({
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
  title: "OmniTool — Everything you need, nothing you don't",
  description: "A playful toolkit for developers, creators, and tinkerers",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "OmniTool",
    statusBarStyle: "default",
  },
};

const popular = [
  { href: "/tools/md-to-pdf", label: "Markdown to PDF" },
  { href: "/tools/pdf-to-txt", label: "PDF to TXT" },
  { href: "/tools/csv-to-json", label: "CSV to JSON" },
  { href: "/tools/yaml", label: "YAML Formatter" },
  { href: "/tools/case", label: "Case Converter" },
  { href: "/tools/qr", label: "QR Code" },
];

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full font-body bg-bg text-text">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('omnitool-dark');var d=t!==null?t==='true':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
        <HistoryProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:outline-none">
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="pt-28 pb-16 px-5 max-w-6xl mx-auto">
            {children}
          </main>

          <footer className="mt-8 border-t border-border bg-surface/60 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-5 py-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
                <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                  <div className="flex items-center gap-2.5 mb-3">
                    <img
                      src="/android-chrome-192x192.png"
                      alt="OmniTool logo"
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="font-heading text-base font-bold text-text">OmniTool</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-4">
                    A playful toolkit for developers, creators, and tinkerers — {tools.length} tools, all in one place.
                  </p>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-xs font-medium text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
                    All processing happens in your browser
                  </span>
                </div>

                <div>
                  <h4 className="eyebrow mb-3 !text-[0.65rem]">Popular</h4>
                  <ul className="space-y-2">
                    {popular.map((p) => (
                      <li key={p.href}>
                        <a href={p.href} className="text-sm text-text-secondary hover:text-primary transition-colors no-underline">
                          {p.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="eyebrow mb-3 !text-[0.65rem]">Categories</h4>
                  <ul className="space-y-2">
                    {["Text", "PDF", "Code", "Design", "Security", "Math"].map((c) => (
                      <li key={c}>
                        <a href="/" className="text-sm text-text-secondary hover:text-primary transition-colors no-underline">
                          {c}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="eyebrow mb-3 !text-[0.65rem]">Resources</h4>
                  <ul className="space-y-2">
                    <li><a href="/history" className="text-sm text-text-secondary hover:text-primary transition-colors no-underline">History</a></li>
                    <li><a href="/" className="text-sm text-text-secondary hover:text-primary transition-colors no-underline">All Tools</a></li>
                    <li><a href="/" className="text-sm text-text-secondary hover:text-primary transition-colors no-underline">About</a></li>
                    <li><a href="/" className="text-sm text-text-secondary hover:text-primary transition-colors no-underline">Privacy</a></li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border-light">
                <p className="text-xs text-text-tertiary">
                  © {new Date().getFullYear()} OmniTool — nothing leaves your machine.
                </p>
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span>{tools.length}+ tools</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary/40" />
                  <span>100% free</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary/40" />
                  <span>0 servers involved</span>
                </div>
              </div>
            </div>
          </footer>
        </HistoryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
