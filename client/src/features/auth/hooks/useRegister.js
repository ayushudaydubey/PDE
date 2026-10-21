import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../services/authServices";
import { toast } from "react-toastify";

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      toast.success("Registration Successful");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Register Failed"
      );
    },
  });
};