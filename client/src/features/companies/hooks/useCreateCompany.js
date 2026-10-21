import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCompany } from "../services/companyService";

import { COMPANY_QUERY_KEYS } from "../api/companyApi";

import { toast } from "react-toastify";

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,

    onSuccess: () => {
      toast.success("Company Created");

      queryClient.invalidateQueries({
        queryKey: COMPANY_QUERY_KEYS.ALL,
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message
      );
    },
  });
};