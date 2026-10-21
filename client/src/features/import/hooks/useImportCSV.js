import { useMutation } from "@tanstack/react-query";

import axiosInstance from "../../../api/axios";

import { toast } from "react-toastify";

export const useImportCSV = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();

      formData.append("file", file);

      const response =
        await axiosInstance.post(
          "/import/csv",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      return response.data;
    },

    onSuccess: () => {
      toast.success(
        "CSV Imported Successfully"
      );
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Import Failed"
      );
    },
  });
};