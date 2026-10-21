import { useMutation } from "@tanstack/react-query";

import axiosInstance from "../../../api/axios";

import { toast } from "react-toastify";

export const useExportExcel = () => {
  return useMutation({
    mutationFn: async () => {
      const response =
        await axiosInstance.get(
          "/export/companies?format=excel",
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
        "companies.xlsx"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      toast.success(
        "Excel Export Successful"
      );
    },

    onError: () => {
      toast.error("Excel Export Failed");
    },
  });
};