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
