import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "maxmod panel | Node.js Hosting Platform",
  description: "Professional Node.js hosting platform with full resource and user management",
  keywords: ["maxmod panel", "Node.js hosting", "railway", "deployment", "cloud hosting"],
  authors: [{ name: "maxmod panel" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "maxmod panel",
    description: "Professional Node.js hosting platform",
    siteName: "maxmod panel",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('maxmod-locale');
                  var locale = stored || 'ar';
                  var storedTheme = localStorage.getItem('maxmod-theme');
                  var theme = storedTheme || 'dark';
                  document.documentElement.lang = locale;
                  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
