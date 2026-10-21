import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFile } from '../api/filesApi';

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId) => deleteFile(fileId),
    onSuccess: (_data, fileId) => {
      // Refresh files list
      queryClient.invalidateQueries({ queryKey: ['files'] });
      // Refresh global companies list so /companies page reflects deletions immediately
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      // Refresh file-specific companies if any file detail view is open
      if (fileId) {
        queryClient.invalidateQueries({ queryKey: ['file', fileId, 'companies'] });
        queryClient.invalidateQueries({ queryKey: ['fileTags', fileId] });
      }
    },
  });
};
