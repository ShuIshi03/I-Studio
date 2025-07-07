import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

// Database types
export type Profile = {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  created_at: string
  updated_at: string
}

export type Subject = {
  id: string
  name: string
  created_at: string
}

export type Shift = {
  id: string
  teacher_id: string
  date: string
  start_time: string
  end_time: string
  subjects: string[]
  created_at: string
  updated_at: string
}

export type Reservation = {
  id: string
  student_id: string
  shift_id: string
  subject_id: string
  date: string
  start_time: string
  end_time: string
  notes: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

// Helper functions for database operations with better error handling
export const createProfile = async (profile: Omit<Profile, 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating profile:', error)
      throw new Error(`Failed to create profile: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Network error creating profile:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const getProfile = async (id: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
    
    if (error) {
      console.error('Error fetching profile:', error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }
    
    // Return the first profile if found, otherwise null
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Network error fetching profile:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const getSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching subjects:', error)
      throw new Error(`Failed to fetch subjects: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error('Network error fetching subjects:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const createSubject = async (name: string) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ name }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating subject:', error)
      throw new Error(`Failed to create subject: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Network error creating subject:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const getShifts = async () => {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching shifts:', error)
      throw new Error(`Failed to fetch shifts: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error('Network error fetching shifts:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const createShift = async (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .insert([shift])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating shift:', error)
      throw new Error(`Failed to create shift: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Network error creating shift:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const deleteShift = async (id: string) => {
  try {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting shift:', error)
      throw new Error(`Failed to delete shift: ${error.message}`)
    }
  } catch (error) {
    console.error('Network error deleting shift:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const getReservations = async () => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        student:profiles!student_id(name, email),
        subject:subjects(name),
        shift:shifts(teacher_id)
      `)
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching reservations:', error)
      throw new Error(`Failed to fetch reservations: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error('Network error fetching reservations:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservation])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating reservation:', error)
      throw new Error(`Failed to create reservation: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Network error creating reservation:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}

export const updateReservation = async (id: string, updates: Partial<Reservation>) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating reservation:', error)
      throw new Error(`Failed to update reservation: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Network error updating reservation:', error)
    throw new Error('Network error: Unable to connect to database')
  }
}