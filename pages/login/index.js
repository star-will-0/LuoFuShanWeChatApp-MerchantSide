import { merchantLoginApi } from '../../api/auth.js';

Page({
  data: {
    username: '',
    password: '',
    loading: false,
  },

  onShow() {
    const token = wx.getStorageSync('merchant_token');
    if (token) {
      wx.switchTab({ url: '/pages/home/index' });
    }
  },

  onUsernameInput(e) {
    this.setData({ username: (e.detail && e.detail.value) || '' });
  },

  onPasswordInput(e) {
    this.setData({ password: (e.detail && e.detail.value) || '' });
  },

  async onLogin() {
    const { username, password, loading } = this.data;
    if (loading) return;

    if (!username || !password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await merchantLoginApi(username, password);
      const data = res.data || {};

      wx.setStorageSync('merchant_token', data.token || '');
      wx.setStorageSync('merchant_profile', {
        merchantId: data.merchantId,
        name: data.name,
      });

      wx.showToast({ title: '登录成功', icon: 'success' });
      wx.switchTab({ url: '/pages/home/index' });
    } catch (e) {
      // utils/api.js 已统一 toast
      console.log('login failed', e);
    } finally {
      this.setData({ loading: false });
    }
  },
});


