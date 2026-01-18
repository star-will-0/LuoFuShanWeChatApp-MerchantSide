import { merchantMallItemListApi } from '../../api/mall.js';

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
    merchantName: '',
    items: [],
    page: 1,
    size: 10,
    sortIndex: 0,
    sortOptions: [
      { label: '默认', value: '' },
      { label: '积分从高到低', value: 'points_desc' },
      { label: '积分从低到高', value: 'points_asc' },
    ],
    loading: false,
    hasMore: true,
  },

  onLoad() {
    // 设置右上角退出按钮
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    });
  },

  onShow() {
    if (!ensureLogin()) return;
    const profile = wx.getStorageSync('merchant_profile') || {};
    this.setData({ merchantName: profile.name || '商家' });
    this.refresh();
  },

  onShareAppMessage() {
    // 隐藏分享按钮，使用自定义菜单
    return {
      title: '商家端',
      path: '/pages/home/index'
    };
  },

  onPullDownRefresh() {
    this.refresh().finally(() => wx.stopPullDownRefresh());
  },

  onSortChange(e) {
    const idx = Number((e.detail && e.detail.value) || 0);
    this.setData({ sortIndex: idx });
    this.refresh();
  },

  async refresh() {
    if (!ensureLogin()) return;
    this.setData({ page: 1, items: [], hasMore: true });
    await this.fetchList(true);
  },

  async loadMore() {
    await this.fetchList(false);
  },

  async fetchList(isFirstPage) {
    const { page, size, sortIndex, sortOptions, loading, hasMore } = this.data;
    if (loading) return;
    if (!isFirstPage && !hasMore) return;

    this.setData({ loading: true });
    try {
      const sort = sortOptions[sortIndex].value;
      const res = await merchantMallItemListApi({ page, size, sort });

      const list = (res.data && (res.data.list || res.data.items || res.data.records)) || res.data || [];
      const next = Array.isArray(list) ? list : [];

      const merged = isFirstPage ? next : this.data.items.concat(next);
      const noMore = next.length < size;

      this.setData({
        items: merged,
        page: page + 1,
        hasMore: !noMore,
      });
    } catch (e) {
      console.log('fetch mall items failed', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  onLogout() {
    wx.removeStorageSync('merchant_token');
    wx.removeStorageSync('merchant_profile');
    wx.reLaunch({ url: '/pages/login/index' });
  },
});


