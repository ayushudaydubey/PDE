import { useQuery } from '@tanstack/react-query';
import { fetchFileCompanies } from '../api/filesApi';

export const useFileCompanies = (fileId, params) => {
  return useQuery({
    queryKey: ['file', fileId, 'companies', params],
    queryFn: () => fetchFileCompanies(fileId, params),
    keepPreviousData: true,
    enabled: !!fileId,
  });
};
