import { useQuery } from "@tanstack/react-query";

import axiosInstance from "../../../api/axios";

export const useImportHistory = () => {
  return useQuery({
    queryKey: ["import-history"],

    queryFn: async () => {
      const response =
        await axiosInstance.get(
          "/import/history"
        );

      return response.data;
    },
  });
};