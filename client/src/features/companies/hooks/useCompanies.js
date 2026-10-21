import { useQuery } from "@tanstack/react-query";

import { getCompanies } from "../services/companyService";

import { COMPANY_QUERY_KEYS } from "../api/companyApi";

export const useCompanies = () => {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.ALL,

    queryFn: getCompanies,
  });
};