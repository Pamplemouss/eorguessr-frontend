import type { Metadata } from "next";
import "@/public/globals.css";

export const metadata: Metadata = {
	title: 'Admin Photosphères - Eorguessr',
	description: 'Interface d\'administration pour la gestion des photosphères',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="fr">
			<body>{children}</body>
		</html>
	)
}
