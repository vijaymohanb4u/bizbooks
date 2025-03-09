import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// Configure the route as dynamic
export const dynamic = 'force-dynamic';

interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

// Extend the built-in session types
interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Find user by email
          const [users] = await pool.query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [credentials.email]
          );

          const user = users[0];

          if (!user) {
            throw new Error('No user found with this email');
          }

          // Verify password
          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Return user without password
          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role as string,
          id: token.id as string,
        }
      };
    },
    async redirect({ url, baseUrl }) {
      // Allows relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows redirects to the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 