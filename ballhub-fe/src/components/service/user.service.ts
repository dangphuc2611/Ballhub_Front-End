import axios from "axios";
import { API_URL as GLOBAL_API_URL } from "@/config/env";

const API_URL = `${GLOBAL_API_URL}/users`;

export const getMyProfile = async (token: string) => {
  const res = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateProfile = async (token: string, data: any) => {
  const res = await axios.put(`${API_URL}/me`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
