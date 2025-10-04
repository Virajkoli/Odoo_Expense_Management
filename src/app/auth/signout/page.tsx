'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Sparkles } from 'lucide-react'

export default function SignOut() {
  useEffect(() => {
    const handleSignOut = async () => {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true // Let NextAuth handle redirect directly
      })
    }

    handleSignOut()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg mb-6">
          <Sparkles className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Signing you out...
        </h2>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
          <span className="text-gray-500 text-sm">Please wait</span>
        </div>
      </div>
    </div>
  )
}