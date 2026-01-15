import { request } from '../utils/api.js';

// 商家登录
// POST /merchant/auth/login
export const merchantLoginApi = (username, password) => {
  return request('/merchant/auth/login', 'POST', { username, password });
};


