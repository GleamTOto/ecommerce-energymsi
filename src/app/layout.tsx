import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "700",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-label",
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "EnergyMSI - Tu Tienda de Tecnologia",
  description:
    "Los mejores productos de computacion: PCs, monitores, teclados, mouse y mas. Envio a todo Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${hankenGrotesk.variable} ${inter.variable} ${poppins.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
