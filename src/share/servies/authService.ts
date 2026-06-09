import axios from "axios";

import { api } from "@/share/servies/api";
import {
	AuthResponse,
	AuthUser,
	LoginPayload,
	RegisterPayload,
} from "@/share/types/auth";

function getApiErrorMessage(error: unknown): string {
	if (axios.isAxiosError<{ message?: string }>(error)) {
		return error.response?.data?.message || error.message || "Request failed";
	}

	return "Request failed";
}

function getBackendOrigin(): string {
	const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
	return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}

export function getGoogleAuthUrl(): string {
	return `${getBackendOrigin()}/api/v1/auth/google`;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
	try {
		const { data } = await api.post<AuthResponse>("/auth/register", payload);
		return data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error));
	}
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
	try {
		const { data } = await api.post<AuthResponse>("/auth/login", payload);
		return data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error));
	}
}

export async function getMeApi(token: string): Promise<{ user: AuthUser }> {
	try {
		const { data } = await api.get<{ user: AuthUser }>("/auth/me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error));
	}
}
