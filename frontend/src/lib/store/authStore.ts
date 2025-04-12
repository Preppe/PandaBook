import { create, StateCreator } from 'zustand'; // Import StateCreator
import {
    loginUser,
    logoutUser,
    fetchCurrentUser,
    User,
    LoginDto, // Use the DTO defined in authClient for credentials
} from '../api/authClient';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean; // Start true to check session on load
}

interface AuthActions {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const useAuthStore = create<AuthState & AuthActions>((set) => ({
    // Initial State
    isAuthenticated: false,
    user: null,
    isLoading: true, // Start loading until session is checked

    // Actions
    setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    login: async (credentials: LoginDto) => {
        set({ isLoading: true });
        try {
            const user = await loginUser(credentials);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error('Login failed:', error);
            set({ user: null, isAuthenticated: false, isLoading: false });
            // Re-throw to allow UI components to handle login failure (e.g., show error message)
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await logoutUser();
            set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            console.error('Logout failed:', error);
            // Still reset state locally even if backend logout fails
            set({ user: null, isAuthenticated: false, isLoading: false });
            // Re-throw to allow UI components to handle logout failure if needed
            throw error;
        }
    },

    checkSession: async () => {
        // isLoading is initially true, set it to false only after the check completes
        try {
            const user = await fetchCurrentUser();
            set({ user, isAuthenticated: !!user, isLoading: false });
        } catch (error) {
            console.error('Session check failed:', error);
            // If session check fails (e.g., network error, invalid token), treat as logged out
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));

export default useAuthStore;