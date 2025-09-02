import { createClient } from '@supabase/supabase-js'
import { UserProfile, EligibilitySubmission } from '../types/form'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const dbOperations = {
  // User Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating user profile:', error)
      return false
    }
    
    return true
  },

  // Eligibility Submission operations
  async createSubmission(submission: Omit<EligibilitySubmission, 'id' | 'reference_id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('eligibility_submissions')
      .insert(submission)
      .select('reference_id')
      .single()
    
    if (error) {
      console.error('Error creating submission:', error)
      return null
    }
    
    return data.reference_id
  },

  async getUserSubmissions(userId: string): Promise<EligibilitySubmission[]> {
    const { data, error } = await supabase
      .from('eligibility_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching submissions:', error)
      return []
    }
    
    return data || []
  },

  async getSubmissionByReference(referenceId: string): Promise<EligibilitySubmission | null> {
    const { data, error } = await supabase
      .from('eligibility_submissions')
      .select('*')
      .eq('reference_id', referenceId)
      .single()
    
    if (error) {
      console.error('Error fetching submission by reference:', error)
      return null
    }
    
    return data
  }
}