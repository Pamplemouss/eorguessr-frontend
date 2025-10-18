import type { Metadata } from "next";
import "@/public/globals.css";
import { LocaleProvider } from "@/app/providers/LocalContextProvider";
import { MapProvider } from "@/app/providers/MapContextProvider";
import { AdminMapConfigProvider } from "@/app/providers/AdminMapConfigContextProvider";

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
                    <AdminMapConfigProvider>
                        <MapProvider>
                            {children}
                        </MapProvider>
                    </AdminMapConfigProvider>
                </LocaleProvider>
            </body>
        </html>
    );
}