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
  
  // Define authentication-specific routes
  const authRoutes = ['/','/login', '/register'] // Routes only for non-authenticated users
  const protectedRoutes = [
    '/dashboard',
    '/generate_visual',
    // Add any other protected routes here
  ]
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user) {
          // User is logged in
          if (authRoutes.includes(pathname)) {
            // Redirect away from login/register pages if authenticated
            router.push('/dashboard')
          }
          // If user is authenticated, they can access both public and protected routes
        } else {
          // User is not logged in
          if (protectedRoutes.some(route => pathname.startsWith(route))) {
            // If trying to access protected routes without auth, redirect to login
            router.push('/login')
          }
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