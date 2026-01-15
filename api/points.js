import { request } from '../utils/api.js';

// GET /merchant/user/points
export const merchantUserPointsApi = (userId) => {
  return request('/merchant/user/points', 'GET', { userId });
};

// POST /merchant/user/points/update
export const merchantUserPointsUpdateApi = ({ userId, delta, reason = '' }) => {
  const body = { userId, delta };
  if (reason) body.reason = reason;
  return request('/merchant/user/points/update', 'POST', body);
};


