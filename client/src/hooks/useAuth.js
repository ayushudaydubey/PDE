import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user || response.data;
  } catch (error) {
    return null;
  }
};

export const useAuth = () => {
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchUser,
    retry: false,
    staleTime: 15 * 60 * 1000, // 15 mins
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    refetchUser: refetch,
  };
};
