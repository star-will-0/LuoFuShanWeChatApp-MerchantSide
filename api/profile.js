import { request } from '../utils/api.js';

// GET /merchant/profile
export const merchantProfileApi = () => {
  return request('/merchant/profile', 'GET');
};

// POST /merchant/profile/update
export const merchantProfileUpdateApi = (payload = {}) => {
  const body = {};
  if (payload.contact !== undefined) body.contact = payload.contact;
  if (payload.address !== undefined) body.address = payload.address;
  return request('/merchant/profile/update', 'POST', body);
};


