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

  login(usernameInput: string, passwordInput: string): { success: boolean; error?: string; user?: AdminUser } {
    const creds = this.getStoredCredentials();

    if (
      usernameInput.trim().toLowerCase() === creds.username.toLowerCase() &&
      passwordInput.trim() === creds.password
    ) {
      const user: AdminUser = {
        username: creds.username,
        name: creds.name || 'Head Librarian',
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid username or password. (Default: username "admin", password "admin123")'
    };
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  updateCredentials(currentPassword: string, newUsername: string, newPassword: string, newName?: string): { success: boolean; error?: string } {
    const creds = this.getStoredCredentials();

    if (currentPassword !== creds.password) {
      return { success: false, error: 'Current password does not match.' };
    }

    if (!newUsername.trim() || !newPassword.trim()) {
      return { success: false, error: 'Username and password cannot be empty.' };
    }

    const updated = {
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName?.trim() || creds.name
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
