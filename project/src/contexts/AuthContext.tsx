import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, createProfile, getProfile, type Profile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
};

type LoginResult = {
  success: boolean;
  error?: 'email_not_confirmed' | 'invalid_credentials' | 'unknown';
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin') => Promise<boolean>;
  resendConfirmation: (email: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await loadUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      // Check if user is confirmed
      if (!authUser.email_confirmed_at) {
        console.log('User email not confirmed yet');
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await getProfile(authUser.id);
      
      // Check if profile exists
      if (!profile) {
        console.log('No profile found for user:', authUser.id);
        // Try to create profile from auth user metadata if it doesn't exist
        if (authUser.user_metadata?.name && authUser.user_metadata?.role) {
          try {
            const newProfile = await createProfile({
              id: authUser.id,
              name: authUser.user_metadata.name,
              email: authUser.email!,
              role: authUser.user_metadata.role
            });
            
            setUser({
              id: newProfile.id,
              name: newProfile.name,
              email: newProfile.email,
              role: newProfile.role
            });
          } catch (createError) {
            console.error('Error creating profile from metadata:', createError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        
        // Check for specific error types
        if (error.message === 'Email not confirmed') {
          return { success: false, error: 'email_not_confirmed' };
        } else if (error.message === 'Invalid login credentials') {
          return { success: false, error: 'invalid_credentials' };
        } else {
          return { success: false, error: 'unknown' };
        }
      }
      
      return { success: !!data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'unknown' };
    }
  };
  
  const register = async (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
    try {
      // Sign up with Supabase Auth with Japanese email configuration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
          data: {
            name,
            role,
            // Set locale for Japanese email templates
            locale: 'ja',
            // Additional metadata for Japanese email customization
            email_confirm_redirect_to: `${window.location.origin}/login?confirmed=true`,
            // Custom subject and content hints for Japanese
            custom_claims: {
              locale: 'ja',
              app_name: 'I Studio 予約システム'
            }
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        return false;
      }
      
      if (data.user) {
        try {
          // Create profile using the user ID from signup response
          await createProfile({
            id: data.user.id,
            name,
            email,
            role
          });
          
          return true;
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't clean up the auth user as they need to confirm email first
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const resendConfirmation = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
          // Add Japanese locale for resend emails
          data: {
            locale: 'ja',
            app_name: 'I Studio 予約システム'
          }
        }
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};