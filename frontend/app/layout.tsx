import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventCoin - A Nova Economia de Eventos",
  description: "Revolucione seus eventos com blockchain, transações gasless e tokens transferíveis. Experiência Web2 com tecnologia Web3.",
  keywords: ["eventos", "blockchain", "stellar", "tokens", "pagamentos", "web3"],
  authors: [{ name: "EventCoin Team" }],
  openGraph: {
    title: "EventCoin - A Nova Economia de Eventos",
    description: "Revolucione seus eventos com blockchain, transações gasless e tokens transferíveis.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventCoin - A Nova Economia de Eventos",
    description: "Revolucione seus eventos com blockchain, transações gasless e tokens transferíveis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark scrollbar-modern">
      <body className="font-sans antialiased scrollbar-modern" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
