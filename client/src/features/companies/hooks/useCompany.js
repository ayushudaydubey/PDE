import { useQuery } from "@tanstack/react-query";

import { getCompanyById } from "../services/companyService";

import { COMPANY_QUERY_KEYS } from "../api/companyApi";

export const useCompany = (id) => {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.DETAIL(id),

    queryFn: () => getCompanyById(id),

    enabled: !!id,
  });
};