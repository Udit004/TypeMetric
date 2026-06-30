import axios from "axios";
import { getStoredToken } from "@/share/lib/auth-storage";

export function getApiBaseUrl(): string {
	return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
}

export const api = axios.create({
	baseURL: getApiBaseUrl(),
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = getStoredToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);
