import { request } from '../utils/api.js';

// GET /merchant/profile - 查询当前商家基础信息
export const merchantProfileApi = () => {
  return request('/merchant/profile', 'GET');
};

// GET /merchant/resource/detail - 查询商家资源内容
export const merchantResourceDetailApi = () => {
  return request('/merchant/resource/detail', 'GET');
};

// PUT /merchant/resource/base - 更新商家资源基础信息
export const merchantResourceBaseUpdateApi = (payload = {}) => {
  const body = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.coverImg !== undefined) body.coverImg = payload.coverImg;
  if (payload.latitude !== undefined) body.latitude = payload.latitude;
  if (payload.longitude !== undefined) body.longitude = payload.longitude;
  return request('/merchant/resource/base', 'PUT', body);
};

// PUT /merchant/resource/content - 更新商家资源内容
export const merchantResourceContentUpdateApi = (content = []) => {
  return request('/merchant/resource/content', 'PUT', { content });
};


