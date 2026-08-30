import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escape Solara Island",
  description: "A human-directed Mediterranean crime strategy game operated through WebMCP."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
