import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthError, AuthResponse } from '@supabase/supabase-js';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  username?: string;
  avatarFile?: File | null;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient();
  }

  async signUp({ email, password, username, avatarFile }: SignUpData): Promise<AuthResponse> {
    try {
      // Validate password strength
      if (!this.isPasswordStrong(password)) {
        throw new Error(
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        );
      }

      // First, sign up the user
      const authResponse = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (authResponse.error) throw authResponse.error;

      // If we have a user, create their profile
      if (authResponse.data?.user) {
        const userId = authResponse.data.user.id;
        const derivedUsername = username || email.split('@')[0];

        // Upload avatar if provided
        let avatarUrl = null;
        if (avatarFile) {
          try {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await this.supabase.storage
              .from('avatars')
              .upload(fileName, avatarFile);

            if (!uploadError) {
              const { data: { publicUrl } } = this.supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
              avatarUrl = publicUrl;
            }
          } catch (error) {
            console.error('Avatar upload error:', error);
            // Continue with signup even if avatar upload fails
          }
        }

        // Create the profile
        const { error: profileError } = await this.supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            username: derivedUsername,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue with signup even if profile creation fails
        }

        // Update user metadata
        await this.supabase.auth.updateUser({
          data: {
            username: derivedUsername,
            avatar_url: avatarUrl
          }
        });
      }

      return authResponse;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  async login({ email, password }: LoginData): Promise<AuthResponse> {
    try {
      const authResponse = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authResponse.error) throw authResponse.error;

      // Store the session tokens
      if (authResponse.data.session) {
        const { access_token, refresh_token } = authResponse.data.session;
        this.setAuthState({ access_token, refresh_token });
      }

      return authResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
      this.clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async refreshSession(): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        this.clearAuthState();
        throw new Error('No session found');
      }

      const { access_token, refresh_token } = session;
      this.setAuthState({ access_token, refresh_token });
    } catch (error) {
      console.error('Session refresh error:', error);
      throw error;
    }
  }

  private setAuthState(state: AuthState): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_state', JSON.stringify(state));
    }
  }

  private clearAuthState(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_state');
    }
  }

  private isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      if (!this.isPasswordStrong(newPassword)) {
        throw new Error('Password does not meet security requirements');
      }

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 