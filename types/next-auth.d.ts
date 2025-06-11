// types/next-auth.d.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; 
      name?: string | null; 
      email: string;
      role: string; 
      surname?: string | null;
      phone?: string | null;
      address?: {
        street?: string | null;
        city?: string | null;
        state?: string | null;
        zipCode?: string | null;
        country?: string | null;
      } | null;
      dateOfBirth?: string | Date | null;
      gender?: string | null;
      image?: string | null;
    }; // Remove '& DefaultSession["user"]' if you prefer to define all user properties explicitly here
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    role: string; 
    surname?: string | null;
    phone?: string | null;
    address?: {
      street?: string | null;
      city?: string | null;
      state?: string | null;
      zipCode?: string | null;
      country?: string | null;
    } | null;
    dateOfBirth?: string | Date | null;
    gender?: string | null;
  }
}

// If you're using JWTs directly and need to extend JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null; 
    role: string;
    surname?: string | null;
    phone?: string | null;
    address?: {
      street?: string | null;
      city?: string | null;
      state?: string | null;
      zipCode?: string | null;
      country?: string | null;
    } | null;
    dateOfBirth?: string | Date | null;
    gender?: string | null;
  }
}
