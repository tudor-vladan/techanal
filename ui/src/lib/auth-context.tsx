import { createContext, useContext, useEffect, useState } from 'react'

type User = {
  email: string
  password: string
  mfaEnabled?: boolean
  mfaVerified?: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  mfaRequired: boolean
  mfaVerified: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  enableMFA: () => Promise<void>
  verifyMFA: (code: string) => Promise<boolean>
  disableMFA: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  mfaRequired: false,
  mfaVerified: false,
  login: async () => {},
  logout: () => {},
  enableMFA: async () => {},
  verifyMFA: async () => false,
  disableMFA: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaVerified, setMfaVerified] = useState(false)

  const login = async (credentials: { email: string; password: string }) => {
    // Simple local authentication - accept any valid credentials
    if (credentials.email && credentials.password && credentials.password.length >= 6) {
      const userWithMFA = {
        ...credentials,
        mfaEnabled: credentials.email.includes('mfa'), // Demo: enable MFA for emails containing 'mfa'
        mfaVerified: false
      }
      
      setUser(userWithMFA)
      
      // Check if MFA is required
      if (userWithMFA.mfaEnabled) {
        setMfaRequired(true)
        setMfaVerified(false)
      } else {
        setMfaRequired(false)
        setMfaVerified(true)
      }
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userWithMFA))
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Invalid credentials'))
    }
  }

  const logout = () => {
    setUser(null)
    setMfaRequired(false)
    setMfaVerified(false)
    localStorage.removeItem('user')
  }

  const enableMFA = async () => {
    if (user) {
      const updatedUser = { ...user, mfaEnabled: true, mfaVerified: false }
      setUser(updatedUser)
      setMfaRequired(true)
      setMfaVerified(false)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const verifyMFA = async (code: string): Promise<boolean> => {
    // Demo: accept any 6-digit code
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      if (user) {
        const updatedUser = { ...user, mfaVerified: true }
        setUser(updatedUser)
        setMfaVerified(true)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      return true
    }
    return false
  }

  const disableMFA = async () => {
    if (user) {
      const updatedUser = { ...user, mfaEnabled: false, mfaVerified: false }
      setUser(updatedUser)
      setMfaRequired(false)
      setMfaVerified(false)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        
        // Set MFA status
        if (parsedUser.mfaEnabled) {
          setMfaRequired(true)
          setMfaVerified(parsedUser.mfaVerified || false)
        } else {
          setMfaRequired(false)
          setMfaVerified(true)
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      mfaRequired, 
      mfaVerified,
      login, 
      logout, 
      enableMFA, 
      verifyMFA, 
      disableMFA 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 