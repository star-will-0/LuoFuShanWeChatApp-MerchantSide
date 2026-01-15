import { merchantExchangeListApi, merchantExchangeRedeemApi } from '../../api/exchange.js';

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
    // 核销
    redeemCode: '',
    redeemLoading: false,
    redeemResult: null,

    // 列表
    status: 'unredeemed',
    records: [],
    page: 1,
    size: 10,
    listLoading: false,
    hasMore: true,
  },

  onShow() {
    if (!ensureLogin()) return;
    this.refresh();
  },

  onPullDownRefresh() {
    this.refresh().finally(() => wx.stopPullDownRefresh());
  },

  onRedeemCodeInput(e) {
    this.setData({ redeemCode: (e.detail && e.detail.value) || '' });
  },

  async onRedeem() {
    if (!ensureLogin()) return;
    const { redeemCode, redeemLoading } = this.data;
    if (redeemLoading) return;

    const code = (redeemCode || '').trim();
    if (!code) {
      wx.showToast({ title: '请输入兑换卡密', icon: 'none' });
      return;
    }

    this.setData({ redeemLoading: true, redeemResult: null });
    try {
      const res = await merchantExchangeRedeemApi(code);
      this.setData({ redeemResult: res.data || null, redeemCode: '' });
      wx.showToast({ title: '核销成功', icon: 'success' });
      // 刷新未核销列表（通常核销后会减少）
      if (this.data.status === 'unredeemed') {
        await this.refresh();
      }
    } catch (e) {
      console.log('redeem failed', e);
    } finally {
      this.setData({ redeemLoading: false });
    }
  },

  setUnredeemed() {
    if (this.data.status === 'unredeemed') return;
    this.setData({ status: 'unredeemed' });
    this.refresh();
  },

  setRedeemed() {
    if (this.data.status === 'redeemed') return;
    this.setData({ status: 'redeemed' });
    this.refresh();
  },

  async refresh() {
    if (!ensureLogin()) return;
    this.setData({ page: 1, records: [], hasMore: true });
    await this.fetchList(true);
  },

  async loadMore() {
    await this.fetchList(false);
  },

  async fetchList(isFirstPage) {
    const { status, page, size, listLoading, hasMore } = this.data;
    if (listLoading) return;
    if (!isFirstPage && !hasMore) return;

    this.setData({ listLoading: true });
    try {
      const res = await merchantExchangeListApi({ status, page, size });
      const list = (res.data && (res.data.list || res.data.records || res.data.items)) || res.data || [];
      const next = Array.isArray(list) ? list : [];

      const merged = isFirstPage ? next : this.data.records.concat(next);
      const noMore = next.length < size;
      this.setData({
        records: merged,
        page: page + 1,
        hasMore: !noMore,
      });
    } catch (e) {
      console.log('fetch exchange list failed', e);
    } finally {
      this.setData({ listLoading: false });
    }
  },
});


