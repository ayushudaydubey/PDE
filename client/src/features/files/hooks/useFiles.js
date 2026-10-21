import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from '../api/filesApi';

export const useFiles = (params = {}, options = {}) => {
  return useQuery({ 
    queryKey: ['files', params], 
    queryFn: () => fetchFiles(params), 
    staleTime: 1000 * 60 * 2,
    ...options
  });
};
