import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: "owner" | "co-owner" | "admin" | "vip" | "user";
    };
  }

  interface User {
    role: "owner" | "co-owner" | "admin" | "vip" | "user";
  }
}
