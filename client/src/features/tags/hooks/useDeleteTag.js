import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTagApi } from "../api/tagApi";
import { toast } from "react-toastify";

const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagApi,

    onSuccess: () => {
      toast.success("Tag Deleted");

      queryClient.invalidateQueries({
        queryKey: ["tags"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Delete Failed"
      );
    },
  });
};

export default useDeleteTag;