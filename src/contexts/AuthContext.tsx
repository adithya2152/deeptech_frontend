import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from '@/lib/api'
import { Profile } from '@/types'
import { toast } from 'sonner'

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
  switchRole: () => Promise<void>
  updateProfile: (profileUpdates: {
    // Common profile fields (profiles table)
    first_name?: string;
    last_name?: string;
    username?: string;
    country?: string;
    timezone?: string;
    company?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;

    // Buyer fields (buyers table)
    client_type?: 'individual' | 'organisation';
    social_proof?: string | null;
    company_name?: string | null;
    company_website?: string | null;
    vat_id?: string | null;
    website?: string | null;
    billing_country?: string | null;
    preferred_engagement_model?: 'daily' | 'fixed' | 'sprint' | string;
    company_size?: string | null;
    industry?: string | null;
    company_description?: string | null;

    // Allow forward-compatible fields
    [key: string]: any;
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
        console.log('[AuthContext] Calling getMe with saved token...');
        const res = await authApi.getMe(savedToken)
        console.log('[AuthContext] getMe response:', res);

        if (res.success && res.data?.user) {
          const userData = processUserData(res.data.user)
          setUser({ ...userData })
          setProfile({ ...userData })
          setToken(savedToken)
        } else {
          console.log('[AuthContext] getMe failed, logging out');
          handleLogout()
        }
      } catch (err) {
        console.error('[AuthContext] getMe error:', err);
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
      setUser({ ...enrichedUser });
      setProfile({ ...enrichedUser });

      // Immediately hydrate merged profile fields (buyers/experts + profiles)
      try {
        const me = await authApi.getMe(tokens.accessToken);
        if (me.success && me.data?.user) {
          const hydrated = processUserData(me.data.user);
          setUser(hydrated ? { ...hydrated } : null);
          setProfile(hydrated ? { ...hydrated } : null);
        }
      } catch {
        // Non-fatal; fallback to login payload
      }
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

  const switchRole = async () => {
    if (!token) return;
    try {
      const res = await authApi.switchRole(token);
      if (res.success) {
        const { role, tokens } = res.data;
        localStorage.setItem('token', tokens.accessToken);
        setToken(tokens.accessToken);

        // Hydrate merged profile fields (profiles + buyers/experts) using the new token
        try {
          const me = await authApi.getMe(tokens.accessToken);
          if (me.success && me.data?.user) {
            const hydrated = processUserData(me.data.user);
            setUser(hydrated ? { ...hydrated } : null);
            setProfile(hydrated ? { ...hydrated } : null);
          } else {
            // Fallback: at least update role locally
            setUser(prev => prev ? { ...prev, role } : null);
            setProfile(prev => prev ? { ...prev, role: normalizeRole(role) } : null);
          }
        } catch {
          // Non-fatal; fallback to role-only update
          setUser(prev => prev ? { ...prev, role } : null);
          setProfile(prev => prev ? { ...prev, role: normalizeRole(role) } : null);
        }

        toast.success(`Switched to ${role === 'buyer' ? 'Buying' : 'Selling'}`);
      }
    } catch (error) {
      toast.error('Failed to switch role');
      console.error(error);
    }
  }

  const updateProfile = async (profileUpdates: any) => {
    if (!token) throw new Error('Not authenticated')

    const response = await authApi.updateProfile(token, profileUpdates)

    if (response.success && response.data) {
      const updatedData = response.data?.user ?? response.data;

      setUser((prev: any) => {
        if (!prev) return null;
        const newData = processUserData({
          ...prev,
          ...updatedData,
          avatar_url: updatedData.avatar_url !== undefined ? updatedData.avatar_url : prev.avatar_url,
          banner_url: updatedData.banner_url !== undefined ? updatedData.banner_url : prev.banner_url,
        });
        console.log('[AuthContext] Setting user avatar_url:', newData?.avatar_url);
        return newData;
      });

      setProfile((prev: any) => {
        if (!prev) return null;
        return processUserData({
          ...prev,
          ...updatedData,
          avatar_url: updatedData.avatar_url !== undefined ? updatedData.avatar_url : prev.avatar_url,
          banner_url: updatedData.banner_url !== undefined ? updatedData.banner_url : prev.banner_url,
        });
      });
    } else {
      throw new Error('Profile update failed')
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, token, isLoading, isAuthenticated: !!token && !!user,
      signIn, signUp, signOut, logout: signOut, switchRole, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}