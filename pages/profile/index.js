import { merchantProfileApi, merchantProfileUpdateApi } from '../../api/profile.js';

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
    contact: '',
    address: '',
    loading: false,
    saving: false,
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
      this.setData({
        profile: data,
        contact: data.contact || '',
        address: data.address || '',
      });
      // 同步 name 等信息到本地存储，方便首页展示
      const old = wx.getStorageSync('merchant_profile') || {};
      wx.setStorageSync('merchant_profile', {
        ...old,
        merchantId: data.merchantId || old.merchantId,
        name: data.name || old.name,
        type: data.type || old.type,
      });
    } catch (e) {
      console.log('load merchant profile failed', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  onContactInput(e) {
    this.setData({ contact: (e.detail && e.detail.value) || '' });
  },

  onAddressInput(e) {
    this.setData({ address: (e.detail && e.detail.value) || '' });
  },

  async onSave() {
    if (!ensureLogin()) return;
    const { contact, address, saving } = this.data;
    if (saving) return;

    if (!contact && !address) {
      wx.showToast({ title: '请至少填写一项内容', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    try {
      const res = await merchantProfileUpdateApi({
        contact: contact.trim(),
        address: address.trim(),
      });
      const data = res.data || {};
      this.setData({
        profile: data,
        contact: data.contact || contact,
        address: data.address || address,
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
      console.log('update merchant profile failed', e);
    } finally {
      this.setData({ saving: false });
    }
  },

  onLogout() {
    wx.removeStorageSync('merchant_token');
    wx.removeStorageSync('merchant_profile');
    wx.reLaunch({ url: '/pages/login/index' });
  },
});


