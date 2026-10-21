import { useQuery } from "@tanstack/react-query";
import { getMe } from "../services/authServices";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth-user"],

    queryFn: getMe,

    retry: false,

    staleTime: 1000 * 60 * 5,
  });
};