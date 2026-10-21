import api from '../../../api/axios';

export const fetchFiles = async (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const res = await api.get(`/files${search ? '?' + search : ''}`);
  return res.data;
};

export const fetchFileCompanies = async (fileId, params = {}) => {
  const search = new URLSearchParams(params).toString();
  const res = await api.get(`/files/${fileId}/companies${search ? '?' + search : ''}`);
  return res.data;
};

export const fetchFileCities = async (fileId, params = {}) => {
  const search = new URLSearchParams(params).toString();
  const res = await api.get(`/files/${fileId}/cities${search ? '?' + search : ''}`);
  return res.data.data || [];
};

export const fetchFileIndustries = async (fileId, params = {}) => {
  const search = new URLSearchParams(params).toString();
  const res = await api.get(`/files/${fileId}/industries${search ? '?' + search : ''}`);
  return res.data.data || [];
};

export const fetchFileCountries = async (fileId, params = {}) => {
  const search = new URLSearchParams(params).toString();
  const res = await api.get(`/files/${fileId}/countries${search ? '?' + search : ''}`);
  return res.data.data || [];
};

export const exportFile = async (fileId, params = {}) => {
  const q = new URLSearchParams(params).toString();
  const url = `/files/${fileId}/export${q ? '?' + q : ''}`;
  // Return full response for blob download
  const res = await api.get(url, { responseType: 'blob' });
  return res;
};

export const deleteFile = async (fileId) => {
  const res = await api.delete(`/files/${fileId}`);
  return res.data;
};
