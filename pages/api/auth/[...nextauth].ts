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
    async signIn({ user, account }) {
      await dbConnect();

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
    },

  async jwt({ token, user, account }) {
  if (user) {
    token.id = user.id ?? token.sub;
    token.email = user.email;
  }

  if (account?.provider === 'google') {
    await dbConnect();

    const dbUser =
      (await Admin.findOne({ email: token.email })) ||
      (await Doctor.findOne({ email: token.email })) ||
      (await Patient.findOne({ email: token.email }));

    if (dbUser) {
      token.role = dbUser.role;
      token.id = dbUser._id.toString();
    } else {
      token.role = 'patient'; 
    }
  }

  return token;
}
,

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
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
