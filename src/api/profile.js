import api from "./axiosInstance";

export const getProfile = () => {
  return api.get("/profile");
};

export const updateProfile = (payload) => {
    return api.put("/profile", payload);
};