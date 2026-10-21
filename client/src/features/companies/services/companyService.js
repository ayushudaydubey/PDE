import axiosInstance from "../../../api/axios";

export const getCompanies = async () => {
  const response = await axiosInstance.get("/company");

  return response.data;
};

export const getCompanyById = async (id) => {
  const response = await axiosInstance.get(
    `/company/${id}`
  );

  return response.data;
};

export const createCompany = async (data) => {
  const response = await axiosInstance.post(
    "/company",
    data
  );

  return response.data;
};

export const searchCompanies = async (query) => {
  const response = await axiosInstance.get(
    `/company/search?keyword=${query}`
  );

  return response.data;
};