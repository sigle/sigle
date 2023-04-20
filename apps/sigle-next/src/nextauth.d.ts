import 'next-auth';

declare module 'next-auth' {
  interface User {
    address: string;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    address: string;
  }
}
