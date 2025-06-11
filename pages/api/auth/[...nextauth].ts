import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { NextAuthOptions, DefaultSession, DefaultUser } from 'next-auth'; // Keep DefaultSession, DefaultUser for base types
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
          (await Admin.findOne({ email: credentials.email }).select('+password').lean()) ||
          (await Doctor.findOne({ email: credentials.email }).select('+password').lean()) ||
          (await Patient.findOne({ email: credentials.email }).select('+password').lean());

        if (!user) {
          throw new Error('No user found');
        }

        // Cast 'user' to a type that has 'password' for bcrypt comparison
        const userWithPassword = user as { password?: string } & typeof user;

        if (!userWithPassword.password) {
            throw new Error('User account not set up for password login (e.g., OAuth only)');
        }

        const isValid = await bcrypt.compare(credentials.password, userWithPassword.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        if (Array.isArray(user)) {
          throw new Error('User query returned an array, expected a single user object.');
        }
        return {
          id: (user as any)._id?.toString(),
          email: (user as any).email,
          role: (user as any).role || 'unknown',
          name: (user as any).name, 
          surname: (user as typeof Patient.prototype)?.surname,
          phone: (user as typeof Patient.prototype)?.phone,
          address: (user as typeof Patient.prototype)?.address,
          dateOfBirth: (user as typeof Patient.prototype)?.dateOfBirth?.toISOString(),
          gender: (user as typeof Patient.prototype)?.gender,
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
            // For new Google users, other fields like phone, address, DOB, gender
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
        token.name = user.name;
        token.role = (user as any).role;

        token.surname = (user as any).surname;
        token.phone = (user as any).phone;
        token.address = (user as any).address;
        token.dateOfBirth = (user as any).dateOfBirth;
        token.gender = (user as any).gender;

      } else if (token.email) {
          await dbConnect();
          const dbUser =
            (await Admin.findOne({ email: token.email }).lean()) ||
            (await Doctor.findOne({ email: token.email }).lean()) ||
            (await Patient.findOne({ email: token.email }).lean());

          if (dbUser && !Array.isArray(dbUser)) {
            token.id = dbUser._id?.toString() ?? '';
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.role = dbUser.role;
            token.surname = (dbUser as typeof Patient.prototype)?.surname;
            token.phone = (dbUser as typeof Patient.prototype)?.phone;
            token.address = (dbUser as typeof Patient.prototype)?.address;
            token.dateOfBirth = (dbUser as typeof Patient.prototype)?.dateOfBirth?.toISOString();
            token.gender = (dbUser as typeof Patient.prototype)?.gender;
          }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;

        session.user.surname = token.surname;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.dateOfBirth = token.dateOfBirth;
        session.user.gender = token.gender;
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