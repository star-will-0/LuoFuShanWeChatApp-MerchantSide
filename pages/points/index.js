import { merchantUserPointsApi, merchantUserPointsUpdateApi } from '../../api/points.js';

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
    userId: '',
    delta: '',
    reason: '',

    queryLoading: false,
    updateLoading: false,

    pointsInfo: null,
    updateResult: null,
  },

  onShow() {
    ensureLogin();
  },

  onHide() {
    // 页面隐藏时重置状态
    this.resetState();
  },

  // 重置页面状态
  resetState() {
    this.setData({
      userId: '',
      delta: '',
      reason: '',
      queryLoading: false,
      updateLoading: false,
      pointsInfo: null,
      updateResult: null,
    });
  },

  onUserIdInput(e) {
    this.setData({ userId: (e.detail && e.detail.value) || '' });
  },

  onDeltaInput(e) {
    this.setData({ delta: (e.detail && e.detail.value) || '' });
  },

  onReasonInput(e) {
    this.setData({ reason: (e.detail && e.detail.value) || '' });
  },

  async onQuery() {
    if (!ensureLogin()) return;
    const { userId, queryLoading } = this.data;
    if (queryLoading) return;

    const id = Number(userId);
    if (!id) {
      wx.showToast({ title: '请输入正确的 userId', icon: 'none' });
      return;
    }

    this.setData({ queryLoading: true, pointsInfo: null, updateResult: null });
    try {
      const res = await merchantUserPointsApi(id);
      this.setData({ pointsInfo: res.data || { userId: id, points: 0 } });
    } catch (e) {
      console.log('query points failed', e);
    } finally {
      this.setData({ queryLoading: false });
    }
  },

  async onUpdate() {
    if (!ensureLogin()) return;
    const { userId, delta, reason, updateLoading } = this.data;
    if (updateLoading) return;

    const id = Number(userId);
    if (!id) {
      wx.showToast({ title: '请输入正确的 userId', icon: 'none' });
      return;
    }

    const d = Number(delta);
    if (!Number.isFinite(d) || d === 0) {
      wx.showToast({ title: '请输入正确的 delta（且不能为 0）', icon: 'none' });
      return;
    }

    this.setData({ updateLoading: true, updateResult: null });
    try {
      const res = await merchantUserPointsUpdateApi({ userId: id, delta: d, reason: (reason || '').trim() });
      this.setData({ 
        updateResult: res.data || null, 
        pointsInfo: res.data || this.data.pointsInfo,
        // 更新成功后清空积分变更值
        delta: '',
        reason: ''
      });
      wx.showToast({ title: '更新成功', icon: 'success' });
    } catch (e) {
      console.log('update points failed', e);
    } finally {
      this.setData({ updateLoading: false });
    }
  },
});


