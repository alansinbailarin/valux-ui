import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ModeOrb, Toaster, ValuxProvider } from "@/src";
import "./globals.css";
import "../src/styles.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Valux UI",
  description:
    "Accessible React components for Next.js with a native-mobile feel and one motion signature.",
};

/* Replays the stored mode choice before first paint, so a dark-mode visitor
   never sees a light flash. Kept inline (not an effect) precisely because it
   must run before anything renders. */
const MODE_SCRIPT = `try{var m=localStorage.getItem("vx-mode");if(m==="dark"||m==="light")document.documentElement.dataset.vxMode=m}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the inline script below legitimately adds
    // data-vx-mode to <html> before React hydrates.
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-[family-name:var(--font-poppins)]">
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
        <ValuxProvider
          className="flex min-h-full flex-1 flex-col"
          theme={{ fontFamily: "var(--font-poppins)" }}
        >
          {children}
          <ModeOrb className="site-orb" />
        </ValuxProvider>
      </body>
    </html>
  );
}
