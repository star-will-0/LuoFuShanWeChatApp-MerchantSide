// =========================================================================
// 商家端 - 网络请求封装 (Promise)
// 自动附带 Authorization: Bearer {merchant_token}
// =========================================================================

// 请将此处替换为你实际的后端服务器域名
const BASE_URL = 'https://www.picarran.xyz:8002';

const getMerchantToken = () => wx.getStorageSync('merchant_token');

export const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    const token = getMerchantToken();

    const header = {
      'content-type': 'application/json',
    };

    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      success: (res) => {
        // 兼容：后端统一返回 { code, msg, data }
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          resolve(res.data);
          return;
        }

        // 鉴权失败：清 token，回登录页
        if (res.data && res.data.code === 401) {
          wx.removeStorageSync('merchant_token');
          wx.removeStorageSync('merchant_profile');
          wx.showToast({ title: '登录失效，请重新登录', icon: 'none' });
          wx.reLaunch({ url: '/pages/login/index' });
          reject(res.data);
          return;
        }

        wx.showToast({ title: (res.data && res.data.msg) || '请求失败', icon: 'none' });
        reject(res.data || res);
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接异常', icon: 'none' });
        reject(err);
      },
    });
  });
};


