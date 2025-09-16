import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
      title: "Mizar - AI Opportunities, Quantified",
      description: "Mizar analyzes a business, identifies AI opportunities, recommends off-the-shelf tools or vetted consultants, and quantifies cost savings per use case—delivering a clear, prioritized AI roadmap.",
  keywords: ["AI", "artificial intelligence", "business analysis", "ROI", "automation"],
      authors: [{ name: "Mizar" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
        style={{ 
          backgroundColor: 'var(--bg)', 
          color: 'var(--text)' 
        }}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
