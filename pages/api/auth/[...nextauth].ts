import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const ADMIN_PASSWORD = process.env.NEXTAUTH_ADMIN_PASSWORD as string;

export const authOptions: NextAuthOptions = {
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
        async redirect({ baseUrl }) {
            return `${baseUrl}/admin/maps`;
        },
    }
};

export default NextAuth(authOptions);
