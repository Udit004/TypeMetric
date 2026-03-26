"use client";

import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { clearStoredToken, getStoredToken, setStoredToken } from "@/share/lib/auth-storage";
import { getMeApi, loginApi, registerApi } from "@/share/servies/authService";
import { AuthUser, LoginPayload, RegisterPayload } from "@/share/types/auth";

export interface AuthContextValue {
	user: AuthUser | null;
	token: string | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	register: (payload: RegisterPayload) => Promise<void>;
	login: (payload: LoginPayload) => Promise<void>;
	logout: () => void;
	refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const applyAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
		setStoredToken(nextToken);
		setToken(nextToken);
		setUser(nextUser);
	}, []);

	const logout = useCallback(() => {
		clearStoredToken();
		setToken(null);
		setUser(null);
	}, []);

	const refreshMe = useCallback(async () => {
		const currentToken = getStoredToken();

		if (!currentToken) {
			logout();
			return;
		}

		try {
			const response = await getMeApi(currentToken);
			setToken(currentToken);
			setUser(response.user);
		} catch {
			logout();
		}
	}, [logout]);

	const register = useCallback(
		async (payload: RegisterPayload) => {
			const response = await registerApi(payload);
			applyAuth(response.token, response.user);
		},
		[applyAuth]
	);

	const login = useCallback(
		async (payload: LoginPayload) => {
			const response = await loginApi(payload);
			applyAuth(response.token, response.user);
		},
		[applyAuth]
	);

	useEffect(() => {
		let mounted = true;

		const initAuth = async () => {
			try {
				await refreshMe();
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		};

		void initAuth();

		return () => {
			mounted = false;
		};
	}, [refreshMe]);

	const value = useMemo(
		() => ({
			user,
			token,
			isLoading,
			isAuthenticated: Boolean(user && token),
			register,
			login,
			logout,
			refreshMe,
		}),
		[isLoading, login, logout, refreshMe, register, token, user]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuthContext must be used within AuthProvider");
	}

	return context;
}
