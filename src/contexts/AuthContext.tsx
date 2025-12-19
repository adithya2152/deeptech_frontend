import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  profile_picture_url: string | null
  date_of_birth: string | null
  gender: string | null
  title: string | null
  bio: string | null
  domains: string[] | null
  public_user_id: string | null
  setup_step: number | null
  is_completed: boolean | null
  created_at: string | null
  updated_at: string | null
  // Virtual fields from auth metadata
  role?: 'buyer' | 'expert' | 'admin'
  name?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: 'buyer' | 'expert', domains?: string[]) => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper to enrich user with metadata
  const enrichUser = (authUser: User | null): User | null => {
    if (!authUser) return null
    
    // Add role and name from user_metadata
    const enrichedUser = {
      ...authUser,
      role: authUser.user_metadata?.role || 'buyer', // Default to buyer if not set
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
    } as any
    
    console.log('🔧 Enriched user with metadata:', {
      id: enrichedUser.id,
      email: enrichedUser.email,
      role: enrichedUser.role,
      name: enrichedUser.name,
      metadata: authUser.user_metadata
    })
    
    return enrichedUser
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📍 Initial session:', session ? 'Found' : 'None')
      setSession(session)
      const enrichedUser = enrichUser(session?.user ?? null)
      setUser(enrichedUser)
      
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event, session?.user?.email)
        setSession(session)
        const enrichedUser = enrichUser(session?.user ?? null)
        setUser(enrichedUser)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('🔍 Fetching profile for user:', userId)
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.log('⏱️ Profile fetch timeout after 5 seconds')
          reject(new Error('Profile fetch timeout'))
        }, 5000)
      })
      
      // Race between query and timeout
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise])
      
      console.log('📦 Profile query result:', { data, error })
      
      if (error) {
        console.error('❌ Error fetching profile:', error.message)
        
        // Profile doesn't exist - use auth metadata
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata) {
          const mockProfile: Profile = {
            id: user.id, // Use user_id as id for mock profile
            user_id: user.id,
            first_name: user.user_metadata.name?.split(' ')[0] || null,
            last_name: user.user_metadata.name?.split(' ').slice(1).join(' ') || null,
            profile_picture_url: null,
            date_of_birth: null,
            gender: null,
            title: null,
            bio: null,
            domains: user.user_metadata.domains || null,
            public_user_id: null,
            setup_step: 0,
            is_completed: false,
            created_at: null,
            updated_at: null,
            role: user.user_metadata.role || 'buyer',
            name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
          }
          console.log('⚠️ Profile not in DB - using auth metadata:', mockProfile)
          setProfile(mockProfile)
        }
        setIsLoading(false)
        return
      }
      
      if (data) {
        // Merge DB profile with auth metadata for role
        const { data: { user } } = await supabase.auth.getUser()
        const enrichedProfile: Profile = {
          ...data,
          role: user?.user_metadata?.role || 'buyer',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User'
        }
        console.log('✅ Profile loaded:', enrichedProfile)
        setProfile(enrichedProfile)
      }
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) {
      console.error('❌ Sign in error:', error.message)
      throw error
    }
    
    console.log('✅ Signed in successfully')
  }

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'buyer' | 'expert',
    domains?: string[]
  ) => {
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name, 
          role,
          ...(domains && { domains })
        }
      }
    })
    
    if (authError) {
      console.error('❌ Sign up error:', authError.message)
      throw authError
    }

    if (!authData.user) {
      throw new Error('User creation failed')
    }

    console.log('✅ Auth user created:', authData.user.id)
    
    // Create profile in database
    const nameParts = name.split(' ')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        first_name: nameParts[0] || null,
        last_name: nameParts.slice(1).join(' ') || null,
        domains: domains || null,
        setup_step: 0,
        is_completed: false
      })
    
    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message)
      console.log('⚠️ Continuing with auth metadata only')
    } else {
      console.log('✅ Profile created in database')
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      // If session is missing, clear local state anyway
      if (error.message.includes('session missing')) {
        console.log('⚠️ Session already cleared, cleaning up local state')
      } else {
        console.error('❌ Sign out error:', error.message)
      }
    } else {
      console.log('✅ Signed out successfully')
    }
    
    // Always clear local state
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('No user logged in')
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('❌ Profile update error:', error.message)
      throw error
    }
    
    console.log('✅ Profile updated')
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
