import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../services/authServices";
import { toast } from "react-toastify";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,

    onSuccess: () => {
      toast.success("Login Successful");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    },
  });
};