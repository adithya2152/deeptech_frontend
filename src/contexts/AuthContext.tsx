import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from '@/lib/api'
import { Profile } from '@/types'

const normalizeRole = (role: string): 'buyer' | 'expert' | 'admin' => {
  if (role === 'user') return 'buyer'
  return role as 'buyer' | 'expert' | 'admin'
}

interface AuthContextType {
  user: any | null
  profile: Profile | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, first_name: string, last_name: string, role: 'buyer' | 'expert', domains?: string[], phone?: string) => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profileUpdates: {
    first_name?: string;
    last_name?: string;
    company?: string;
    avatar_url?: string | null;
    banner_url?: string | null;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const processUserData = (data: any): Profile | null => {
    if (!data) return null
    return {
      ...data,
      role: normalizeRole(data.role)
    } as Profile
  }

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        setIsLoading(false)
        return
      }

      try {
        const res = await authApi.getMe(savedToken)

        if (res.success && res.data?.user) {
          const userData = processUserData(res.data.user)
          setUser(userData)
          setProfile(userData)
          setToken(savedToken)
        } else {
          handleLogout()
        }
      } catch {
        handleLogout()
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setProfile(null)
  }

  const signIn = async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    if (response.success && response.data) {
      const { user, tokens } = response.data;
      const enrichedUser = processUserData(user);

      localStorage.setItem('token', tokens.accessToken);
      setToken(tokens.accessToken);
      setUser(enrichedUser);
      setProfile(enrichedUser);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    role: 'buyer' | 'expert',
    domains?: string[],
    phone?: string
  ) => {
    const response = await authApi.register({
      email,
      password,
      first_name,
      last_name,
      role,
      domains: domains || [],
      phone
    });

    if (!response.success) {
      throw new Error(response.message || 'Registration failed')
    }
  }

  const signOut = async () => {
    try {
      if (token) {
        await authApi.logout(token)
      }
    } catch (err) {
      console.error(err)
    } finally {
      handleLogout()
    }
  }

  const updateProfile = async (profileUpdates: any) => {
    if (!token) throw new Error('Not authenticated')

    const response = await authApi.updateProfile(token, profileUpdates)

    if (response.success && response.data) {
      const updatedData = response.data;

      setUser((prev: any) => {
        if (!prev) return null;
        return processUserData({ ...prev, ...updatedData });
      });

      setProfile((prev: any) => {
        if (!prev) return null;
        return processUserData({ ...prev, ...updatedData });
      });
    } else {
      throw new Error('Profile update failed')
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, token, isLoading, isAuthenticated: !!token && !!user,
      signIn, signUp, signOut, logout: signOut, updateProfile
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}