import { create, StateCreator } from 'zustand'; // Import StateCreator
import { User } from '../models/User';
import { LoginDto } from '../api/authClient';
// NOTE: loginUser, logoutUser, and fetchCurrentUser are not exported from authClient.
// Use the React Query hooks (useLoginUser, useLogoutUser, useCurrentUser) in your components instead.
// Then update the store state based on the results of those hooks.

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

    login: async (_credentials: LoginDto) => {
        // This function is a stub. Use the useLoginUser hook in your React component,
        // then update the store state based on the result.
        throw new Error('login() should be handled via useLoginUser hook in a React component.');
    },

    logout: async () => {
        // This function is a stub. Use the useLogoutUser hook in your React component,
        // then update the store state based on the result.
        throw new Error('logout() should be handled via useLogoutUser hook in a React component.');
    },

    checkSession: async () => {
        // This function is a stub. Use the useCurrentUser hook in your React component,
        // then update the store state based on the result.
        throw new Error('checkSession() should be handled via useCurrentUser hook in a React component.');
    },
}));

export default useAuthStore;