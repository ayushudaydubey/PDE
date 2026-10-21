import { useMutation } from '@tanstack/react-query';
import { exportFile } from '../api/filesApi';

export const useExport = () => {
  return useMutation({ mutationFn: ({ fileId, params }) => exportFile(fileId, params) });
};
