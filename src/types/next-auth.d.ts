import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      companyId: string
      companyCurrency: string
    }
  }

  interface User {
    role: string
    companyId: string
    companyCurrency: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    companyId: string
    companyCurrency: string
  }
}
