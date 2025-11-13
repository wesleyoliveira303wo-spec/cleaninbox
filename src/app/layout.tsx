'use client'

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import "../lib/fonts"
import { Providers } from "./providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CleanInbox AI BR - Limpeza Inteligente de E-mails",
  description:
    "A primeira IA brasileira que limpa e organiza seu Gmail automaticamente. Libere espaço, encontre o importante e tenha uma caixa de entrada sempre limpa.",
  keywords:
    "limpeza email, gmail, inteligencia artificial, organizacao email, brasil, IA",
  authors: [{ name: "CleanInbox AI BR" }],
  openGraph: {
    title: "CleanInbox AI BR - Seu e-mail limpo, automaticamente",
    description:
      "Deixe a IA eliminar o lixo digital pra você. Primeira IA brasileira para limpeza inteligente de e-mails.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "CleanInbox AI BR - Limpeza Inteligente de E-mails",
    description:
      "A primeira IA brasileira que limpa seu Gmail automaticamente. Libere espaço e tempo!",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <Script src="/lasy-bridge.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
