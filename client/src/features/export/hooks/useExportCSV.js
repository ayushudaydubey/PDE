import { useMutation } from "@tanstack/react-query";

import axiosInstance from "../../../api/axios";

import { toast } from "react-toastify";

export const useExportCSV = () => {
  return useMutation({
    mutationFn: async () => {
      const response =
        await axiosInstance.get(
          "/export/companies?format=csv",
          {
            responseType: "blob",
          }
        );

      return response.data;
    },

    onSuccess: (data) => {
      const url =
        window.URL.createObjectURL(
          new Blob([data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "companies.csv"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      toast.success(
        "CSV Export Successful"
      );
    },

    onError: () => {
      toast.error("CSV Export Failed");
    },
  });
};