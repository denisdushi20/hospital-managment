import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';
import Admin from '@/models/Admin';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user =
          (await Admin.findOne({ email: credentials.email })) ||
          (await Doctor.findOne({ email: credentials.email })) ||
          (await Patient.findOne({ email: credentials.email }));

        if (!user) throw new Error('No user found');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Invalid password');

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role || 'unknown',
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
 callbacks: {
async signIn({ user, account, profile }) {
    await dbConnect(); // Make sure this is he
 
  if (account?.provider === 'google') {
    const existingUser = await Patient.findOne({ email: user.email });
    if (!existingUser) {
      const fullName = user.name || '';
      const [firstName, ...rest] = fullName.split(' ');
      const surname = rest.join(' ');

      await Patient.create({
        email: user.email,
        name: firstName,
        surname: surname,
        role: 'patient',
      });
    }
  }
  return true;
}
,
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.role = user.role ?? 'oauth';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};


export default NextAuth(authOptions);
