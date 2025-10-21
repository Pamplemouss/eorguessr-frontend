import type { Metadata } from "next";
import "@/public/globals.css";
import { LocaleProvider } from "@/app/providers/LocalContextProvider";
import { MainMapProvider } from "@/app/providers/MainMapContextProvider";
import { AdminProvider } from "@/app/providers/AdminContextProvider";

export const metadata: Metadata = {
    title: "Administration - Eorguessr",
    description: "Interface d'administration pour Eorguessr",
};

export default function RootLayout({
    children,
}: { children: React.ReactNode }) {
    return (
        <html lang="fr">
            <body>
                <LocaleProvider>
                    <MainMapProvider>
                        <AdminProvider>
                            {children}
                        </AdminProvider>
                    </MainMapProvider>
                </LocaleProvider>
            </body>
        </html>
    );
}

