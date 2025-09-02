import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, dbOperations, UserProfile } from '../lib/supabase'

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const profile = await dbOperations.getUserProfile(session.user.id)
        setAuthState({
          user: session.user,
          profile,
          session,
          loading: false
        })
      } else {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await dbOperations.getUserProfile(session.user.id)
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      throw error
    }

    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      throw new Error('No user logged in')
    }

    const success = await dbOperations.updateUserProfile(authState.user.id, updates)
    
    if (success) {
      // Refresh profile data
      const updatedProfile = await dbOperations.getUserProfile(authState.user.id)
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile
      }))
    }

    return success
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile
  }
}