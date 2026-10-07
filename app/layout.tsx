import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Navigation, Footer } from "@/components/layout";
import { MotionProvider, ToastProvider } from "@/components/ui";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Receipti — Digital Receipt Infrastructure",
    template: "%s · Receipti",
  },
  description:
    "Receipti connects merchant transaction systems with customers through persistent digital receipts built for returns, records, and trusted verification.",
  applicationName: "Receipti",
  metadataBase: new URL("https://receipti.pk"),
  openGraph: {
    type: "website",
    siteName: "Receipti",
    title: "Receipti — Digital Receipt Infrastructure",
    description:
      "Receipti connects merchant transaction systems with customers through persistent digital receipts built for returns, records, and trusted verification.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Receipti — Digital Receipt Infrastructure",
    description:
      "Persistent digital receipts built for returns, records, and trusted verification.",
  },
};

export const viewport: Viewport = {
  themeColor: "#087F5B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <MotionProvider>
          <ToastProvider>
            <Navigation />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
