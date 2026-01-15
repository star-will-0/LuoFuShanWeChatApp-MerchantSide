import { request } from '../utils/api.js';

// GET /merchant/exchange/list
export const merchantExchangeListApi = ({ status, page = 1, size = 10 } = {}) => {
  return request('/merchant/exchange/list', 'GET', { status, page, size });
};

// POST /merchant/exchange/redeem
export const merchantExchangeRedeemApi = (code) => {
  return request('/merchant/exchange/redeem', 'POST', { code });
};


