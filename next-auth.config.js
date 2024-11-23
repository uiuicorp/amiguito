import NextAuth from "next-auth";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
});
