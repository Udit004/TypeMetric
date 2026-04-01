import axios from "axios";

import { api } from "@/share/servies/api";
import {
  ProfileDashboard,
  ProfileIdentity,
  SearchUserResult,
} from "../types";

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || "Request failed";
  }

  return "Request failed";
}

function buildAuthHeaders(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getMyProfileApi(token: string): Promise<ProfileDashboard> {
  try {
    const { data } = await api.get<ProfileDashboard>(
      "/profile/me",
      buildAuthHeaders(token)
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateMyProfileApi(
  payload: Partial<ProfileIdentity>,
  token: string
): Promise<ProfileIdentity> {
  try {
    const { data } = await api.patch<{ profile: ProfileIdentity }>(
      "/profile/me",
      payload,
      buildAuthHeaders(token)
    );
    return data.profile;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function searchProfileUsersApi(
  query: string,
  token: string
): Promise<SearchUserResult[]> {
  try {
    const { data } = await api.get<{ users: SearchUserResult[] }>("/profile/search", {
      ...buildAuthHeaders(token),
      params: { q: query },
    });
    return data.users;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function sendFriendRequestApi(
  targetUserId: string,
  token: string
): Promise<void> {
  try {
    await api.post(
      "/profile/friends/requests",
      { targetUserId },
      buildAuthHeaders(token)
    );
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function acceptFriendRequestApi(
  requestId: string,
  token: string
): Promise<void> {
  try {
    await api.post(
      `/profile/friends/requests/${requestId}/accept`,
      {},
      buildAuthHeaders(token)
    );
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function deleteFriendRequestApi(
  requestId: string,
  token: string
): Promise<void> {
  try {
    await api.delete(
      `/profile/friends/requests/${requestId}`,
      buildAuthHeaders(token)
    );
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function removeFriendApi(
  friendUserId: string,
  token: string
): Promise<void> {
  try {
    await api.delete(`/profile/friends/${friendUserId}`, buildAuthHeaders(token));
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
