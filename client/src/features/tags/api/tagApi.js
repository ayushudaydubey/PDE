import axiosInstance from "../../../services/axiosInstance";

export const createTagApi = async (data) => {
  const response = await axiosInstance.post(
    "/tag",
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getTagsApi = async () => {
  const response = await axiosInstance.get(
    "/tag",
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const deleteTagApi = async (id) => {
  const response = await axiosInstance.delete(
    `/tag/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};