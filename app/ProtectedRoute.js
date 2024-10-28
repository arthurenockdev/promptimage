// components/ProtectedRoute.js
'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from "../app/utils/firebaseConfig"
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']

  // Effect to handle auth state changes and route protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !publicRoutes.includes(pathname)) {
        // If no user and trying to access protected route, redirect to login
        router.push('/login')
      } else if (user && (pathname === '/login' || pathname === '/register')) {
        // If user is logged in and tries to access login/register, redirect to dashboard
        router.push('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [pathname])

  // Render children based on route protection rules
  return children
}

export default ProtectedRoute