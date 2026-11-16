import { getSupabase } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'libro_auth_session';
const ADMIN_CREDENTIALS_KEY = 'libro_admin_credentials';

export interface AdminUser {
  username: string;
  name: string;
  lastLogin?: string;
}

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123', // Default initial password
  name: 'Head Librarian'
};

class AuthService {
  private getStoredCredentials() {
    try {
      const data = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore
    }
    return DEFAULT_ADMIN;
  }

  getCurrentUser(): AdminUser | null {
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch {
      // Ignore
    }
    return null;
  }

  isAdmin(): boolean {
    return this.getCurrentUser() !== null;
  }

  async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanUsername = usernameInput.trim();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    // 1. Try Supabase cloud authentication first (enables cross-device login)
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .ilike('username', cleanUsername)
          .limit(1);

        if (!error && data && data.length > 0) {
          const adminRecord = data[0];
          if (adminRecord.password === cleanPassword) {
            const user: AdminUser = {
              username: adminRecord.username,
              name: adminRecord.name || 'Head Librarian',
              lastLogin: new Date().toISOString()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
            localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(adminRecord));
            return { success: true, user };
          } else {
            return {
              success: false,
              error: 'Invalid password. Please check your credentials.'
            };
          }
        }
      } catch (err) {
        console.warn('Supabase auth query error, falling back to local credentials:', err);
      }
    }

    // 2. Fallback to LocalStorage credentials / default initial admin
    const creds = this.getStoredCredentials();
    if (
      cleanUsername.toLowerCase() === creds.username.toLowerCase() &&
      cleanPassword === creds.password
    ) {
      const user: AdminUser = {
        username: creds.username,
        name: creds.name || 'Head Librarian',
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      // If Supabase is connected, auto-sync this valid admin to cloud so other devices can log in immediately
      if (supabase) {
        try {
          await supabase.from('admin_users').upsert({
            username: creds.username,
            password: creds.password,
            name: creds.name || 'Head Librarian'
          }, { onConflict: 'username' });
        } catch {
          // Ignore
        }
      }

      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid username or password.'
    };
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  async updateCredentials(
    currentPassword: string,
    newUsername: string,
    newPassword: string,
    newName?: string
  ): Promise<{ success: boolean; error?: string }> {
    const creds = this.getStoredCredentials();
    const cleanCurrentPass = currentPassword.trim();
    const cleanNewUser = newUsername.trim();
    const cleanNewPass = newPassword.trim();
    const cleanName = newName?.trim() || creds.name || 'Head Librarian';

    if (!cleanNewUser || !cleanNewPass) {
      return { success: false, error: 'Username and password cannot be empty.' };
    }

    const supabase = getSupabase();
    let verifiedInCloud = false;

    // 1. If Supabase is connected, check and update in Cloud
    if (supabase) {
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('*')
          .ilike('username', creds.username)
          .limit(1);

        if (data && data.length > 0) {
          if (data[0].password === cleanCurrentPass) {
            verifiedInCloud = true;
            // Update in Supabase cloud
            await supabase
              .from('admin_users')
              .update({
                username: cleanNewUser,
                password: cleanNewPass,
                name: cleanName,
                updated_at: new Date().toISOString()
              })
              .eq('id', data[0].id);
          } else {
            return { success: false, error: 'Current password does not match database records.' };
          }
        }
      } catch (e) {
        console.warn('Could not update admin in Supabase:', e);
      }
    }

    // 2. If not verified via cloud, check local password
    if (!verifiedInCloud) {
      if (cleanCurrentPass !== creds.password) {
        return { success: false, error: 'Current password does not match.' };
      }

      // Sync new credentials to Supabase if connected
      if (supabase) {
        try {
          await supabase.from('admin_users').upsert({
            username: cleanNewUser,
            password: cleanNewPass,
            name: cleanName
          }, { onConflict: 'username' });
        } catch (e) {
          console.warn('Could not insert admin to Supabase:', e);
        }
      }
    }

    // 3. Update local cache
    const updated = {
      username: cleanNewUser,
      password: cleanNewPass,
      name: cleanName
    };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(updated));

    // Update active session
    const currentSession = this.getCurrentUser();
    if (currentSession) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        ...currentSession,
        username: updated.username,
        name: updated.name
      }));
    }

    return { success: true };
  }
}

export const authService = new AuthService();
