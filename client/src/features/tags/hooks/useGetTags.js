import { useQuery } from "@tanstack/react-query";
import { getTagsApi } from "../api/tagApi";

const useGetTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: getTagsApi,
  });
};

export default useGetTags;