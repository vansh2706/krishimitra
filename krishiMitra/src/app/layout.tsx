import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
    title: "KrishiMitra - AI-Powered Agricultural Assistant",
    description: "AI-powered multilingual agricultural assistant for farmers. Real-time crop guidance, weather alerts, pest detection, market prices, and offline support in 8+ Indian languages.",
    keywords: "agriculture, farming, AI, crops, weather, pest detection, market prices, India, multilingual",
    authors: [{ name: "KrishiMitra Team" }],
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png"
    },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "KrishiMitra"
    },
    other: {
        "mobile-web-app-capable": "yes",
        "fc:frame": JSON.stringify({
            version: "next",
            imageUrl: "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_796e0f12-36a0-4f0f-8857-e2cc9768926a-S8b0FBge2fBQiD5w9sSVA8ma6h8LS9",
            button: {
                title: "Open with Ohara",
                action: {
                    type: "launch_frame",
                    name: "KrishiMitra",
                    url: "https://aware-slowly-490.preview.series.engineering",
                    splashImageUrl: "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg",
                    splashBackgroundColor: "#ffffff"
                }
            }
        })
    }
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#16a34a',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const requestId = cookies().get("x-request-id")?.value;

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {requestId && <meta name="x-request-id" content={requestId} />}
            </head>
            <body className="antialiased" suppressHydrationWarning>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}