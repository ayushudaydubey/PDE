import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTagApi } from "../api/tagApi";
import { toast } from "react-toastify";

const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTagApi,

    onSuccess: () => {
      toast.success("Tag Created");

      queryClient.invalidateQueries({
        queryKey: ["tags"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to create tag"
      );
    },
  });
};

export default useCreateTag;