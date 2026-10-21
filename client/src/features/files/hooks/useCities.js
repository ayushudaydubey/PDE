import { useQuery } from '@tanstack/react-query';
import { fetchFileCities } from '../api/filesApi';

export const useCities = (fileId, params = {}) => {
  return useQuery({
    queryKey: ['file', fileId, 'cities', params.country, params.industry, params.tag],
    queryFn: () => fetchFileCities(fileId, params),
    enabled: !!fileId,
  });
};
