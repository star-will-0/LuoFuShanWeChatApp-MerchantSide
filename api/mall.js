import { request } from '../utils/api.js';

// GET /merchant/mall/item/list
export const merchantMallItemListApi = ({ page = 1, size = 10, sort = '' } = {}) => {
  const params = { page, size };
  if (sort) params.sort = sort;
  return request('/merchant/mall/item/list', 'GET', params);
};


