import { merchantProfileApi } from '../../api/profile.js';

const ensureLogin = () => {
  const token = wx.getStorageSync('merchant_token');
  if (!token) {
    wx.reLaunch({ url: '/pages/login/index' });
    return false;
  }
  return true;
};

Page({
  data: {
    profile: {},
    loading: false,
  },

  onShow() {
    if (!ensureLogin()) return;
    this.loadProfile();
  },

  async loadProfile() {
    this.setData({ loading: true });
    try {
      const res = await merchantProfileApi();
      const data = res.data || {};
      this.setData({ profile: data });
      
      // 同步 name 等信息到本地存储，方便首页展示
      const old = wx.getStorageSync('merchant_profile') || {};
      wx.setStorageSync('merchant_profile', {
        ...old,
        merchantId: data.merchantId || old.merchantId,
        name: data.merchantName || old.name,
        type: data.merchantType || old.type,
      });
    } catch (e) {
      console.log('load merchant profile failed', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  onLogout() {
    wx.removeStorageSync('merchant_token');
    wx.removeStorageSync('merchant_profile');
    wx.reLaunch({ url: '/pages/login/index' });
  },

  onEditResource() {
    if (this.data.profile.resourceId) {
      wx.navigateTo({ url: '/pages/resource/edit' });
    }
  },
});


