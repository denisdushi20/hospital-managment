import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { NextAuthOptions, DefaultSession, DefaultUser } from 'next-auth';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';
import Admin from '@/models/Admin';


declare module 'next-auth' {
  interface Session {
    user: {
      id: string; 
      role: string; 
    } & DefaultSession['user']; 
  }

  interface User extends DefaultUser {
    id: string; 
    role: string; 
  }
}


declare module 'next-auth/jwt' {
  interface JWT {
    id: string; 
    role: string; 
  }
}


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
          (await Admin.findOne({ email: credentials.email }).select('+password')) ||
          (await Doctor.findOne({ email: credentials.email }).select('+password')) ||
          (await Patient.findOne({ email: credentials.email }).select('+password'));

        if (!user) {
          throw new Error('No user found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role || 'unknown', 
          name: user.name, 
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

      // For Google logins, check if the user exists in our database
      if (account?.provider === 'google') {
        const existingPatient = await Patient.findOne({ email: user.email });
        const existingDoctor = await Doctor.findOne({ email: user.email });
        const existingAdmin = await Admin.findOne({ email: user.email });

        // If the Google user doesn't exist in any of our collections, create them as a patient
        if (!existingPatient && !existingDoctor && !existingAdmin) {
          const fullName = user.name || '';
          const [firstName, ...rest] = fullName.split(' ');
          const surname = rest.join(' ');

          await Patient.create({
            email: user.email,
            name: firstName,
            surname: surname,
            role: 'patient', // Default role for new Google users
          });
        }
      }
      return true; 
    },

    // This callback is called whenever a JWT token is created or updated
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id; 
        token.email = user.email; 
        token.role = (user as any).role; 
                                        
      }

      if (account?.provider === 'google' || !token.role) { 
        await dbConnect();
        const dbUser =
          (await Admin.findOne({ email: token.email })) ||
          (await Doctor.findOne({ email: token.email })) ||
          (await Patient.findOne({ email: token.email }));

        if (dbUser) {
          token.role = dbUser.role; 
          token.id = dbUser._id.toString(); 
        } else if (account?.provider === 'google' && !dbUser) {
          // If it was a Google login and user was not found in DB (implying a new patient was created)
          token.role = 'patient';
        }
      }

      return token; 
    },

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
