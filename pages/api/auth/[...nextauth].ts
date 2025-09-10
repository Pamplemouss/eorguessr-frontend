import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            image?: string | null;
        };
    }
}

// Get your admin password from environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (credentials?.password === ADMIN_PASSWORD) {
                    return { id: "admin", name: "Admin" };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            return `${baseUrl}/admin/maps`;
        },
    }
});