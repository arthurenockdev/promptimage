// components/ProtectedRoute.js
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from "../app/utils/firebaseConfig"
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']

  // Effect to handle auth state changes and route protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (!user && !publicRoutes.includes(pathname)) {
          // If no user and trying to access protected route, redirect to login
          router.push('/login')
        } else if (user && (pathname === '/login' || pathname === '/register')) {
          // If user is logged in and tries to access login/register, redirect to dashboard
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Authentication error:', error)
      } finally {
        setLoading(false)
      }
    }, (error) => {
      console.error('Auth state change error:', error)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [pathname, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Render children based on route protection rules
  return children
}

export default ProtectedRoute